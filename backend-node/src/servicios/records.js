// Regla de récords personales R6 (MODELO-DATOS §7.1). calcularRecords es una función pura (no toca
// la base de datos); recalcularRecords la aplica sobre las sesiones guardadas en MongoDB.
import Sesion from '../modelos/Sesion.js'

// Recibe las series de UN ejercicio en cada sesión del usuario, ya en orden cronológico
// (por fechaInicio y, a igual fecha, por _id): [{ series: [{ numero, pesoKg }] }, ...].
// Devuelve, en el mismo orden, el numero de la serie récord de cada sesión, o null si no tuvo.
export function calcularRecords(sesiones) {
  let maximoPrevio = 0
  return sesiones.map(({ series }) => {
    const maximoSesion = Math.max(0, ...series.map((serie) => serie.pesoKg))
    // Empatar no es superar, y con 0 kg nunca se supera el máximo previo inicial
    if (maximoSesion <= maximoPrevio) return null
    maximoPrevio = maximoSesion
    // Solo la primera serie (menor numero) con el peso más alto
    const conMaximo = series.filter((serie) => serie.pesoKg === maximoSesion)
    return Math.min(...conMaximo.map((serie) => serie.numero))
  })
}

// Recalcula los récords de un ejercicio en todo el historial del usuario y guarda solo las sesiones
// que cambiaron. Es idempotente: si una ejecución falla a mitad, la siguiente deja todo bien (DEC-18).
export async function recalcularRecords(usuarioId, ejercicioId) {
  const sesiones = await Sesion.find({ usuarioId, 'registros.ejercicio.id': ejercicioId }).sort({ fechaInicio: 1, _id: 1 })
  const registros = sesiones.map((sesion) => sesion.registros.find((registro) => registro.ejercicio.id === ejercicioId))
  const records = calcularRecords(registros)

  await Promise.all(
    sesiones.map((sesion, i) => {
      let cambio = false
      for (const serie of registros[i].series) {
        const esRecord = serie.numero === records[i]
        if (serie.esRecord !== esRecord) {
          serie.esRecord = esRecord
          cambio = true
        }
      }
      return cambio ? sesion.save() : null
    }),
  )
}

// Recalcula los récords de varios ejercicios, uno tras otro (después de registrar, corregir o eliminar)
export async function recalcularVarios(usuarioId, ejercicioIds) {
  for (const ejercicioId of ejercicioIds) {
    await recalcularRecords(usuarioId, ejercicioId)
  }
}

// Récord vigente de cada ejercicio: entre todas las series marcadas como récord, la de mayor peso.
// Como cada récord supera al anterior, coincide con el último que se marcó. Función pura: recibe las
// sesiones del usuario como objetos planos y devuelve la lista del contrato (§8), ordenada por nombre.
export function elegirRecordsVigentes(sesiones) {
  const porEjercicio = new Map()
  for (const sesion of sesiones) {
    for (const registro of sesion.registros) {
      for (const serie of registro.series) {
        if (!serie.esRecord) continue
        const actual = porEjercicio.get(registro.ejercicio.id)
        if (actual && actual.pesoKg >= serie.pesoKg) continue
        const { id, nombre, grupoMuscular } = registro.ejercicio
        porEjercicio.set(id, {
          ejercicio: { id, nombre, grupoMuscular },
          pesoKg: serie.pesoKg,
          repeticiones: serie.repeticiones,
          fechaInicio: sesion.fechaInicio,
          sesionId: String(sesion._id),
        })
      }
    }
  }
  return [...porEjercicio.values()].sort((a, b) => a.ejercicio.nombre.localeCompare(b.ejercicio.nombre, 'es'))
}

// GET /records: solo hacen falta las sesiones que tienen alguna serie récord
export async function listarRecords(usuarioId) {
  const sesiones = await Sesion.find({ usuarioId, 'registros.series.esRecord': true }).lean()
  return elegirRecordsVigentes(sesiones)
}
