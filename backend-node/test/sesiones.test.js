// Pruebas de la validación del cuerpo de una sesión y del resumen (contrato §7). No usan MongoDB.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { calcularResumen, validarCuerpoSesion } from '../src/servicios/sesiones.js'

const AHORA = '2026-09-30T12:00:00'

function cuerpoValido() {
  return {
    rutinaId: 3,
    fechaInicio: '2026-09-14T18:30:00',
    duracionMinutos: 55,
    registros: [
      { ejercicioId: 1, series: [{ pesoKg: 55, repeticiones: 5 }, { pesoKg: 57.5, repeticiones: 5 }] },
      { ejercicioId: 23, series: [{ pesoKg: 25, repeticiones: 12 }] },
    ],
  }
}

function validar(cuerpo, conRutina = true) {
  return validarCuerpoSesion(cuerpo, { conRutina, ahora: AHORA })
}

describe('validarCuerpoSesion', () => {
  test('un cuerpo válido no tiene errores', () => {
    assert.deepEqual(validar(cuerpoValido()), {})
  })

  test('en PUT no se pide rutinaId', () => {
    const { rutinaId, ...cuerpo } = cuerpoValido()
    assert.deepEqual(validar(cuerpo, false), {})
    assert.ok(validar(cuerpo, true).rutinaId)
  })

  test('la fecha no puede ser futura ni tener otro formato', () => {
    assert.equal(validar({ ...cuerpoValido(), fechaInicio: '2026-10-01T08:00:00' }).fechaInicio, 'no puede ser futura')
    assert.ok(validar({ ...cuerpoValido(), fechaInicio: '2026-09-14' }).fechaInicio)
    assert.ok(validar({ ...cuerpoValido(), fechaInicio: '2026-02-30T10:00:00' }).fechaInicio)
  })

  test('la duración va de 1 a 600 minutos', () => {
    assert.ok(validar({ ...cuerpoValido(), duracionMinutos: 0 }).duracionMinutos)
    assert.ok(validar({ ...cuerpoValido(), duracionMinutos: 601 }).duracionMinutos)
    assert.ok(validar({ ...cuerpoValido(), duracionMinutos: 30.5 }).duracionMinutos)
  })

  test('los registros van de 1 a 15 y sin ejercicios repetidos', () => {
    assert.ok(validar({ ...cuerpoValido(), registros: [] }).registros)
    const repetido = cuerpoValido()
    repetido.registros[1].ejercicioId = 1
    assert.equal(validar(repetido)['registros[1].ejercicioId'], 'está repetido')
  })

  test('las series usan la ruta del campo como clave', () => {
    const cuerpo = cuerpoValido()
    cuerpo.registros[0].series[1] = { pesoKg: 500.5, repeticiones: 0 }
    cuerpo.registros[1].series[0].pesoKg = 20.125
    assert.deepEqual(validar(cuerpo), {
      'registros[0].series[1].pesoKg': 'debe estar entre 0 y 500',
      'registros[0].series[1].repeticiones': 'debe ser un entero entre 1 y 100',
      'registros[1].series[0].pesoKg': 'admite máximo 2 decimales',
    })
  })

  test('un cuerpo vacío no revienta', () => {
    const campos = validar(undefined)
    assert.ok(campos.rutinaId && campos.fechaInicio && campos.duracionMinutos && campos.registros)
  })
})

describe('calcularResumen', () => {
  test('el ejemplo del contrato: 2 ejercicios, 7 series, 50 repeticiones, 1935 kg y 1 récord', () => {
    const serie = (pesoKg, repeticiones, esRecord = false) => ({ pesoKg, repeticiones, esRecord })
    const registros = [
      { series: [serie(55, 5), serie(57.5, 5), serie(60, 5), serie(62.5, 4, true)] },
      { series: [serie(25, 12), serie(27.5, 10), serie(27.5, 9)] },
    ]
    assert.deepEqual(calcularResumen(registros), { ejercicios: 2, series: 7, repeticiones: 50, volumenKg: 1935, records: 1 })
  })
})
