import { useEffect, useState } from 'react'
import { api } from '../api/cliente.js'
import { nombreDe } from '../utilidades/referencias.js'
import Cargando from './Cargando.jsx'
import Icono from './Icono.jsx'
import MensajeError from './MensajeError.jsx'

// Detalle de un ejercicio del catálogo (P4, historias H6 y H9), a pantalla completa.
// Solo los propios se pueden editar y eliminar. alEditar(ejercicio) · alEliminar() · alCerrar()
export default function DetalleEjercicio({ id, referencias, alCerrar, alEditar, alEliminar }) {
  const [ejercicio, setEjercicio] = useState(null)
  const [error, setError] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    api.get(`/ejercicios/${id}`).then(setEjercicio).catch(setError)
  }, [id])

  // Borrado lógico (H9): el historial y los récords con este ejercicio se conservan
  async function eliminar() {
    if (!window.confirm('¿Eliminar este ejercicio? Tu historial se conserva.')) return
    setErrorEliminar(null)
    setEliminando(true)
    try {
      await api.borrar(`/ejercicios/${id}`)
      alEliminar()
    } catch (e) {
      setErrorEliminar(e)
      setEliminando(false)
    }
  }

  let contenido
  if (error?.estado === 404) {
    contenido = <p className="texto-2">No encontramos este ejercicio: no existe o no es tuyo.</p>
  } else if (error) {
    contenido = <MensajeError error={error} />
  } else if (!ejercicio) {
    contenido = <Cargando texto="Cargando el ejercicio…" />
  } else {
    const youtube = `https://www.youtube.com/results?search_query=${encodeURIComponent(ejercicio.nombre)}`
    contenido = (
      <>
        <div className="tarjeta portada" aria-hidden="true">
          <Icono nombre="rutinas" tamano={40} />
        </div>
        <div className="chips">
          <span className="etiqueta gris">{nombreDe(referencias.gruposMusculares, ejercicio.grupoMuscular)}</span>
          <span className="etiqueta gris">{nombreDe(referencias.equipos, ejercicio.equipo)}</span>
          {ejercicio.objetivos.map((codigo) => (
            <span key={codigo} className="etiqueta objetivo">
              {nombreDe(referencias.objetivos, codigo)}
            </span>
          ))}
          {ejercicio.propio && <span className="etiqueta propio">Propio</span>}
        </div>
        <div>
          <b>Técnica</b>
          <p className="texto-2 sin-margen">{ejercicio.descripcion ?? 'Sin descripción.'}</p>
        </div>
        <a href={youtube} target="_blank" rel="noopener noreferrer" className="btn btn-secundario btn-bloque">
          <Icono nombre="externo" tamano={18} />
          Ver técnica en YouTube
        </a>

        {ejercicio.propio ? (
          <div className="acciones">
            <button type="button" className="btn btn-secundario btn-bloque" onClick={() => alEditar(ejercicio)} disabled={eliminando}>
              <Icono nombre="lapiz" tamano={18} />
              Editar ejercicio
            </button>
            <button type="button" className="btn btn-peligro btn-bloque" onClick={eliminar} disabled={eliminando}>
              <Icono nombre="basura" tamano={18} />
              {eliminando ? 'Eliminando…' : 'Eliminar ejercicio'}
            </button>
            <MensajeError error={errorEliminar} />
          </div>
        ) : (
          <div className="aviso info">
            <Icono nombre="candado" tamano={18} />
            <span>Ejercicio del catálogo base: no se puede editar ni eliminar.</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle">
      <div className="hoja-contenido">
        <div className="encabezado">
          <button type="button" className="btn-volver btn-icono" aria-label="Volver al catálogo" onClick={alCerrar}>
            <Icono nombre="atras" />
          </button>
          <h1 id="titulo-detalle">{ejercicio?.nombre ?? 'Ejercicio'}</h1>
        </div>
        {contenido}
      </div>
    </div>
  )
}
