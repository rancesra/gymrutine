// Pruebas del progreso por ejercicio (contrato §8 y casos de T9 en el plan de trabajo). No usan MongoDB.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { armarProgreso, resumirEjercicios } from '../src/servicios/progreso.js'

const press = { id: 1, nombre: 'Press de banca con barra', grupoMuscular: 'PECHO' }
const triceps = { id: 23, nombre: 'Extensión de tríceps en polea', grupoMuscular: 'TRICEPS' }
const serie = (pesoKg, repeticiones, esRecord = false) => ({ pesoKg, repeticiones, esRecord })
const sesion = (_id, fechaInicio, registros) => ({ _id, fechaInicio, registros })

// Las tres sesiones del ejemplo del contrato §8, a propósito en desorden
const s14 = sesion('s3', '2026-09-14T18:30:00', [
  { ejercicio: press, series: [serie(55, 5), serie(57.5, 5), serie(60, 5), serie(62.5, 4, true)] },
  { ejercicio: triceps, series: [serie(25, 12), serie(27.5, 10), serie(27.5, 9)] },
])
const s07 = sesion('s1', '2026-09-07T18:10:00', [
  { ejercicio: press, series: [serie(50, 5), serie(55, 5), serie(55, 5), serie(60, 5, true)] },
])
const s10 = sesion('s2', '2026-09-10T18:00:00', [
  { ejercicio: press, series: [serie(55, 5), serie(57.5, 5), serie(60, 5), serie(60, 5)] },
  { ejercicio: triceps, series: [serie(25, 12, true)] },
])

describe('resumirEjercicios', () => {
  test('sin sesiones devuelve una lista vacía', () => {
    assert.deepEqual(resumirEjercicios([]), [])
  })

  test('cada ejercicio con historial y en cuántas sesiones aparece, ordenados por nombre', () => {
    assert.deepEqual(resumirEjercicios([s14, s07, s10]), [
      { id: 23, nombre: 'Extensión de tríceps en polea', grupoMuscular: 'TRICEPS', sesiones: 2 },
      { id: 1, nombre: 'Press de banca con barra', grupoMuscular: 'PECHO', sesiones: 3 },
    ])
  })

  test('si el ejercicio cambió de nombre, se usa la copia de la sesión más reciente', () => {
    const renombrado = { ...press, nombre: 'Press de banca' }
    const nueva = sesion('s9', '2026-10-01T18:00:00', [{ ejercicio: renombrado, series: [serie(60, 5)] }])
    assert.equal(resumirEjercicios([nueva, s07]).find((e) => e.id === 1).nombre, 'Press de banca')
  })
})

describe('armarProgreso', () => {
  test('el ejemplo del contrato: un punto por sesión, en orden cronológico aunque lleguen en desorden', () => {
    assert.deepEqual(armarProgreso([s14, s07, s10], 1), {
      ejercicio: press,
      puntos: [
        { sesionId: 's1', fechaInicio: '2026-09-07T18:10:00', pesoMaximoKg: 60, volumenKg: 1100, esRecord: true },
        { sesionId: 's2', fechaInicio: '2026-09-10T18:00:00', pesoMaximoKg: 60, volumenKg: 1162.5, esRecord: false },
        { sesionId: 's3', fechaInicio: '2026-09-14T18:30:00', pesoMaximoKg: 62.5, volumenKg: 1112.5, esRecord: true },
      ],
    })
  })

  test('el volumen es la suma de peso × repeticiones de ese ejercicio en esa sesión', () => {
    assert.deepEqual(armarProgreso([s14], 23).puntos.map((p) => p.volumenKg), [822.5])
  })

  test('las sesiones que no tienen el ejercicio no dan punto', () => {
    assert.deepEqual(armarProgreso([s14, s07, s10], 23).puntos.map((p) => p.sesionId), ['s2', 's3'])
  })

  test('a igual fecha, ordena por id, como la regla de récords', () => {
    const a = sesion('a1', '2026-09-20T18:00:00', [{ ejercicio: press, series: [serie(40, 5)] }])
    const b = sesion('b2', '2026-09-20T18:00:00', [{ ejercicio: press, series: [serie(45, 5)] }])
    assert.deepEqual(armarProgreso([b, a], 1).puntos.map((p) => p.sesionId), ['a1', 'b2'])
  })

  test('un ejercicio sin registros devuelve null (la API responde 404)', () => {
    assert.equal(armarProgreso([s14, s07, s10], 99), null)
    assert.equal(armarProgreso([], 1), null)
  })
})
