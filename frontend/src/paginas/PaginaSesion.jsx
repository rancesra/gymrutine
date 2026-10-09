import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../api/cliente.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import FilasSeries from '../componentes/FilasSeries.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { formatoFecha, formatoHora, formatoKg, formatoNumero, leerNumero } from '../utilidades/formato.js'

// P10 Detalle de sesión (historias H16, H17 y H23). Reglas: docs/mockup/README.md, sección P10.
export default function PaginaSesion() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [sesion, setSesion] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [borrador, setBorrador] = useState(null) // no es null mientras se edita
  const [errores, setErrores] = useState({})
  const [errorAccion, setErrorAccion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [intento, setIntento] = useState(0) // al reintentar, el efecto vuelve a pedir la sesión

  useEffect(() => {
    api.get(`/sesiones/${id}`).then(setSesion).catch(setErrorCarga)
  }, [id, intento])

  function reintentar() {
    setErrorCarga(null)
    setIntento(intento + 1)
  }

  function empezarEdicion() {
    setBorrador(aBorrador(sesion))
    setErrores({})
    setErrorAccion(null)
  }

  function cancelarEdicion() {
    setBorrador(null)
    setErrores({})
    setErrorAccion(null)
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorAccion(null)
    const encontrados = validar(borrador)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    try {
      // La respuesta trae la sesión con los récords ya recalculados
      setSesion(await api.put(`/sesiones/${id}`, aCuerpo(borrador)))
      setBorrador(null)
    } catch (e) {
      // Un 400 marca cada campo según la ruta que llega en "campos"
      if (Object.keys(e.campos).length > 0) setErrores(e.campos)
      else setErrorAccion(e)
    } finally {
      setEnviando(false)
    }
  }

  async function eliminar() {
    if (!window.confirm('¿Eliminar esta sesión? Se recalcularán tus récords.')) return
    setErrorAccion(null)
    setEnviando(true)
    try {
      await api.borrar(`/sesiones/${id}`)
      navegar('/historial')
    } catch (e) {
      setErrorAccion(e)
      setEnviando(false)
    }
  }

  if (errorCarga?.estado === 404) {
    return (
      <section className="pagina">
        <EstadoVacio titulo="No encontramos lo que buscas" texto="La sesión no existe o ya fue eliminada.">
          <Link to="/historial" className="btn btn-primario">
            Volver al historial
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  if (errorCarga) {
    return (
      <section className="pagina">
        <Encabezado titulo="Detalle de sesión" />
        <MensajeError error={errorCarga} alReintentar={reintentar} />
      </section>
    )
  }

  if (!sesion) {
    return (
      <section className="pagina">
        <Encabezado titulo="Detalle de sesión" />
        <Cargando texto="Cargando la sesión…" />
      </section>
    )
  }

  const subtitulo = `${formatoFecha(sesion.fechaInicio)} · ${formatoHora(sesion.fechaInicio)}`

  if (borrador) {
    return (
      <form className="pagina" onSubmit={guardar} noValidate>
        <Encabezado titulo={sesion.rutina.nombre} subtitulo="Editando la sesión" />
        <CampoFormulario etiqueta="Fecha y hora de inicio" error={errores.fechaInicio}>
          <input
            type="datetime-local"
            value={borrador.fechaInicio}
            max={ahoraLocal()}
            onChange={(evento) => setBorrador({ ...borrador, fechaInicio: evento.target.value })}
          />
        </CampoFormulario>
        <CampoFormulario etiqueta="Duración (minutos)" error={errores.duracionMinutos}>
          <input
            value={borrador.duracionMinutos}
            inputMode="numeric"
            onChange={(evento) => setBorrador({ ...borrador, duracionMinutos: evento.target.value })}
          />
        </CampoFormulario>
        {errores.registros && <span className="error-texto">{errores.registros}</span>}

        {borrador.registros.map((registro, i) => (
          <div key={registro.ejercicio.id} className="tarjeta series">
            <h2>
              {i + 1}. {registro.ejercicio.nombre}
            </h2>
            <FilasSeries
              series={registro.series}
              alCambiar={(series) =>
                setBorrador({
                  ...borrador,
                  registros: borrador.registros.map((r, k) => (k === i ? { ...r, series } : r)),
                })
              }
              errorDe={(j, campo) => errores[`registros[${i}].series[${j}].${campo}`]}
            />
            {errores[`registros[${i}].series`] && (
              <span className="error-texto">{errores[`registros[${i}].series`]}</span>
            )}
          </div>
        ))}

        <MensajeError error={errorAccion} />
        <div className="acciones">
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn btn-secundario btn-bloque" onClick={cancelarEdicion} disabled={enviando}>
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  const { resumen } = sesion
  return (
    <section className="pagina num">
      <Encabezado titulo={sesion.rutina.nombre} subtitulo={subtitulo} />
      <div className="tarjeta resumen-sesion">
        <Dato valor={sesion.duracionMinutos} unidad="min" />
        <Dato valor={resumen.series} unidad="series" />
        <Dato valor={resumen.repeticiones} unidad="reps" />
        <Dato valor={formatoNumero(resumen.volumenKg)} unidad="kg" />
      </div>

      {sesion.registros.map((registro) => (
        <div key={registro.ejercicio.id} className="lista">
          <div className="lista-cab">
            <span>{registro.ejercicio.nombre}</span>
            <span className="texto-3">{formatoKg(registro.volumenKg)}</span>
          </div>
          {registro.series.map((serie) => (
            <div key={serie.numero} className={serie.esRecord ? 'lista-fila record' : 'lista-fila'}>
              <span className="texto-3 numero-serie">{serie.numero}</span>
              <span className="crece">
                {serie.esRecord ? <b>{textoSerie(serie)}</b> : textoSerie(serie)}
              </span>
              {serie.esRecord && (
                <span className="etiqueta record">
                  <Icono nombre="trofeo" tamano={14} />
                  Récord
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <MensajeError error={errorAccion} />
      <div className="acciones">
        <button type="button" className="btn btn-secundario btn-bloque" onClick={empezarEdicion} disabled={enviando}>
          <Icono nombre="lapiz" tamano={18} />
          Editar sesión
        </button>
        <button type="button" className="btn btn-peligro btn-bloque" onClick={eliminar} disabled={enviando}>
          <Icono nombre="basura" tamano={18} />
          {enviando ? 'Eliminando…' : 'Eliminar sesión'}
        </button>
      </div>
    </section>
  )
}

function Encabezado({ titulo, subtitulo }) {
  return (
    <div className="encabezado">
      <Link to="/historial" className="btn-volver" aria-label="Volver al historial">
        <Icono nombre="atras" />
      </Link>
      <h1>
        {titulo}
        {subtitulo && <small>{subtitulo}</small>}
      </h1>
    </div>
  )
}

function Dato({ valor, unidad }) {
  return (
    <span>
      <b>{valor}</b> <span className="texto-3">{unidad}</span>
    </span>
  )
}

// 62.5 y 4 → "62,5 kg × 4"
function textoSerie(serie) {
  return `${formatoKg(serie.pesoKg)} × ${serie.repeticiones}`
}

// Fecha y hora actual en el formato del campo datetime-local: 2026-10-08T18:30
function ahoraLocal() {
  const ahora = new Date()
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset())
  return ahora.toISOString().slice(0, 16)
}

// La sesión de la API → el borrador que se edita (los números como texto, con coma decimal)
function aBorrador(sesion) {
  return {
    fechaInicio: sesion.fechaInicio.slice(0, 16),
    duracionMinutos: String(sesion.duracionMinutos),
    registros: sesion.registros.map((registro) => ({
      ejercicio: registro.ejercicio,
      series: registro.series.map((serie) => ({
        pesoKg: String(serie.pesoKg).replace('.', ','),
        repeticiones: String(serie.repeticiones),
      })),
    })),
  }
}

// El borrador → el cuerpo de PUT /sesiones/{id} (contrato §7)
function aCuerpo(borrador) {
  return {
    fechaInicio: `${borrador.fechaInicio}:00`,
    duracionMinutos: leerNumero(borrador.duracionMinutos),
    registros: borrador.registros.map((registro) => ({
      ejercicioId: registro.ejercicio.id,
      series: registro.series.map((serie) => ({
        pesoKg: leerNumero(serie.pesoKg),
        repeticiones: leerNumero(serie.repeticiones),
      })),
    })),
  }
}

// Aviso rápido en el navegador con las mismas reglas del backend, que es quien valida de verdad.
// Las claves son las mismas rutas de "campos" de la API, así los dos errores se muestran igual.
function validar(borrador) {
  const errores = {}
  if (!borrador.fechaInicio) errores.fechaInicio = 'Escribe la fecha y la hora'
  else if (borrador.fechaInicio > ahoraLocal()) errores.fechaInicio = 'No puede ser futura'

  const duracion = leerNumero(borrador.duracionMinutos)
  if (!borrador.duracionMinutos.trim() || !Number.isInteger(duracion) || duracion < 1 || duracion > 600) {
    errores.duracionMinutos = 'Debe estar entre 1 y 600 minutos'
  }

  borrador.registros.forEach((registro, i) => {
    registro.series.forEach((serie, j) => {
      const ruta = `registros[${i}].series[${j}]`
      const peso = leerNumero(serie.pesoKg)
      if (!serie.pesoKg.trim() || Number.isNaN(peso) || peso < 0 || peso > 500) {
        errores[`${ruta}.pesoKg`] = 'El peso debe estar entre 0 y 500 kg'
      } else if (Math.abs(peso * 100 - Math.round(peso * 100)) > 1e-9) {
        errores[`${ruta}.pesoKg`] = 'El peso admite máximo 2 decimales'
      }
      const reps = leerNumero(serie.repeticiones)
      if (!serie.repeticiones.trim() || !Number.isInteger(reps) || reps < 1 || reps > 100) {
        errores[`${ruta}.repeticiones`] = 'Las repeticiones deben estar entre 1 y 100'
      }
    })
  })
  return errores
}
