import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/cliente.js'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import NavProgreso from '../componentes/NavProgreso.jsx'
import { formatoFecha, formatoKg } from '../utilidades/formato.js'
import { obtenerReferencias } from '../utilidades/referencias.js'

// P12 Récords (historia H19). Reglas: docs/mockup/README.md, sección P12.
export default function PaginaRecords() {
  const [records, setRecords] = useState(null)
  const [referencias, setReferencias] = useState(null)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0) // al reintentar, el efecto vuelve a pedir los datos

  useEffect(() => {
    Promise.all([api.get('/records'), obtenerReferencias()])
      .then(([lista, refs]) => {
        setRecords(lista)
        setReferencias(refs)
      })
      .catch(setError)
  }, [intento])

  function reintentar() {
    setError(null)
    setIntento((anterior) => anterior + 1)
  }

  // Un bloque por grupo muscular, en el orden de GET /referencias; los vacíos no se muestran
  const grupos = (referencias?.gruposMusculares ?? [])
    .map((grupo) => ({
      ...grupo,
      records: (records ?? []).filter((record) => record.ejercicio.grupoMuscular === grupo.codigo),
    }))
    .filter((grupo) => grupo.records.length > 0)

  return (
    <section className="pagina num">
      <h1>Progreso</h1>
      <NavProgreso />

      {error ? (
        <MensajeError error={error} alReintentar={reintentar} />
      ) : records === null ? (
        <Cargando texto="Cargando tus récords…" />
      ) : records.length === 0 ? (
        <EstadoVacio titulo="Aún no tienes récords" texto="¡Registra tu primera sesión!">
          <Link to="/rutinas" className="btn btn-primario">
            Ver mis rutinas
          </Link>
        </EstadoVacio>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.codigo}>
            <h2 className="titulo-bloque">{grupo.nombre}</h2>
            <div className="lista">
              {grupo.records.map((record) => (
                <FilaRecord key={record.ejercicio.id} record={record} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  )
}

// Tocar un récord abre el progreso de ese ejercicio (pantalla P11)
function FilaRecord({ record }) {
  return (
    <Link to={`/progreso?ejercicio=${record.ejercicio.id}`} className="lista-fila enlace">
      <div className="crece">
        <b>{record.ejercicio.nombre}</b>
        <div className="texto-3">
          {formatoKg(record.pesoKg)} × {record.repeticiones} · {formatoFecha(record.fechaInicio, { anio: true })}
        </div>
      </div>
      <span className="etiqueta record">
        <Icono nombre="trofeo" tamano={14} />
        {formatoKg(record.pesoKg)}
      </span>
      <Icono nombre="derecha" tamano={18} />
    </Link>
  )
}
