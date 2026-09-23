// Números y fechas en formato colombiano, como en el mockup. La API siempre usa punto decimal.
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// 62.5 → "62,5 kg"  ·  1935 → "1.935 kg"
export function formatoKg(valor) {
  return `${numero.format(valor)} kg`
}

// Lee lo que escribe el usuario, con coma o con punto: "57,5" → 57.5
export function leerNumero(texto) {
  return Number(String(texto).trim().replace(',', '.'))
}

// "2026-09-14" o "2026-09-14T18:30:00" → "lun 14 sep"
// Opciones: { diaSemana: false } → "14 sep"  ·  { anio: true } → "lun 14 sep 2026"
export function formatoFecha(texto, { diaSemana = true, anio = false } = {}) {
  // Sin hora, new Date("2026-09-14") se lee en UTC y en Colombia mostraría el día anterior
  const fecha = new Date(texto.length === 10 ? `${texto}T00:00:00` : texto)
  const partes = [fecha.getDate(), meses[fecha.getMonth()]]
  if (diaSemana) partes.unshift(dias[fecha.getDay()])
  if (anio) partes.push(fecha.getFullYear())
  return partes.join(' ')
}