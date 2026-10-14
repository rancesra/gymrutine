import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../api/cliente.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import EstadoVacio from '../componentes/EstadoVacio.jsx'
import FilasSeries from '../componentes/FilasSeries.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import ResumenSesion from '../componentes/ResumenSesion.jsx'
import { borrarBorrador, guardarBorrador, leerBorrador } from '../utilidades/borrador.js'
import { fechaHoraLocal, formatoFecha, formatoHora, formatoNumero, leerNumero } from '../utilidades/formato.js'

// P7 Entrenar (historias H14 y H18) y, al guardar, P8 Resumen. Reglas: docs/mockup/README.md, secciones P7 y P8.
// Va sin la barra de navegación, para no salir sin querer en medio del entrenamiento.
export default function PaginaEntrenar() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [datos, setDatos] = useState(null) // { rutina, ultimos } tal como llegan de la API
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0)
  const [pendiente, setPendiente] = useState(null) // borrador encontrado al abrir: se ofrece continuarlo
  const [entreno, setEntreno] = useState(null) // el entrenamiento en curso, el mismo objeto que se guarda como borrador
  const [ahora, setAhora] = useState(() => Date.now())
  const [cambiandoInicio, setCambiandoInicio] = useState(false)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const [duracion, setDuracion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState(null)
  const [guardada, setGuardada] = useState(null) // { sesion, recordsPrevios } después del 201

  useEffect(() => {
    Promise.all([api.get(`/rutinas/${id}`), api.get(`/sesiones/ultimos-registros?rutinaId=${id}`)])
      .then(([rutina, ultimos]) => {
        setDatos({ rutina, ultimos })
        const guardado = leerBorrador(id)
        if (rutina.activa && esBorradorValido(guardado)) setPendiente(guardado)
        else if (rutina.activa) setEntreno(armarEntreno(rutina, ultimos))
      })
      .catch((error) => {
        // Sin señal pero con un borrador guardado, se puede seguir entrenando
        const guardado = leerBorrador(id)
        if (error.codigo === 'SIN_CONEXION' && esBorradorValido(guardado)) setPendiente(guardado)
        else setErrorCarga(error)
      })
  }, [id, intento])

  // El reloj del tiempo transcurrido
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(reloj)
  }, [])

  // Cada cambio del usuario actualiza la pantalla y el borrador
  function actualizar(nuevo) {
    setEntreno(nuevo)
    guardarBorrador(id, nuevo)
  }

  function actualizarEjercicio(i, cambios) {
    actualizar({ ...entreno, ejercicios: entreno.ejercicios.map((e, k) => (k === i ? { ...e, ...cambios } : e)) })
  }

  function continuarBorrador() {
    setEntreno(pendiente)
    setPendiente(null)
  }

  function descartarBorrador() {
    borrarBorrador(id)
    setPendiente(null)
    if (datos) {
      setEntreno(armarEntreno(datos.rutina, datos.ultimos))
    } else {
      setErrorCarga(null)
      setIntento(intento + 1)
    }
  }

  function reintentarCarga() {
    setErrorCarga(null)
    setIntento(intento + 1)
  }

  function salir() {
    const hayHechas = entreno?.ejercicios.some((e) => e.series.some((serie) => serie.hecha))
    if (hayHechas && !window.confirm('¿Salir? Tu entrenamiento queda como borrador')) return
    navegar('/rutinas')
  }

  // Marcar una serie la valida; si no cumple, se resalta y no se marca. Desmarcar siempre se puede.
  function marcar(i, j) {
    const serie = entreno.ejercicios[i].series[j]
    const erroresSerie = serie.hecha ? {} : validarSerie(serie)
    const sinEstaSerie = Object.fromEntries(Object.entries(errores).filter(([clave]) => !clave.startsWith(`${i}.${j}.`)))
    setErrores({ ...sinEstaSerie, ...prefijar(erroresSerie, `${i}.${j}.`) })
    if (Object.keys(erroresSerie).length > 0) return
    setAviso(null)
    const series = entreno.ejercicios[i].series.map((s, k) => (k === j ? { ...s, hecha: !s.hecha } : s))
    actualizarEjercicio(i, { series })
  }

  function cambiarInicio(valor) {
    if (valor) actualizar({ ...entreno, fechaInicio: `${valor}:00` })
  }

  // "Terminar y guardar": revisa lo marcado y abre la confirmación con la duración propuesta
  function terminar() {
    setAviso(null)
    const enviables = ejerciciosEnviables(entreno)
    if (enviables.length === 0) {
      setAviso('Marca al menos una serie hecha')
      return
    }
    // Una serie marcada se pudo editar después: se revisa de nuevo
    const encontrados = {}
    entreno.ejercicios.forEach((e, i) => {
      if (!enviables.includes(e)) return
      e.series.forEach((serie, j) => {
        if (serie.hecha) Object.assign(encontrados, prefijar(validarSerie(serie), `${i}.${j}.`))
      })
    })
    if (entreno.fechaInicio > fechaHoraLocal()) {
      encontrados.fechaInicio = 'La fecha de inicio no puede ser futura'
      setCambiandoInicio(true)
    }
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      setAviso('Revisa los campos marcados')
      return
    }
    const minutos = Math.round((Date.now() - entreno.abiertaEn) / 60000)
    setDuracion(String(Math.min(600, Math.max(1, minutos))))
    setErrorGuardar(null)
    setConfirmando(true)
  }

  async function guardar() {
    const minutos = leerNumero(duracion)
    if (!duracion.trim() || !Number.isInteger(minutos) || minutos < 1 || minutos > 600) {
      setErrores({ ...errores, duracionMinutos: 'Debe estar entre 1 y 600 minutos' })
      return
    }
    const { cuerpo, mapa } = armarCuerpo(entreno, minutos)
    setErrores({})
    setErrorGuardar(null)
    setEnviando(true)
    try {
      const sesion = await api.post('/sesiones', cuerpo)
      borrarBorrador(id)
      const recordsPrevios = Object.fromEntries(entreno.ejercicios.map((e) => [e.ejercicio.id, e.recordKg]))
      setGuardada({ sesion, recordsPrevios })
    } catch (error) {
      if (error.codigo === 'VALIDACION_FALLIDA' && Object.keys(error.campos).length > 0) {
        mostrarErroresDelServidor(error.campos, mapa)
      } else {
        // Sin conexión u otro error: no se borra nada y el botón pasa a "Reintentar"
        setErrorGuardar(error)
      }
    } finally {
      setEnviando(false)
    }
  }

  // Un 400 trae las rutas del cuerpo enviado (registros[0].series[1].pesoKg); se traducen a las filas de la pantalla
  function mostrarErroresDelServidor(campos, mapa) {
    const traducidos = {}
    let general = null
    for (const [ruta, mensaje] of Object.entries(campos)) {
      const serie = ruta.match(/^registros\[(\d+)\]\.series\[(\d+)\]\.(\w+)$/)
      if (serie) {
        const { indice, filas } = mapa[Number(serie[1])]
        traducidos[`${indice}.${filas[Number(serie[2])]}.${serie[3]}`] = mensaje
      } else if (ruta === 'fechaInicio' || ruta === 'duracionMinutos') {
        traducidos[ruta] = mensaje
      } else {
        // rutinaId o ejercicioId: la rutina o un ejercicio cambiaron mientras se entrenaba
        general = `No se pudo guardar: ${mensaje}. Tus datos siguen aquí.`
      }
    }
    setErrores(traducidos)
    if (traducidos.fechaInicio) setCambiandoInicio(true)
    // Si el único error es la duración, se corrige en la misma confirmación
    const soloDuracion = Object.keys(traducidos).every((clave) => clave === 'duracionMinutos') && !general
    if (!soloDuracion) {
      setConfirmando(false)
      setAviso(general ?? 'Revisa los campos marcados')
    }
  }

  if (guardada) return <ResumenSesion sesion={guardada.sesion} recordsPrevios={guardada.recordsPrevios} />

  if (errorCarga?.estado === 404) {
    return (
      <main className="pantalla-entrenar">
        <EstadoVacio titulo="No encontramos lo que buscas" texto="La rutina no existe.">
          <Link to="/rutinas" className="btn btn-primario">
            Volver a mis rutinas
          </Link>
        </EstadoVacio>
      </main>
    )
  }

  if (datos && !datos.rutina.activa) {
    return (
      <main className="pantalla-entrenar">
        <EstadoVacio titulo="Esta rutina fue eliminada" texto="Ya no se puede entrenar. Sus sesiones siguen en tu historial.">
          <Link to="/rutinas" className="btn btn-primario">
            Volver a mis rutinas
          </Link>
        </EstadoVacio>
      </main>
    )
  }

  if (errorCarga) {
    return (
      <main className="pantalla-entrenar pagina">
        <h1>Entrenar</h1>
        <MensajeError error={errorCarga} alReintentar={reintentarCarga} />
      </main>
    )
  }

  if (pendiente) {
    return (
      <main className="pantalla-entrenar pagina">
        <h1>{pendiente.rutinaNombre}</h1>
        <div className="aviso alerta">
          <span>
            Tienes un entrenamiento sin guardar del {formatoFecha(pendiente.fechaInicio)},{' '}
            {formatoHora(pendiente.fechaInicio)}.
          </span>
        </div>
        <div className="kpis">
          <button type="button" className="btn btn-secundario" onClick={descartarBorrador}>
            Descartar
          </button>
          <button type="button" className="btn btn-primario" onClick={continuarBorrador}>
            Continuar
          </button>
        </div>
      </main>
    )
  }

  if (!entreno) {
    return (
      <main className="pantalla-entrenar pagina">
        <h1>Entrenar</h1>
        <Cargando texto="Preparando tu rutina…" />
      </main>
    )
  }

  const resumen = resumenEnVivo(entreno)
  return (
    <main className="pantalla-entrenar pagina">
      <div className="encabezado">
        <button type="button" className="btn-volver btn-icono" aria-label="Salir del entrenamiento" onClick={salir}>
          <Icono nombre="atras" />
        </button>
        <h1>
          {entreno.rutinaNombre}
          <small>
            Inicio: {formatoFecha(entreno.fechaInicio)}, {formatoHora(entreno.fechaInicio)} ·{' '}
            <button type="button" className="enlace-boton" onClick={() => setCambiandoInicio(!cambiandoInicio)}>
              Cambiar
            </button>
          </small>
        </h1>
        <span className="etiqueta gris num" aria-label="Tiempo transcurrido">
          <Icono nombre="historial" tamano={14} />
          {tiempoTranscurrido(ahora - entreno.abiertaEn)}
        </span>
      </div>

      {cambiandoInicio && (
        <CampoFormulario etiqueta="Fecha y hora de inicio" error={errores.fechaInicio}>
          <input
            type="datetime-local"
            value={entreno.fechaInicio.slice(0, 16)}
            max={fechaHoraLocal().slice(0, 16)}
            onChange={(evento) => cambiarInicio(evento.target.value)}
          />
        </CampoFormulario>
      )}

      <div className="tarjeta resumen-sesion num">
        <span>
          <b>{resumen.ejercicios}</b> <span className="texto-3">ejercicios</span>
        </span>
        <span>
          <b>{resumen.series}</b> <span className="texto-3">series</span>
        </span>
        <span>
          <b>{formatoNumero(resumen.volumenKg)}</b> <span className="texto-3">kg</span>
        </span>
      </div>

      {entreno.ejercicios.map((e, i) => (
        <TarjetaEjercicio
          key={e.ejercicio.id}
          numero={i + 1}
          ejercicio={e}
          alCambiarSeries={(series) => actualizarEjercicio(i, { series })}
          alMarcar={(j) => marcar(i, j)}
          alSaltar={() => actualizarEjercicio(i, { saltado: !e.saltado })}
          errorDe={(j, campo) => errores[`${i}.${j}.${campo}`]}
        />
      ))}

      <div className="pie-entrenar">
        <div className="series">
          {aviso && (
            <div className="aviso error" role="alert">
              <span>{aviso}</span>
            </div>
          )}
          <button type="button" className="btn btn-primario btn-bloque" onClick={terminar}>
            Terminar y guardar
          </button>
        </div>
      </div>

      {confirmando && (
        <div className="velo">
          <div className="hoja-confirmar num" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmar">
            <h2 id="titulo-confirmar">¿Terminar la sesión?</h2>
            <div className="kpis">
              <div className="kpi">
                <small>Series</small>
                <b>{resumen.series}</b>
              </div>
              <div className="kpi">
                <small>Volumen</small>
                <b>{formatoNumero(resumen.volumenKg)} kg</b>
              </div>
            </div>
            <CampoFormulario
              etiqueta="Duración (minutos)"
              error={errores.duracionMinutos}
              ayuda="Calculada desde que abriste la rutina. Puedes corregirla."
            >
              <input value={duracion} inputMode="numeric" onChange={(evento) => setDuracion(evento.target.value)} />
            </CampoFormulario>
            {errorGuardar?.codigo === 'SIN_CONEXION' ? (
              <div className="aviso error" role="alert">
                <span>
                  <b>No se pudo guardar.</b> Tus datos siguen aquí: reintenta cuando tengas señal.
                </span>
              </div>
            ) : (
              <MensajeError error={errorGuardar} />
            )}
            <div className="kpis">
              <button type="button" className="btn btn-secundario" onClick={() => setConfirmando(false)} disabled={enviando}>
                Seguir entrenando
              </button>
              <button type="button" className="btn btn-primario" onClick={guardar} disabled={enviando}>
                {enviando ? 'Guardando…' : errorGuardar ? 'Reintentar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function TarjetaEjercicio({ numero, ejercicio: e, alCambiarSeries, alMarcar, alSaltar, errorDe }) {
  // Un ejercicio eliminado del catálogo después de armar la rutina no se puede registrar
  if (!e.ejercicio.activo) {
    return (
      <div className="tarjeta saltado">
        <h2>
          {numero}. {e.ejercicio.nombre}
        </h2>
        <span className="etiqueta gris">Ya no está en el catálogo</span>
      </div>
    )
  }

  return (
    <div className={e.saltado ? 'tarjeta series saltado' : 'tarjeta series'}>
      <h2>
        {numero}. {e.ejercicio.nombre}
      </h2>
      <div className="chips">
        <span className="etiqueta objetivo">
          Objetivo {e.objetivo.series} × {e.objetivo.repeticiones}
        </span>
        {e.recordKg != null && (
          <span className="etiqueta record">
            <Icono nombre="trofeo" tamano={14} />
            Tu récord: {formatoNumero(e.recordKg)} kg
          </span>
        )}
      </div>
      {e.ultimaFecha && <span className="texto-3">Valores de la última vez: {formatoFecha(e.ultimaFecha)}</span>}
      <FilasSeries
        series={e.series}
        alCambiar={alCambiarSeries}
        alMarcar={alMarcar}
        recordKg={e.recordKg}
        errorDe={errorDe}
        deshabilitado={e.saltado}
      />
      <div className="entre">
        <span className="texto-3">{e.saltado ? 'Este ejercicio no se guardará' : ''}</span>
        <button type="button" className="btn btn-fantasma btn-sm" onClick={alSaltar}>
          {e.saltado ? 'Retomar' : 'Saltar'}
        </button>
      </div>
    </div>
  )
}

// ---------- Funciones puras ----------

function esBorradorValido(borrador) {
  return Array.isArray(borrador?.ejercicios) && typeof borrador.fechaInicio === 'string'
}

// Arma el entrenamiento a partir de la rutina y de lo que se hizo la última vez (ultimos-registros)
function armarEntreno(rutina, ultimos) {
  const porEjercicio = new Map(ultimos.map((u) => [u.ejercicioId, u]))
  const items = [...rutina.ejercicios].sort((a, b) => a.orden - b.orden)
  return {
    rutinaId: rutina.id,
    rutinaNombre: rutina.nombre,
    abiertaEn: Date.now(),
    fechaInicio: fechaHoraLocal(),
    ejercicios: items.map((item) => {
      const ultimo = porEjercicio.get(item.ejercicio.id)
      const previas = ultimo?.series ?? []
      // Tantas filas como el objetivo, o como la última vez si fueron más
      const cantidad = Math.max(item.seriesObjetivo, previas.length)
      return {
        ejercicio: item.ejercicio,
        objetivo: { series: item.seriesObjetivo, repeticiones: item.repeticionesObjetivo },
        recordKg: ultimo?.recordKg ?? null,
        ultimaFecha: ultimo?.fechaInicio ?? null,
        saltado: false,
        series: Array.from({ length: cantidad }, (_, j) => {
          // Cada fila copia su serie de la última vez o, si no la hay, la última disponible
          const previa = previas[j] ?? previas.at(-1)
          return previa
            ? { pesoKg: String(previa.pesoKg).replace('.', ','), repeticiones: String(previa.repeticiones), hecha: false }
            : { pesoKg: '', repeticiones: String(item.repeticionesObjetivo), hecha: false }
        }),
      }
    }),
  }
}

// Los ejercicios que se envían: activos, no saltados y con al menos una serie hecha
function ejerciciosEnviables(entreno) {
  return entreno.ejercicios.filter((e) => e.ejercicio.activo && !e.saltado && e.series.some((serie) => serie.hecha))
}

// Solo las series hechas, en el formato del contrato. "mapa" recuerda de qué tarjeta y fila salió cada una,
// para ubicar los errores que devuelva el servidor.
function armarCuerpo(entreno, duracionMinutos) {
  const mapa = []
  const registros = []
  entreno.ejercicios.forEach((e, indice) => {
    if (!ejerciciosEnviables(entreno).includes(e)) return
    const filas = []
    const series = []
    e.series.forEach((serie, j) => {
      if (!serie.hecha) return
      filas.push(j)
      series.push({ pesoKg: leerNumero(serie.pesoKg), repeticiones: leerNumero(serie.repeticiones) })
    })
    mapa.push({ indice, filas })
    registros.push({ ejercicioId: e.ejercicio.id, series })
  })
  return { cuerpo: { rutinaId: entreno.rutinaId, fechaInicio: entreno.fechaInicio, duracionMinutos, registros }, mapa }
}

// Ejercicios, series hechas y kg (peso × repeticiones), con cada fila marcada
function resumenEnVivo(entreno) {
  const enviables = ejerciciosEnviables(entreno)
  const hechas = enviables.flatMap((e) => e.series.filter((serie) => serie.hecha))
  const volumenKg = hechas.reduce((total, serie) => {
    const kg = leerNumero(serie.pesoKg) * leerNumero(serie.repeticiones)
    return Number.isFinite(kg) ? total + kg : total
  }, 0)
  return { ejercicios: enviables.length, series: hechas.length, volumenKg: Math.round(volumenKg * 100) / 100 }
}

// Las mismas reglas del backend: de 0 a 500 kg con máximo 2 decimales, y de 1 a 100 repeticiones
function validarSerie(serie) {
  const errores = {}
  const peso = leerNumero(serie.pesoKg)
  if (!String(serie.pesoKg).trim() || Number.isNaN(peso) || peso < 0 || peso > 500) {
    errores.pesoKg = 'El peso debe estar entre 0 y 500 kg'
  } else if (Math.abs(peso * 100 - Math.round(peso * 100)) > 1e-9) {
    errores.pesoKg = 'El peso admite máximo 2 decimales'
  }
  const reps = leerNumero(serie.repeticiones)
  if (!String(serie.repeticiones).trim() || !Number.isInteger(reps) || reps < 1 || reps > 100) {
    errores.repeticiones = 'Las repeticiones deben estar entre 1 y 100'
  }
  return errores
}

function prefijar(errores, prefijo) {
  return Object.fromEntries(Object.entries(errores).map(([campo, mensaje]) => [prefijo + campo, mensaje]))
}

// 134000 ms → "02:14" · más de una hora → "1:02:14"
function tiempoTranscurrido(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const dos = (numero) => String(numero).padStart(2, '0')
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const texto = `${dos(minutos)}:${dos(total % 60)}`
  return horas > 0 ? `${horas}:${texto}` : texto
}
