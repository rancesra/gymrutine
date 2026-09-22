// Regla de récords personales R6 (MODELO-DATOS §7.1). Función pura: no toca la base de datos.

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
