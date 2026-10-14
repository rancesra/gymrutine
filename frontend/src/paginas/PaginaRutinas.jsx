import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/cliente.js'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { formatoFecha } from '../utilidades/formato.js'
import { nombreDe, obtenerReferencias } from '../utilidades/referencias.js'

// P5 Mis rutinas (historia H11). Reglas: docs/mockup/README.md, sección P5.
// Las rutinas salen del servicio de cuentas; la última vez que se entrenó cada una, de GET /sesiones
// (servicio de entrenamiento).
export default function PaginaRutinas() {
  const [rutinas, setRutinas] = useState(null)
  const [referencias, setReferencias] = useState(null)
  const [ultimaVez, setUltimaVez] = useState(null) // { [rutinaId]: fechaInicio }; null si no se pudo saber
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0) // al reintentar, el efecto vuelve a pedir los datos

  useEffect(() => {
    Promise.all([api.get('/rutinas'), obtenerReferencias()])
      .then(([lista, refs]) => {
        setRutinas(lista)
        setReferencias(refs)
      })
      .catch(setError)
    // Si el servicio de entrenamiento no responde, las rutinas se muestran igual, sin la última vez
    api.get('/sesiones').then((sesiones) => setUltimaVez(ultimaVezPorRutina(sesiones)), () => setUltimaVez(null))
  }, [intento])

  function reintentar() {
    setError(null)
    setIntento(intento + 1)
  }

  return (
    <section className="pagina">
      <div className="entre">
        <h1>Mis rutinas</h1>
        <Link to="/rutinas/nueva" className="btn-volver naranja" aria-label="Nueva rutina">
          <Icono nombre="mas" />
        </Link>
      </div>

      <Link to="/ejercicios" className="tarjeta fila tarjeta-enlace">
        <span className="miniatura">
          <Icono nombre="buscar" />
        </span>
        <span className="crece">
          <b>Catálogo de ejercicios</b>
          <span className="texto-3 bloque">Los ejercicios base y los tuyos</span>
        </span>
        <Icono nombre="derecha" tamano={18} />
      </Link>

      {error ? (
        <MensajeError error={error} alReintentar={reintentar} />
      ) : rutinas === null ? (
        <Cargando texto="Cargando tus rutinas…" />
      ) : rutinas.length === 0 ? (
        <EstadoVacio titulo="Aún no tienes rutinas" texto="Arma una con ejercicios del catálogo para empezar a entrenar.">
          <Link to="/rutinas/nueva" className="btn btn-primario">
            Crear mi primera rutina
          </Link>
        </EstadoVacio>
      ) : (
        // Ya llegan ordenadas por nombre
        <div className="lista-tarjetas">
          {rutinas.map((rutina) => (
            <TarjetaRutina
              key={rutina.id}
              rutina={rutina}
              objetivo={nombreDe(referencias.objetivos, rutina.objetivo)}
              ultimaVez={ultimaVez}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function TarjetaRutina({ rutina, objetivo, ultimaVez }) {
  const [abierta, setAbierta] = useState(false)
  const cantidad = rutina.cantidadEjercicios === 1 ? '1 ejercicio' : `${rutina.cantidadEjercicios} ejercicios`
  let entrenada = ''
  if (ultimaVez) {
    const fecha = ultimaVez[rutina.id]
    entrenada = fecha ? ` · última vez ${formatoFecha(fecha)}` : ' · aún no la entrenas'
  }

  return (
    <div className="tarjeta series">
      {/* Al tocar la cabecera se abren o cierran los ejercicios de la rutina */}
      <button
        type="button"
        className="tarjeta-cabecera"
        aria-expanded={abierta}
        aria-controls={`ejercicios-${rutina.id}`}
        onClick={() => setAbierta(!abierta)}
      >
        <span className="entre">
          <b className="titulo-tarjeta">{rutina.nombre}</b>
          <span className="etiqueta objetivo">{objetivo}</span>
        </span>
        <span className="entre texto-3">
          <span>
            {cantidad}
            {entrenada}
          </span>
          <Icono nombre={abierta ? 'arriba' : 'abajo'} tamano={18} />
        </span>
      </button>

      {abierta && <EjerciciosRutina id={rutina.id} />}

      <div className="fila">
        <Link to={`/rutinas/${rutina.id}/entrenar`} className="btn btn-primario btn-sm crece">
          Entrenar
        </Link>
        <Link to={`/rutinas/${rutina.id}/editar`} className="btn btn-secundario btn-sm">
          <Icono nombre="lapiz" tamano={16} />
          Editar
        </Link>
      </div>
    </div>
  )
}

// El detalle de una rutina: sus ejercicios en orden, con series y repeticiones objetivo (GET /rutinas/{id})
function EjerciciosRutina({ id }) {
  const [rutina, setRutina] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/rutinas/${id}`).then(setRutina).catch(setError)
  }, [id])

  if (error?.estado === 404) {
    return <p className="texto-2">No encontramos esta rutina: puede que la hayas eliminado.</p>
  }
  if (error) return <MensajeError error={error} />
  if (!rutina) return <Cargando texto="Cargando los ejercicios…" />

  return (
    <ol id={`ejercicios-${id}`} className="lista num">
      {rutina.ejercicios.map((item) => (
        <li key={item.ejercicio.id} className="lista-fila">
          <span className="etiqueta gris">{item.orden}</span>
          <span className="crece">
            {item.ejercicio.nombre}
            {!item.ejercicio.activo && <span className="texto-3 bloque">Ya no está en el catálogo</span>}
          </span>
          <b>
            {item.seriesObjetivo} × {item.repeticionesObjetivo}
          </b>
        </li>
      ))}
    </ol>
  )
}

// GET /sesiones llega de la más reciente a la más antigua: la primera de cada rutina es la última vez
function ultimaVezPorRutina(sesiones) {
  const fechas = {}
  for (const sesion of sesiones) {
    fechas[sesion.rutina.id] ??= sesion.fechaInicio
  }
  return fechas
}
