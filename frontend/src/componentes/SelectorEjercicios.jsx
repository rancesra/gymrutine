import { useState } from 'react'
import { nombreDe } from '../utilidades/referencias.js'
import Icono from './Icono.jsx'

// Selector de ejercicios del constructor de rutina (P6), a pantalla completa.
// catalogo: la lista de GET /ejercicios · idsAgregados: los que ya están en la rutina
// lleno: true si la rutina ya tiene 15 ejercicios · alAgregar(ejercicio) · alCerrar()
export default function SelectorEjercicios({ catalogo, referencias, objetivo, idsAgregados, lleno, alAgregar, alCerrar }) {
  const [busqueda, setBusqueda] = useState('')
  const [grupo, setGrupo] = useState('')
  const [soloRecomendados, setSoloRecomendados] = useState(true)

  const sugerido = referencias.objetivos.find((o) => o.codigo === objetivo)
  const texto = normalizar(busqueda)
  const visibles = catalogo.filter(
    (ejercicio) =>
      (!grupo || ejercicio.grupoMuscular === grupo) &&
      (!soloRecomendados || ejercicio.objetivos.includes(objetivo)) &&
      normalizar(ejercicio.nombre).includes(texto),
  )

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-labelledby="titulo-selector">
      <div className="hoja-contenido">
        <div className="encabezado">
          <button type="button" className="btn-volver btn-icono" aria-label="Cerrar" onClick={alCerrar}>
            <Icono nombre="x" />
          </button>
          <h1 id="titulo-selector">Agregar ejercicio</h1>
        </div>

        <span className="entrada">
          <Icono nombre="buscar" tamano={18} />
          <input
            type="search"
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </span>

        <div className="chips" role="group" aria-label="Grupo muscular">
          {[{ codigo: '', nombre: 'Todos' }, ...referencias.gruposMusculares].map((opcion) => (
            <button
              key={opcion.codigo || 'todos'}
              type="button"
              className={grupo === opcion.codigo ? 'chip activo' : 'chip'}
              aria-pressed={grupo === opcion.codigo}
              onClick={() => setGrupo(opcion.codigo)}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>

        <label className="entre">
          <span className="texto-2">
            Solo recomendados para <b>{sugerido.nombre}</b>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="interruptor"
            checked={soloRecomendados}
            onChange={(evento) => setSoloRecomendados(evento.target.checked)}
          />
        </label>

        <div className="aviso info">
          <Icono nombre="info" tamano={18} />
          <span>
            Se agrega con{' '}
            <b>
              {sugerido.seriesSugeridas} × {sugerido.repeticionesSugeridas}
            </b>
            , lo sugerido para {sugerido.nombre}. Puedes cambiarlo después.
          </span>
        </div>

        {lleno && (
          <div className="aviso error" role="status">
            La rutina ya tiene 15 ejercicios, el máximo.
          </div>
        )}

        {visibles.length === 0 ? (
          <p className="texto-2 centrado">Ningún ejercicio cumple el filtro.</p>
        ) : (
          <div className="lista">
            {visibles.map((ejercicio) => {
              const yaEsta = idsAgregados.includes(ejercicio.id)
              return (
                <div key={ejercicio.id} className={yaEsta ? 'lista-fila apagada' : 'lista-fila'}>
                  <div className="crece">
                    {ejercicio.nombre}{' '}
                    {ejercicio.propio && <span className="etiqueta propio">Propio</span>}{' '}
                    {ejercicio.objetivos.includes(objetivo) && <span className="etiqueta recomendado">Recomendado</span>}
                    <div className="texto-3">
                      {nombreDe(referencias.gruposMusculares, ejercicio.grupoMuscular)} ·{' '}
                      {nombreDe(referencias.equipos, ejercicio.equipo)}
                    </div>
                  </div>
                  {yaEsta ? (
                    <span className="etiqueta gris">Ya está</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-icono naranja"
                      aria-label={`Agregar ${ejercicio.nombre}`}
                      disabled={lleno}
                      onClick={() => alAgregar(ejercicio)}
                    >
                      <Icono nombre="mas" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="pie-fijo">
          <button type="button" className="btn btn-primario btn-bloque" onClick={alCerrar}>
            Listo ({idsAgregados.length})
          </button>
        </div>
      </div>
    </div>
  )
}

// Sin mayúsculas ni tildes: "Extensión" y "extension" coinciden
function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
