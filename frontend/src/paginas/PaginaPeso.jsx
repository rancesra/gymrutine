import { useEffect, useState } from 'react'
import { api } from '../api/cliente.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import GraficaLinea from '../componentes/GraficaLinea.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { formatoFecha, formatoKg, formatoNumero, leerNumero } from '../utilidades/formato.js'

// P13 Peso corporal (historias H21, H22 y H24). Reglas: docs/mockup/README.md, sección P13.

// Hoy en el formato de la API: 2026-10-14
function hoy() {
  return new Date().toLocaleDateString('sv-SE')
}

function formularioVacio() {
  return { fecha: hoy(), pesoKg: '' }
}

// Validación rápida en el navegador; la que cuenta es la del backend (regla 6 del mockup)
function validar(borrador) {
  const errores = {}
  if (!borrador.fecha) errores.fecha = 'Elige una fecha'
  else if (borrador.fecha > hoy()) errores.fecha = 'No puede ser futura'

  const peso = leerNumero(borrador.pesoKg)
  if (borrador.pesoKg === '' || Number.isNaN(peso)) errores.pesoKg = 'Escribe tu peso'
  else if (peso < 20 || peso > 350) errores.pesoKg = 'Debe estar entre 20 y 350'
  return errores
}

export default function PaginaPeso() {
  const [registros, setRegistros] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [borrador, setBorrador] = useState(formularioVacio)
  const [corrigiendo, setCorrigiendo] = useState(null) // id del registro que se está corrigiendo
  const [errores, setErrores] = useState({})
  const [errorAccion, setErrorAccion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [intento, setIntento] = useState(0) // al reintentar, el efecto vuelve a pedir los registros

  useEffect(() => {
    api.get('/peso-corporal').then(setRegistros).catch(setErrorCarga)
  }, [intento])

  function recargar() {
    setErrorCarga(null)
    setIntento((anterior) => anterior + 1)
  }

  function cancelar() {
    setCorrigiendo(null)
    setBorrador(formularioVacio())
    setErrores({})
    setErrorAccion(null)
  }

  // El lápiz carga el registro en el formulario de arriba (historia H24)
  function empezarCorreccion(registro) {
    setCorrigiendo(registro.id)
    setBorrador({ fecha: registro.fecha, pesoKg: formatoNumero(registro.pesoKg) })
    setErrores({})
    setErrorAccion(null)
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorAccion(null)
    const encontrados = validar(borrador)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    const cuerpo = { fecha: borrador.fecha, pesoKg: leerNumero(borrador.pesoKg) }
    setEnviando(true)
    try {
      if (corrigiendo) await api.put(`/peso-corporal/${corrigiendo}`, cuerpo)
      else await api.post('/peso-corporal', cuerpo)
      setRegistros(await api.get('/peso-corporal'))
      cancelar()
    } catch (e) {
      if (e.codigo === 'PESO_YA_REGISTRADO') setErrores({ fecha: 'Ya registraste tu peso ese día' })
      else if (Object.keys(e.campos).length > 0) setErrores(e.campos)
      else setErrorAccion(e)
    } finally {
      setEnviando(false)
    }
  }

  async function eliminar(registro) {
    if (!window.confirm(`¿Eliminar el registro del ${formatoFecha(registro.fecha, { diaSemana: false })}?`)) return
    setErrorAccion(null)
    setEnviando(true)
    try {
      await api.borrar(`/peso-corporal/${registro.id}`)
      setRegistros(await api.get('/peso-corporal'))
      if (corrigiendo === registro.id) cancelar()
    } catch (e) {
      setErrorAccion(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina num">
      <h1>Peso corporal</h1>

      <form className="tarjeta formulario" onSubmit={guardar} noValidate>
        <div className="fila-campos">
          <CampoFormulario etiqueta="Fecha" error={errores.fecha}>
            <input
              type="date"
              value={borrador.fecha}
              max={hoy()}
              onChange={(evento) => setBorrador({ ...borrador, fecha: evento.target.value })}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Peso (kg)" error={errores.pesoKg}>
            <input
              value={borrador.pesoKg}
              inputMode="decimal"
              placeholder="77,5"
              onChange={(evento) => setBorrador({ ...borrador, pesoKg: evento.target.value })}
            />
          </CampoFormulario>
        </div>
        <MensajeError error={errorAccion} />
        <div className="acciones">
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? 'Guardando…' : corrigiendo ? 'Guardar cambios' : 'Registrar'}
          </button>
          {corrigiendo && (
            <button type="button" className="btn btn-secundario btn-bloque" onClick={cancelar} disabled={enviando}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {errorCarga ? (
        <MensajeError error={errorCarga} alReintentar={recargar} />
      ) : registros === null ? (
        <Cargando texto="Cargando tus registros…" />
      ) : registros.length === 0 ? (
        <EstadoVacio titulo="Aún no has registrado tu peso" texto="Registra el de hoy para ver tu evolución." />
      ) : (
        <>
          {/* Los registros llegan en orden cronológico, que es como los necesita la gráfica */}
          <GraficaLinea puntos={registros.map((registro) => ({ fecha: registro.fecha, valor: registro.pesoKg }))} />
          <div className="lista">
            {/* La lista va al revés: del más reciente al más antiguo */}
            {[...registros].reverse().map((registro, i, lista) => (
              <FilaRegistro
                key={registro.id}
                registro={registro}
                anterior={lista[i + 1]}
                enviando={enviando}
                alCorregir={() => empezarCorreccion(registro)}
                alEliminar={() => eliminar(registro)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

// La diferencia contra el registro anterior. Va en gris: subir o bajar no es bueno ni malo por sí mismo
function diferencia(registro, anterior) {
  if (!anterior) return '—'
  const cambio = registro.pesoKg - anterior.pesoKg
  if (cambio === 0) return '='
  return `${cambio > 0 ? '+' : '−'}${formatoNumero(Math.abs(cambio))}`
}

function FilaRegistro({ registro, anterior, enviando, alCorregir, alEliminar }) {
  return (
    <div className="lista-fila">
      <div className="crece">
        <b>{formatoKg(registro.pesoKg)}</b>
        <div className="texto-3">{formatoFecha(registro.fecha, { anio: true })}</div>
      </div>
      <span className="etiqueta">{diferencia(registro, anterior)}</span>
      <button type="button" className="btn-icono" onClick={alCorregir} disabled={enviando} aria-label="Corregir">
        <Icono nombre="lapiz" tamano={18} />
      </button>
      <button type="button" className="btn-icono" onClick={alEliminar} disabled={enviando} aria-label="Eliminar">
        <Icono nombre="basura" tamano={18} />
      </button>
    </div>
  )
}