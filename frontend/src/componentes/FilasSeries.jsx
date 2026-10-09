import Icono from './Icono.jsx'

const MAXIMO_SERIES = 20

// Filas editables de las series de un ejercicio: peso y repeticiones, agregar y quitar series.
// Las usan P10 (editar sesión) y P7 (entrenar). Los valores son texto, tal como los escribe el usuario.
// series: [{ pesoKg: '57,5', repeticiones: '5' }] · errorDe(j, campo) devuelve el error de esa celda
export default function FilasSeries({ series, alCambiar, errorDe }) {
  function cambiar(j, campo, valor) {
    alCambiar(series.map((serie, k) => (k === j ? { ...serie, [campo]: valor } : serie)))
  }

  // La serie nueva copia la anterior: casi siempre se repite el peso
  function agregar() {
    const ultima = series.at(-1)
    alCambiar([...series, { pesoKg: ultima?.pesoKg ?? '', repeticiones: ultima?.repeticiones ?? '' }])
  }

  function quitar(j) {
    alCambiar(series.filter((serie, k) => k !== j))
  }

  return (
    <div className="series">
      <div className="serie serie-cab">
        <span>#</span>
        <span>Peso (kg)</span>
        <span>Reps</span>
        <span />
      </div>
      {series.map((serie, j) => {
        const errorPeso = errorDe(j, 'pesoKg')
        const errorReps = errorDe(j, 'repeticiones')
        return (
          // Las series no tienen id propio: su número es su posición
          <div key={j} className="series">
            <div className="serie">
              <span className="texto-2">{j + 1}</span>
              <span className={errorPeso ? 'entrada error' : 'entrada'}>
                <input
                  value={serie.pesoKg}
                  inputMode="decimal"
                  aria-label={`Peso de la serie ${j + 1}`}
                  onChange={(evento) => cambiar(j, 'pesoKg', evento.target.value)}
                />
              </span>
              <span className={errorReps ? 'entrada error' : 'entrada'}>
                <input
                  value={serie.repeticiones}
                  inputMode="numeric"
                  aria-label={`Repeticiones de la serie ${j + 1}`}
                  onChange={(evento) => cambiar(j, 'repeticiones', evento.target.value)}
                />
              </span>
              {/* Cada ejercicio conserva al menos una serie */}
              <button
                type="button"
                className="btn-icono"
                aria-label={`Quitar la serie ${j + 1}`}
                disabled={series.length === 1}
                onClick={() => quitar(j)}
              >
                <Icono nombre="x" tamano={18} />
              </button>
            </div>
            {(errorPeso || errorReps) && <span className="error-texto serie-error">{errorPeso ?? errorReps}</span>}
          </div>
        )
      })}
      <div>
        <button type="button" className="btn btn-secundario btn-sm" onClick={agregar} disabled={series.length >= MAXIMO_SERIES}>
          <Icono nombre="mas" tamano={16} />
          Serie
        </button>
      </div>
    </div>
  )
}
