// Reglas de negocio del peso corporal (contrato §9, historias H21, H22 y H24).
import { ErrorApi } from '../errores.js'
import RegistroPeso from '../modelos/RegistroPeso.js'

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/
const FORMATO_OBJECT_ID = /^[0-9a-f]{24}$/i

// ---------- Validación (funciones puras) ----------

// Hoy en Colombia, en el formato del contrato: 2026-10-14
export function hoyEnColombia() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Bogota' })
}

// Máximo 2 decimales: 77.9 y 77.25 sí; 77.125 no
function tieneMaximoDosDecimales(valor) {
  return Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-9
}

// Comprueba que el texto sea una fecha real (no 2026-02-30)
function esFechaValida(texto) {
  if (typeof texto !== 'string' || !FORMATO_FECHA.test(texto)) return false
  const fecha = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto
}

// Valida el cuerpo de POST y de PUT, que son iguales (contrato §9).
// Devuelve los campos con error; vacío si todo está bien.
export function validarCuerpoPeso(cuerpo, { hoy = hoyEnColombia() } = {}) {
  const campos = {}
  const datos = cuerpo && typeof cuerpo === 'object' ? cuerpo : {}

  if (!esFechaValida(datos.fecha)) {
    campos.fecha = 'debe tener el formato AAAA-MM-DD'
  } else if (datos.fecha > hoy) {
    campos.fecha = 'no puede ser futura'
  }

  if (typeof datos.pesoKg !== 'number' || !Number.isFinite(datos.pesoKg) || datos.pesoKg < 20 || datos.pesoKg > 350) {
    campos.pesoKg = 'debe estar entre 20 y 350'
  } else if (!tieneMaximoDosDecimales(datos.pesoKg)) {
    campos.pesoKg = 'admite máximo 2 decimales'
  }

  return campos
}

function lanzarSiHayErrores(campos) {
  if (Object.keys(campos).length > 0) {
    throw new ErrorApi(400, 'VALIDACION_FALLIDA', 'Hay campos con errores', campos)
  }
}

// El índice único (usuarioId, fecha) impide dos registros el mismo día: Mongo responde 11000 (MODELO-DATOS §5)
function lanzarSiFechaRepetida(error) {
  if (error?.code === 11000) {
    throw new ErrorApi(409, 'PESO_YA_REGISTRADO', 'Ya hay un registro de peso en esa fecha')
  }
  throw error
}

// ---------- Operaciones ----------

function aRespuesta(registro) {
  return { id: String(registro._id), fecha: registro.fecha, pesoKg: registro.pesoKg }
}

// Un id mal formado o de otro usuario responde igual que uno inexistente (regla R10)
async function buscarRegistro(usuarioId, id) {
  const registro = FORMATO_OBJECT_ID.test(id) ? await RegistroPeso.findOne({ _id: id, usuarioId }) : null
  if (!registro) throw new ErrorApi(404, 'REGISTRO_PESO_NO_ENCONTRADO', 'El registro de peso no existe')
  return registro
}

// GET /peso-corporal: del más antiguo al más reciente, que es el orden que necesita la gráfica
export async function listarRegistros(usuarioId) {
  const registros = await RegistroPeso.find({ usuarioId }).sort({ fecha: 1, _id: 1 }).lean()
  return registros.map(aRespuesta)
}

export async function registrarPeso(usuarioId, cuerpo) {
  lanzarSiHayErrores(validarCuerpoPeso(cuerpo))
  try {
    const registro = await RegistroPeso.create({ usuarioId, fecha: cuerpo.fecha, pesoKg: cuerpo.pesoKg })
    return aRespuesta(registro)
  } catch (error) {
    lanzarSiFechaRepetida(error)
  }
}

// PUT /peso-corporal/{id}: reemplaza la fecha y el peso del registro (historia H24)
export async function corregirPeso(usuarioId, id, cuerpo) {
  const registro = await buscarRegistro(usuarioId, id)
  lanzarSiHayErrores(validarCuerpoPeso(cuerpo))
  registro.fecha = cuerpo.fecha
  registro.pesoKg = cuerpo.pesoKg
  try {
    await registro.save()
  } catch (error) {
    lanzarSiFechaRepetida(error)
  }
  return aRespuesta(registro)
}

// DELETE /peso-corporal/{id}: borrado físico (regla R3)
export async function eliminarPeso(usuarioId, id) {
  const registro = await buscarRegistro(usuarioId, id)
  await registro.deleteOne()
}