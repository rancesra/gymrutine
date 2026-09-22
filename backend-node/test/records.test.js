// Pruebas de la regla de récords R6 (MODELO-DATOS §7.1): los 8 casos de la tabla y el ejemplo S1 a S4.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { calcularRecords } from '../src/servicios/records.js'

// Arma una sesión a partir de sus pesos: sesion(40, 45) → series 1 y 2 con 40 y 45 kg
function sesion(...pesos) {
  return { series: pesos.map((pesoKg, i) => ({ numero: i + 1, pesoKg })) }
}

describe('calcularRecords: casos de la regla', () => {
  test('la primera vez que se hace el ejercicio, con peso mayor que 0, es récord', () => {
    assert.deepEqual(calcularRecords([sesion(40)]), [1])
  })

  test('el mismo peso que el récord vigente no es récord', () => {
    assert.deepEqual(calcularRecords([sesion(40), sesion(40)]), [1, null])
  })

  test('con dos series del mismo peso máximo, solo la primera es récord', () => {
    assert.deepEqual(calcularRecords([sesion(42.5, 42.5)]), [1])
  })

  test('si varias series superan el récord en la misma sesión, solo la más pesada lo es', () => {
    assert.deepEqual(calcularRecords([sesion(40), sesion(42.5, 45, 47.5, 45)]), [1, 3])
  })

  test('una serie con 0 kg nunca es récord', () => {
    assert.deepEqual(calcularRecords([sesion(0), sesion(0, 0)]), [null, null])
  })

  test('una sesión con fecha anterior y más peso es récord y se lo quita a la posterior', () => {
    // Antes: solo existía la del 10-sep con 50 kg
    assert.deepEqual(calcularRecords([sesion(50)]), [1])
    // Se registra una del 05-sep con 55 kg: en orden cronológico va primero
    assert.deepEqual(calcularRecords([sesion(55), sesion(50)]), [1, null])
  })

  test('al eliminar la sesión que tenía el récord, una posterior puede pasar a serlo', () => {
    assert.deepEqual(calcularRecords([sesion(40), sesion(50), sesion(45)]), [1, 1, null])
    // Sin la de 50 kg, la de 45 supera los 40
    assert.deepEqual(calcularRecords([sesion(40), sesion(45)]), [1, 1])
  })

  test('al corregir a la baja la serie récord, la sesión puede perderlo y una posterior ganarlo', () => {
    assert.deepEqual(calcularRecords([sesion(40), sesion(50), sesion(45)]), [1, 1, null])
    // La de 50 kg se corrige a 42,5: ya no es récord frente a la de 45
    assert.deepEqual(calcularRecords([sesion(40), sesion(42.5), sesion(45)]), [1, 1, 1])
    // Corregida a 40: empata, y la de 45 gana el récord
    assert.deepEqual(calcularRecords([sesion(40), sesion(40), sesion(45)]), [1, null, 1])
  })
})

describe('calcularRecords: detalles', () => {
  test('sin sesiones devuelve una lista vacía', () => {
    assert.deepEqual(calcularRecords([]), [])
  })

  test('elige la serie de menor numero aunque las series no lleguen en orden', () => {
    const desordenada = {
      series: [
        { numero: 3, pesoKg: 50 },
        { numero: 1, pesoKg: 45 },
        { numero: 2, pesoKg: 50 },
      ],
    }
    assert.deepEqual(calcularRecords([desordenada]), [2])
  })

  test('una sesión en 0 kg no rompe la cadena: la siguiente con peso es récord', () => {
    assert.deepEqual(calcularRecords([sesion(0), sesion(20)]), [null, 1])
  })
})

// Ejemplo de MODELO-DATOS §7.1: Press de banca con barra
describe('calcularRecords: ejemplo del modelo de datos', () => {
  const s1 = sesion(40, 45, 45) // 01-sep
  const s2 = sesion(45, 45) // 04-sep
  const s3 = sesion(47.5, 50, 50) // 08-sep
  const s4 = sesion(40) // 11-sep

  test('S1 y S3 son récord, cada una en su serie 2; S2 empata y S4 no llega', () => {
    assert.deepEqual(calcularRecords([s1, s2, s3, s4]), [2, null, 2, null])
  })

  test('al eliminar S3, el máximo vuelve a 45 y S4 sigue sin ser récord', () => {
    assert.deepEqual(calcularRecords([s1, s2, s4]), [2, null, null])
  })

  test('una sesión del 06-sep con 52,5 kg pasa a ser récord y S3 deja de serlo', () => {
    const del6 = sesion(52.5)
    assert.deepEqual(calcularRecords([s1, s2, del6, s3, s4]), [2, null, 1, null, null])
  })

  test('si S3 se corrige a 45 kg en todas sus series, empata y deja de ser récord', () => {
    assert.deepEqual(calcularRecords([s1, s2, sesion(45, 45, 45), s4]), [2, null, null, null])
  })

  test('si solo se corrige la serie de 50 × 6, S3 sigue siendo récord con la de 50 × 5', () => {
    assert.deepEqual(calcularRecords([s1, s2, sesion(47.5, 45, 50), s4]), [2, null, 3, null])
  })
})
