import { formatoKg, leerNumero } from '../utilidades/formato.js'
import Icono from './Icono.jsx'

const MAXIMO_SERIES = 20

// Filas editables de las series de un ejercicio: peso y repeticiones, y agregar series.
// Los valores son texto, tal como los escribe el usuario: [{ pesoKg: '57,5', repeticiones: '5' }].
// errorDe(j, campo) devuelve el error de esa celda.
// - P10 (editar sesión, por defecto): la última columna quita la serie; cada ejercicio conserva al menos una.
// - P7 (entrenar, con alMarcar): la última columna marca la serie como hecha. Una serie hecha que supera
//   recordKg se ve como "posible récord"; la confirmación real la da el servidor al guardar.
export default function FilasSeries({ series, alCambiar, errorDe, alMarcar, recordKg, deshabilitado = false }) {
  const entrenando = Boolean(alMarcar)

  function cambiar(j, campo, valor) {
    alCambiar(series.map((serie, k) => (k === j ? { ...serie, [campo]: valor } : serie)))
  }

  // La serie nueva copia la anterior: casi siempre se repite el peso
  function agregar() {
    const ultima = series.at(-1)
    const nueva = { pesoKg: ultima?.pesoKg ?? '', repeticiones: ultima?.repeticiones ?? '' }
    alCambiar([...series, entrenando ? { ...nueva, hecha: false } : nueva])
  }

  function quitar(j) {
    alCambiar(series.filter((serie, k) => k !== j))
  }

  function esPosibleRecord(serie) {
    return entrenando && serie.hecha && leerNumero(serie.pesoKg) > (recordKg ?? 0)
  }

  function clasesDe(serie) {
    if (!entrenando) return 'serie'
    if (esPosibleRecord(serie)) return 'serie entrenar posible'
    return serie.hecha ? 'serie entrenar hecha' : 'serie entrenar'
  }

  return (
    <div className="series">
      <div className="serie serie-cab">
        <span>#</span>
        <span>Peso (kg)</span>
        <span>Reps</span>
        <span className="centrado">{entrenando ? 'Hecha' : ''}</span>
      </div>
      {series.map((serie, j) => {
        const errorPeso = errorDe(j, 'pesoKg')
        const errorReps = errorDe(j, 'repeticiones')
        return (
          // Las series no tienen id propio: su número es su posición
          <div key={j} className="series">
            <div className={clasesDe(serie)}>
              <span className="texto-2">{j + 1}</span>
              <span className={errorPeso ? 'entrada error' : 'entrada'}>
                <input
                  value={serie.pesoKg}
                  inputMode="decimal"
                  disabled={deshabilitado}
                  aria-label={`Peso de la serie ${j + 1}`}
                  onChange={(evento) => cambiar(j, 'pesoKg', evento.target.value)}
                />
              </span>
              <span className={errorReps ? 'entrada error' : 'entrada'}>
                <input
                  value={serie.repeticiones}
                  inputMode="numeric"
                  disabled={deshabilitado}
                  aria-label={`Repeticiones de la serie ${j + 1}`}
                  onChange={(evento) => cambiar(j, 'repeticiones', evento.target.value)}
                />
              </span>
              {entrenando ? (
                <button
                  type="button"
                  className="check"
                  aria-label={serie.hecha ? `Desmarcar la serie ${j + 1}` : `Marcar la serie ${j + 1} como hecha`}
                  aria-pressed={Boolean(serie.hecha)}
                  disabled={deshabilitado}
                  onClick={() => alMarcar(j)}
                >
                  <Icono nombre={esPosibleRecord(serie) ? 'trofeo' : 'check'} tamano={18} />
                </button>
              ) : (
                // Cada ejercicio conserva al menos una serie
                <button
                  type="button"
                  className="btn-icono"
                  aria-label={`Quitar la serie ${j + 1}`}
                  disabled={series.length === 1}
                  onClick={() => quitar(j)}
                >
                  <Icono nombre="x" tamano={18} />
                </button>
              )}
            </div>
            {(errorPeso || errorReps) && <span className="error-texto serie-error">{errorPeso ?? errorReps}</span>}
            {!errorPeso && !errorReps && esPosibleRecord(serie) && recordKg != null && (
              <span className="posible-texto">Posible récord: supera tus {formatoKg(recordKg)}</span>
            )}
          </div>
        )
      })}
      {!deshabilitado && (
        <div>
          <button type="button" className="btn btn-secundario btn-sm" onClick={agregar} disabled={series.length >= MAXIMO_SERIES}>
            <Icono nombre="mas" tamano={16} />
            Serie
          </button>
        </div>
      )}
    </div>
  )
}
