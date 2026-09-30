// Reglas de negocio de las sesiones de entrenamiento (contrato §7, reglas R4, R5 y R7).
import { ErrorApi } from '../errores.js'
import Sesion from '../modelos/Sesion.js'
import { obtenerRutina } from './cuentas.js'
import { recalcularVarios } from './records.js'

const FORMATO_FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
const FORMATO_OBJECT_ID = /^[0-9a-f]{24}$/i

// ---------- Validación (funciones puras) ----------

function esEnteroEntre(valor, minimo, maximo) {
  return Number.isInteger(valor) && valor >= minimo && valor <= maximo
}

// Máximo 2 decimales: 57.5 y 57.25 sí; 57.125 no
function tieneMaximoDosDecimales(valor) {
  return Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-9
}

// Fecha y hora actual en Colombia, en el mismo formato del contrato: 2026-09-30T18:30:00
export function ahoraEnColombia() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Bogota' }).replace(' ', 'T')
}

// Comprueba que el texto sea una fecha y hora real (no 2026-02-30T25:00:00)
function esFechaHoraValida(texto) {
  if (typeof texto !== 'string' || !FORMATO_FECHA_HORA.test(texto)) return false
  const fecha = new Date(`${texto}Z`)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 19) === texto
}

// Valida el cuerpo de POST (conRutina: true) o de PUT (conRutina: false).
// Devuelve los campos con error, con la ruta del contrato (§10) como clave; vacío si todo está bien.
export function validarCuerpoSesion(cuerpo, { conRutina, ahora = ahoraEnColombia() }) {
  const campos = {}
  const datos = cuerpo && typeof cuerpo === 'object' ? cuerpo : {}

  if (conRutina && !(Number.isInteger(datos.rutinaId) && datos.rutinaId > 0)) {
    campos.rutinaId = 'es requerida'
  }

  if (!esFechaHoraValida(datos.fechaInicio)) {
    campos.fechaInicio = 'debe tener el formato AAAA-MM-DDTHH:mm:ss'
  } else if (datos.fechaInicio > ahora) {
    campos.fechaInicio = 'no puede ser futura'
  }

  if (!esEnteroEntre(datos.duracionMinutos, 1, 600)) {
    campos.duracionMinutos = 'debe ser un entero entre 1 y 600'
  }

  const registros = datos.registros
  if (!Array.isArray(registros) || registros.length < 1 || registros.length > 15) {
    campos.registros = 'debe tener entre 1 y 15 ejercicios'
    return campos
  }

  const vistos = new Set()
  registros.forEach((registro, i) => {
    const ruta = `registros[${i}]`
    const ejercicioId = registro?.ejercicioId
    if (!(Number.isInteger(ejercicioId) && ejercicioId > 0)) {
      campos[`${ruta}.ejercicioId`] = 'es requerido'
    } else if (vistos.has(ejercicioId)) {
      campos[`${ruta}.ejercicioId`] = 'está repetido'
    } else {
      vistos.add(ejercicioId)
    }

    const series = registro?.series
    if (!Array.isArray(series) || series.length < 1 || series.length > 20) {
      campos[`${ruta}.series`] = 'debe tener entre 1 y 20 series'
      return
    }
    series.forEach((serie, j) => {
      const pesoKg = serie?.pesoKg
      if (typeof pesoKg !== 'number' || pesoKg < 0 || pesoKg > 500) {
        campos[`${ruta}.series[${j}].pesoKg`] = 'debe estar entre 0 y 500'
      } else if (!tieneMaximoDosDecimales(pesoKg)) {
        campos[`${ruta}.series[${j}].pesoKg`] = 'admite máximo 2 decimales'
      }
      if (!esEnteroEntre(serie?.repeticiones, 1, 100)) {
        campos[`${ruta}.series[${j}].repeticiones`] = 'debe ser un entero entre 1 y 100'
      }
    })
  })

  return campos
}

function lanzarSiHayErrores(campos) {
  if (Object.keys(campos).length > 0) {
    throw new ErrorApi(400, 'VALIDACION_FALLIDA', 'Hay campos con errores', campos)
  }
}

// Solo se guardan peso y repeticiones; numero lo asigna el servidor y esRecord lo calcula R6
function armarSeries(series) {
  return series.map((serie, j) => ({ numero: j + 1, pesoKg: serie.pesoKg, repeticiones: serie.repeticiones, esRecord: false }))
}

// ---------- Respuestas (contrato §7, modelo SesionDetalle) ----------

function redondear(valor) {
  return Math.round(valor * 100) / 100
}

function volumen(series) {
  return redondear(series.reduce((total, serie) => total + serie.pesoKg * serie.repeticiones, 0))
}

export function calcularResumen(registros) {
  const series = registros.flatMap((registro) => registro.series)
  return {
    ejercicios: registros.length,
    series: series.length,
    repeticiones: series.reduce((total, serie) => total + serie.repeticiones, 0),
    volumenKg: volumen(series),
    records: series.filter((serie) => serie.esRecord).length,
  }
}

// Recibe la sesión como objeto plano (.lean() o .toObject())
function aResumen(sesion) {
  return {
    id: String(sesion._id),
    rutina: sesion.rutina,
    fechaInicio: sesion.fechaInicio,
    duracionMinutos: sesion.duracionMinutos,
    resumen: calcularResumen(sesion.registros),
  }
}

function aDetalle(sesion) {
  const registros = [...sesion.registros].sort((a, b) => a.orden - b.orden)
  return {
    ...aResumen(sesion),
    registros: registros.map((registro) => ({
      orden: registro.orden,
      ejercicio: registro.ejercicio,
      volumenKg: volumen(registro.series),
      series: registro.series,
    })),
  }
}

// ---------- Operaciones ----------

// Busca una sesión del usuario; un id mal formado o de otro usuario responde igual que uno inexistente
async function buscarSesion(usuarioId, id) {
  const sesion = FORMATO_OBJECT_ID.test(id) ? await Sesion.findOne({ _id: id, usuarioId }) : null
  if (!sesion) throw new ErrorApi(404, 'SESION_NO_ENCONTRADA', 'La sesión no existe')
  return sesion
}

// Relee la sesión después del recálculo, para devolver los récords ya actualizados
async function detallePorId(usuarioId, id) {
  const sesion = await Sesion.findOne({ _id: id, usuarioId }).lean()
  return aDetalle(sesion)
}

export async function listarSesiones(usuarioId) {
  const sesiones = await Sesion.find({ usuarioId }).sort({ fechaInicio: -1, _id: -1 }).lean()
  return sesiones.map(aResumen)
}

export async function obtenerSesion(usuarioId, id) {
  const sesion = await buscarSesion(usuarioId, id)
  return aDetalle(sesion.toObject())
}

// POST /sesiones: valida, consulta la rutina al servicio de cuentas, guarda y recalcula récords (R4)
export async function registrarSesion(usuario, cuerpo, autorizacion) {
  lanzarSiHayErrores(validarCuerpoSesion(cuerpo, { conRutina: true }))

  const rutina = await obtenerRutina(cuerpo.rutinaId, autorizacion)
  if (!rutina || !rutina.activa) {
    lanzarSiHayErrores({ rutinaId: 'la rutina no existe o fue eliminada' })
  }

  const ejerciciosRutina = new Map(rutina.ejercicios.map((item) => [item.ejercicio.id, item.ejercicio]))
  const campos = {}
  cuerpo.registros.forEach((registro, i) => {
    const ejercicio = ejerciciosRutina.get(registro.ejercicioId)
    if (!ejercicio) campos[`registros[${i}].ejercicioId`] = 'no está en la rutina'
    else if (!ejercicio.activo) campos[`registros[${i}].ejercicioId`] = 'el ejercicio fue eliminado'
  })
  lanzarSiHayErrores(campos)

  const sesion = await Sesion.create({
    usuarioId: usuario.id,
    // Copia de los nombres al momento de registrar (DM-09)
    rutina: { id: rutina.id, nombre: rutina.nombre },
    fechaInicio: cuerpo.fechaInicio,
    duracionMinutos: cuerpo.duracionMinutos,
    registros: cuerpo.registros.map((registro, i) => {
      const ejercicio = ejerciciosRutina.get(registro.ejercicioId)
      return {
        orden: i + 1,
        ejercicio: { id: ejercicio.id, nombre: ejercicio.nombre, grupoMuscular: ejercicio.grupoMuscular },
        series: armarSeries(registro.series),
      }
    }),
  })

  await recalcularVarios(usuario.id, cuerpo.registros.map((registro) => registro.ejercicioId))
  return detallePorId(usuario.id, sesion._id)
}

// PUT /sesiones/{id}: corrige fecha, duración y series, sin tocar los ejercicios (R5)
export async function corregirSesion(usuarioId, id, cuerpo) {
  const sesion = await buscarSesion(usuarioId, id)
  lanzarSiHayErrores(validarCuerpoSesion(cuerpo, { conRutina: false }))

  const actuales = sesion.registros.map((registro) => registro.ejercicio.id)
  const enviados = cuerpo.registros.map((registro) => registro.ejercicioId)
  const mismos = actuales.length === enviados.length && actuales.every((ejercicioId) => enviados.includes(ejercicioId))
  if (!mismos) {
    throw new ErrorApi(400, 'VALIDACION_FALLIDA', 'Los ejercicios deben ser exactamente los que ya tiene la sesión', {
      registros: 'no se pueden agregar ni quitar ejercicios',
    })
  }

  sesion.fechaInicio = cuerpo.fechaInicio
  sesion.duracionMinutos = cuerpo.duracionMinutos
  for (const registro of sesion.registros) {
    const enviado = cuerpo.registros.find((r) => r.ejercicioId === registro.ejercicio.id)
    registro.series = armarSeries(enviado.series)
  }
  await sesion.save()

  await recalcularVarios(usuarioId, actuales)
  return detallePorId(usuarioId, sesion._id)
}

// DELETE /sesiones/{id}: borrado físico y recálculo de los récords de sus ejercicios
export async function eliminarSesion(usuarioId, id) {
  const sesion = await buscarSesion(usuarioId, id)
  await sesion.deleteOne()
  await recalcularVarios(
    usuarioId,
    sesion.registros.map((registro) => registro.ejercicio.id),
  )
}

// GET /sesiones/ultimos-registros?rutinaId=: la última vez y el récord de cada ejercicio de la rutina
export async function ultimosRegistros(usuarioId, rutinaIdTexto, autorizacion) {
  const rutinaId = Number(rutinaIdTexto)
  if (!(Number.isInteger(rutinaId) && rutinaId > 0)) {
    throw new ErrorApi(400, 'VALIDACION_FALLIDA', 'Hay campos con errores', { rutinaId: 'es requerida' })
  }
  const rutina = await obtenerRutina(rutinaId, autorizacion)
  if (!rutina) throw new ErrorApi(404, 'RUTINA_NO_ENCONTRADA', 'La rutina no existe')

  const items = [...rutina.ejercicios].sort((a, b) => a.orden - b.orden)
  return Promise.all(
    items.map(async ({ ejercicio }) => {
      const [ultima, conRecord] = await Promise.all([
        Sesion.findOne({ usuarioId, 'registros.ejercicio.id': ejercicio.id }).sort({ fechaInicio: -1, _id: -1 }).lean(),
        // El récord vigente es el último que se marcó: cada récord supera al anterior
        Sesion.findOne({ usuarioId, registros: { $elemMatch: { 'ejercicio.id': ejercicio.id, 'series.esRecord': true } } })
          .sort({ fechaInicio: -1, _id: -1 })
          .lean(),
      ])
      const registroRecord = conRecord?.registros.find((registro) => registro.ejercicio.id === ejercicio.id)
      const serieRecord = registroRecord?.series.find((serie) => serie.esRecord)
      const registroUltimo = ultima?.registros.find((registro) => registro.ejercicio.id === ejercicio.id)
      return {
        ejercicioId: ejercicio.id,
        recordKg: serieRecord ? serieRecord.pesoKg : null,
        fechaInicio: ultima ? ultima.fechaInicio : null,
        series: registroUltimo
          ? registroUltimo.series.map(({ numero, pesoKg, repeticiones }) => ({ numero, pesoKg, repeticiones }))
          : [],
      }
    }),
  )
}
