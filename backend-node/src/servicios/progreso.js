// Progreso por ejercicio (contrato §8, historia H20). Solo lee: los récords ya vienen marcados en cada
// serie por recalcularRecords. El nombre y el grupo de cada ejercicio salen de la copia guardada en las
// sesiones, así que también aparecen los ejercicios propios que después se eliminaron del catálogo.
import { ErrorApi } from '../errores.js'
import Sesion from '../modelos/Sesion.js'

// ---------- Funciones puras ----------

function redondear(valor) {
  return Math.round(valor * 100) / 100
}

// Orden cronológico: por fechaInicio y, a igual fecha, por _id (el mismo de la regla de récords)
function cronologico(a, b) {
  return a.fechaInicio.localeCompare(b.fechaInicio) || String(a._id).localeCompare(String(b._id))
}

// GET /progreso/ejercicios: cada ejercicio que aparece en las sesiones, con en cuántas sesiones está.
// Si el nombre de un ejercicio cambió con el tiempo, se usa la copia de la sesión más reciente.
export function resumirEjercicios(sesiones) {
  const porEjercicio = new Map()
  for (const sesion of [...sesiones].sort(cronologico)) {
    for (const { ejercicio } of sesion.registros) {
      const anterior = porEjercicio.get(ejercicio.id)
      porEjercicio.set(ejercicio.id, {
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        grupoMuscular: ejercicio.grupoMuscular,
        sesiones: (anterior?.sesiones ?? 0) + 1,
      })
    }
  }
  return [...porEjercicio.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

// GET /progreso/ejercicios/{id}: un punto por sesión, en orden cronológico. null si no hay registros.
export function armarProgreso(sesiones, ejercicioId) {
  const puntos = []
  let ejercicio = null
  for (const sesion of [...sesiones].sort(cronologico)) {
    const registro = sesion.registros.find((r) => r.ejercicio.id === ejercicioId)
    if (!registro) continue
    const { id, nombre, grupoMuscular } = registro.ejercicio
    ejercicio = { id, nombre, grupoMuscular } // queda la copia de la sesión más reciente
    puntos.push({
      sesionId: String(sesion._id),
      fechaInicio: sesion.fechaInicio,
      pesoMaximoKg: Math.max(...registro.series.map((serie) => serie.pesoKg)),
      volumenKg: redondear(registro.series.reduce((total, serie) => total + serie.pesoKg * serie.repeticiones, 0)),
      esRecord: registro.series.some((serie) => serie.esRecord),
    })
  }
  return ejercicio ? { ejercicio, puntos } : null
}

// ---------- Consultas ----------

export async function listarEjerciciosConHistorial(usuarioId) {
  // Para el selector basta con la copia del ejercicio de cada registro, sin las series
  const sesiones = await Sesion.find({ usuarioId }).select('fechaInicio registros.ejercicio').lean()
  return resumirEjercicios(sesiones)
}

export async function progresoEjercicio(usuarioId, idTexto) {
  const ejercicioId = Number(idTexto)
  const sesiones = Number.isInteger(ejercicioId)
    ? await Sesion.find({ usuarioId, 'registros.ejercicio.id': ejercicioId }).lean()
    : []
  const progreso = armarProgreso(sesiones, ejercicioId)
  if (!progreso) throw new ErrorApi(404, 'EJERCICIO_NO_ENCONTRADO', 'No tienes registros de este ejercicio')
  return progreso
}
