import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/cliente.js'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { formatoFecha, formatoHora, formatoKg } from '../utilidades/formato.js'

// P9 Historial (historia H15). Reglas: docs/mockup/README.md, sección P9.
export default function PaginaHistorial() {
  const [sesiones, setSesiones] = useState(null)
  const [error, setError] = useState(null)

  function cargarSesiones() {
    api.get('/sesiones').then(setSesiones).catch(setError)
  }

  useEffect(() => {
    cargarSesiones()
  }, [])

  function reintentar() {
    setError(null)
    cargarSesiones()
  }

  return (
    <section className="pagina">
      <h1>Historial</h1>
      {error ? (
        <MensajeError error={error} alReintentar={reintentar} />
      ) : sesiones === null ? (
        <Cargando texto="Cargando tu historial…" />
      ) : sesiones.length === 0 ? (
        <EstadoVacio titulo="Aún no has registrado entrenamientos">
          <Link to="/rutinas" className="btn btn-primario">
            Entrenar una rutina
          </Link>
        </EstadoVacio>
      ) : (
        // Ya llegan de la más reciente a la más antigua: se muestran en ese orden
        <div className="lista-tarjetas num">
          {sesiones.map((sesion) => (
            <TarjetaSesion key={sesion.id} sesion={sesion} />
          ))}
        </div>
      )}
    </section>
  )
}

function TarjetaSesion({ sesion }) {
  const { resumen } = sesion
  return (
    <Link to={`/historial/${sesion.id}`} className="tarjeta tarjeta-enlace">
      <span className="texto-3 fecha-tarjeta">
        {formatoFecha(sesion.fechaInicio)} · {formatoHora(sesion.fechaInicio)}
      </span>
      <span className="entre">
        <h2>{sesion.rutina.nombre}</h2>
        {/* La etiqueta solo aparece si la sesión tiene récords vigentes */}
        {resumen.records > 0 && (
          <span className="etiqueta record">
            <Icono nombre="trofeo" tamano={14} />
            {resumen.records === 1 ? '1 récord' : `${resumen.records} récords`}
          </span>
        )}
      </span>
      <span className="texto-2">
        {sesion.duracionMinutos} min · {resumen.series} {resumen.series === 1 ? 'serie' : 'series'} ·{' '}
        {formatoKg(resumen.volumenKg)}
      </span>
    </Link>
  )
}
