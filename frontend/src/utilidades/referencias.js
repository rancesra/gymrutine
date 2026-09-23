import { api } from '../api/cliente.js'

// Objetivos, grupos musculares y equipos con su nombre visible (GET /referencias).
// Se piden una vez y se guardan mientras la pestaña esté abierta.
const CLAVE = 'gymrutine.referencias'

export async function obtenerReferencias() {
  const guardadas = sessionStorage.getItem(CLAVE)
  if (guardadas) return JSON.parse(guardadas)
  const referencias = await api.get('/referencias')
  sessionStorage.setItem(CLAVE, JSON.stringify(referencias))
  return referencias
}

// nombreDe(referencias.objetivos, 'PERDIDA_PESO') → "Pérdida de peso"
export function nombreDe(lista, codigo) {
  return lista.find((elemento) => elemento.codigo === codigo)?.nombre ?? codigo
}