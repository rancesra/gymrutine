// Pruebas de la validación del cuerpo de un registro de peso (contrato §9). No usan MongoDB.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { validarCuerpoPeso } from '../src/servicios/pesoCorporal.js'

const HOY = '2026-10-14'

function validar(cuerpo) {
  return validarCuerpoPeso(cuerpo, { hoy: HOY })
}

describe('validarCuerpoPeso: fecha', () => {
  test('un cuerpo correcto no tiene errores', () => {
    assert.deepEqual(validar({ fecha: '2026-10-13', pesoKg: 77.9 }), {})
  })

  test('la fecha de hoy sí vale', () => {
    assert.deepEqual(validar({ fecha: HOY, pesoKg: 77.9 }), {})
  })

  test('una fecha futura no vale', () => {
    assert.equal(validar({ fecha: '2026-10-15', pesoKg: 77.9 }).fecha, 'no puede ser futura')
  })

  test('sin fecha, con otro formato o con un día que no existe, se pide el formato', () => {
    for (const fecha of [undefined, '14-10-2026', '2026-2-14', '2026-02-30', 20261014]) {
      assert.equal(validar({ fecha, pesoKg: 77.9 }).fecha, 'debe tener el formato AAAA-MM-DD')
    }
  })
})

describe('validarCuerpoPeso: pesoKg', () => {
  test('acepta los extremos del rango', () => {
    assert.deepEqual(validar({ fecha: HOY, pesoKg: 20 }), {})
    assert.deepEqual(validar({ fecha: HOY, pesoKg: 350 }), {})
  })

  test('fuera del rango, sin peso o con texto, se pide el rango', () => {
    for (const pesoKg of [19.99, 350.01, undefined, '77.9', NaN]) {
      assert.equal(validar({ fecha: HOY, pesoKg }).pesoKg, 'debe estar entre 20 y 350')
    }
  })

  test('acepta hasta 2 decimales y rechaza 3', () => {
    assert.deepEqual(validar({ fecha: HOY, pesoKg: 77.25 }), {})
    assert.equal(validar({ fecha: HOY, pesoKg: 77.125 }).pesoKg, 'admite máximo 2 decimales')
  })
})

describe('validarCuerpoPeso: cuerpo entero', () => {
  test('un cuerpo vacío reporta los dos campos', () => {
    assert.deepEqual(validar({}), {
      fecha: 'debe tener el formato AAAA-MM-DD',
      pesoKg: 'debe estar entre 20 y 350',
    })
  })

  test('sin cuerpo tampoco se cae', () => {
    assert.deepEqual(Object.keys(validar(undefined)).sort(), ['fecha', 'pesoKg'])
  })
})