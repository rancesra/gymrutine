import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api } from '../api/cliente.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import GraficaLinea from '../componentes/GraficaLinea.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import NavProgreso from '../componentes/NavProgreso.jsx'
import { formatoFecha, formatoKg } from '../utilidades/formato.js'

// P11 Progreso por ejercicio (historia H20). Reglas: docs/mockup/README.md, sección P11.
// El ejercicio elegido vive en la URL (?ejercicio=), así P12 Récords puede abrir uno directamente.
export default function PaginaProgreso() {
  const [parametros, setParametros] = useSearchParams()
  const [ejercicios, setEjercicios] = useState(null)
  const [errorLista, setErrorLista] = useState(null)
  const [intentoLista, setIntentoLista] = useState(0) // al reintentar, el efecto vuelve a pedir los datos
  const [progreso, setProgreso] = useState(null)
  const [errorProgreso, setErrorProgreso] = useState(null)
  const [intentoProgreso, setIntentoProgreso] = useState(0)
  const [medida, setMedida] = useState('pesoMaximoKg')

  useEffect(() => {
    api.get('/progreso/ejercicios').then(setEjercicios).catch(setErrorLista)
  }, [intentoLista])

  // El selector solo ofrece ejercicios con historial: un ?ejercicio= que no esté en la lista se ignora
  const pedido = Number(parametros.get('ejercicio'))
  const elegido = ejercicios?.find((ejercicio) => ejercicio.id === pedido)?.id ?? ejercicios?.[0]?.id

  useEffect(() => {
    if (elegido === undefined) return undefined
    let vigente = true // si se cambia de ejercicio antes de que llegue la respuesta, esa respuesta se descarta
    api
      .get(`/progreso/ejercicios/${elegido}`)
      .then((datos) => {
        if (vigente) setProgreso(datos)
      })
      .catch((error) => {
        if (vigente) setErrorProgreso(error)
      })
    return () => {
      vigente = false
      setProgreso(null)
      setErrorProgreso(null)
    }
  }, [elegido, intentoProgreso])

  function reintentarLista() {
    setErrorLista(null)
    setIntentoLista((anterior) => anterior + 1)
  }

  return (
    <section className="pagina num">
      <h1>Progreso</h1>
      <NavProgreso />

      {errorLista ? (
        <MensajeError error={errorLista} alReintentar={reintentarLista} />
      ) : ejercicios === null ? (
        <Cargando texto="Cargando tus ejercicios…" />
      ) : ejercicios.length === 0 ? (
        <EstadoVacio titulo="Registra tu primera sesión para ver tu progreso">
          <Link to="/rutinas" className="btn btn-primario">
            Ver mis rutinas
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <CampoFormulario etiqueta="Ejercicio">
            <select value={elegido} onChange={(evento) => setParametros({ ejercicio: evento.target.value })}>
              {ejercicios.map((ejercicio) => (
                <option key={ejercicio.id} value={ejercicio.id}>
                  {ejercicio.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <div className="chips" role="group" aria-label="Qué muestra la gráfica">
            <BotonMedida codigo="pesoMaximoKg" texto="Peso máximo" medida={medida} alElegir={setMedida} />
            <BotonMedida codigo="volumenKg" texto="Volumen" medida={medida} alElegir={setMedida} />
          </div>

          {errorProgreso ? (
            <MensajeError error={errorProgreso} alReintentar={() => setIntentoProgreso((anterior) => anterior + 1)} />
          ) : progreso === null ? (
            <Cargando texto="Cargando el progreso…" />
          ) : (
            <Evolucion progreso={progreso} medida={medida} />
          )}
        </>
      )}
    </section>
  )
}

function BotonMedida({ codigo, texto, medida, alElegir }) {
  return (
    <button
      type="button"
      className={medida === codigo ? 'chip activo' : 'chip'}
      aria-pressed={medida === codigo}
      onClick={() => alElegir(codigo)}
    >
      {texto}
    </button>
  )
}

function Evolucion({ progreso, medida }) {
  const { ejercicio, puntos } = progreso
  const nombreMedida = medida === 'volumenKg' ? 'Volumen' : 'Peso máximo'
  return (
    <>
      <div>
        {/* Los puntos ya llegan en orden cronológico */}
        <GraficaLinea
          puntos={puntos.map((punto) => ({
            fecha: punto.fechaInicio,
            valor: punto[medida],
            destacado: punto.esRecord,
          }))}
          titulo={`${nombreMedida} por sesión en ${ejercicio.nombre}`}
        />
        <div className="leyenda texto-3">
          <span>
            <span className="leyenda-punto record" />
            Récord
          </span>
          <span>
            <span className="leyenda-punto" />
            Sesión
          </span>
        </div>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th className="der">Peso máx.</th>
            <th className="der">Volumen</th>
            <th className="der">Récord</th>
          </tr>
        </thead>
        <tbody>
          {/* La tabla va al revés: de la sesión más reciente a la más antigua */}
          {[...puntos].reverse().map((punto) => (
            <tr key={punto.sesionId}>
              <td>{formatoFecha(punto.fechaInicio, { diaSemana: false })}</td>
              <td className="der">{formatoKg(punto.pesoMaximoKg)}</td>
              <td className="der">{formatoKg(punto.volumenKg)}</td>
              <td className="der">{punto.esRecord ? <span className="etiqueta record">Sí</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
