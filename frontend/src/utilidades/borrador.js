// Borrador del entrenamiento en curso (P7), para no perder datos si se cae la señal o se recarga.
// Uno por rutina, en localStorage con la clave gymrutine.borrador.<rutinaId>.
const PREFIJO = 'gymrutine.borrador.'

export function leerBorrador(rutinaId) {
  try {
    return JSON.parse(localStorage.getItem(PREFIJO + rutinaId))
  } catch {
    return null
  }
}

export function guardarBorrador(rutinaId, borrador) {
  localStorage.setItem(PREFIJO + rutinaId, JSON.stringify(borrador))
}

export function borrarBorrador(rutinaId) {
  localStorage.removeItem(PREFIJO + rutinaId)
}

// Al cerrar sesión no deben quedar entrenamientos de esa cuenta en el navegador
export function borrarTodosLosBorradores() {
  Object.keys(localStorage)
    .filter((clave) => clave.startsWith(PREFIJO))
    .forEach((clave) => localStorage.removeItem(clave))
}
