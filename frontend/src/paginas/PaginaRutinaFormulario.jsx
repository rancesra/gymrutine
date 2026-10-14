import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/cliente.js'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import SelectorEjercicios from '../componentes/SelectorEjercicios.jsx'
import { leerNumero } from '../utilidades/formato.js'
import { obtenerReferencias } from '../utilidades/referencias.js'

const MAXIMO_EJERCICIOS = 15

// P6 Constructor de rutina, al crear (historia H10). Reglas: docs/mockup/README.md, sección P6.
export default function PaginaRutinaFormulario() {
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const [referencias, setReferencias] = useState(null)
  const [catalogo, setCatalogo] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0) // al reintentar, el efecto vuelve a pedir los datos
  const [nombre, setNombre] = useState('')
  const [objetivo, setObjetivo] = useState(usuario?.objetivo ?? 'FUERZA')
  // [{ ejercicio, seriesObjetivo: '4', repeticionesObjetivo: '5' }]: los números como texto, tal como se escriben
  const [ejercicios, setEjercicios] = useState([])
  const [eligiendo, setEligiendo] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const hayCambios = nombre.trim() !== '' || ejercicios.length > 0

  useEffect(() => {
    Promise.all([obtenerReferencias(), api.get('/ejercicios')])
      .then(([refs, lista]) => {
        setReferencias(refs)
        setCatalogo(lista)
      })
      .catch(setErrorCarga)
  }, [intento])

  // Cerrar o recargar la pestaña con cambios sin guardar también pregunta
  useEffect(() => {
    if (!hayCambios || enviando) return undefined
    const avisar = (evento) => evento.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [hayCambios, enviando])

  function reintentar() {
    setErrorCarga(null)
    setIntento(intento + 1)
  }

  function salir() {
    if (hayCambios && !window.confirm('¿Salir sin guardar?')) return
    navegar('/rutinas')
  }

  // Llega con las series y repeticiones sugeridas para el objetivo elegido en este momento
  function agregar(ejercicio) {
    const sugerido = referencias.objetivos.find((o) => o.codigo === objetivo)
    setEjercicios([
      ...ejercicios,
      {
        ejercicio,
        seriesObjetivo: String(sugerido.seriesSugeridas),
        repeticionesObjetivo: String(sugerido.repeticionesSugeridas),
      },
    ])
  }

  function cambiar(i, campo, valor) {
    setEjercicios(ejercicios.map((item, k) => (k === i ? { ...item, [campo]: valor } : item)))
  }

  // Los errores van por posición: al mover o quitar un ejercicio ya no corresponden, se limpian
  function mover(i, destino) {
    const nueva = [...ejercicios]
    ;[nueva[i], nueva[destino]] = [nueva[destino], nueva[i]]
    setEjercicios(nueva)
    setErrores({})
  }

  function quitar(i) {
    setEjercicios(ejercicios.filter((item, k) => k !== i))
    setErrores({})
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorEnvio(null)
    const encontrados = validar(nombre, ejercicios)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    try {
      await api.post('/rutinas', aCuerpo(nombre, objetivo, ejercicios))
      navegar('/rutinas')
    } catch (e) {
      // Un 400 marca cada campo según la ruta que llega en "campos"
      if (Object.keys(e.campos).length > 0) setErrores(e.campos)
      else setErrorEnvio(e)
      setEnviando(false)
    }
  }

  if (errorCarga) {
    return (
      <section className="pagina">
        <Encabezado alVolver={salir} />
        <MensajeError error={errorCarga} alReintentar={reintentar} />
      </section>
    )
  }

  if (!referencias || !catalogo) {
    return (
      <section className="pagina">
        <Encabezado alVolver={salir} />
        <Cargando texto="Cargando el catálogo…" />
      </section>
    )
  }

  return (
    <>
      <form className="pagina" onSubmit={guardar} noValidate>
        <Encabezado alVolver={salir} />

        <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
          <input
            value={nombre}
            maxLength={80}
            placeholder="Pecho y tríceps"
            onChange={(evento) => setNombre(evento.target.value)}
          />
        </CampoFormulario>

        <fieldset className="campo">
          <legend className="campo-etiqueta">Objetivo</legend>
          <div className="chips">
            {referencias.objetivos.map((opcion) => (
              <label key={opcion.codigo} className="chip">
                <input
                  type="radio"
                  name="objetivo"
                  value={opcion.codigo}
                  checked={objetivo === opcion.codigo}
                  onChange={() => setObjetivo(opcion.codigo)}
                />
                {opcion.nombre}
              </label>
            ))}
          </div>
          {errores.objetivo && <span className="error-texto">{errores.objetivo}</span>}
        </fieldset>

        <div className="titulo-bloque">Ejercicios ({ejercicios.length})</div>
        {errores.ejercicios && <span className="error-texto">{errores.ejercicios}</span>}

        {ejercicios.map((item, i) => {
          const errorEjercicio = errores[`ejercicios[${i}].ejercicioId`] ?? errores[`ejercicios[${i}]`]
          return (
            <div key={item.ejercicio.id} className="tarjeta series">
              <div className="fila">
                <span className="etiqueta gris">{i + 1}</span>
                <b className="crece">{item.ejercicio.nombre}</b>
                <button
                  type="button"
                  className="btn-icono"
                  aria-label={`Subir ${item.ejercicio.nombre}`}
                  disabled={i === 0}
                  onClick={() => mover(i, i - 1)}
                >
                  <Icono nombre="arriba" tamano={18} />
                </button>
                <button
                  type="button"
                  className="btn-icono"
                  aria-label={`Bajar ${item.ejercicio.nombre}`}
                  disabled={i === ejercicios.length - 1}
                  onClick={() => mover(i, i + 1)}
                >
                  <Icono nombre="abajo" tamano={18} />
                </button>
                <button
                  type="button"
                  className="btn-icono peligro"
                  aria-label={`Quitar ${item.ejercicio.nombre}`}
                  onClick={() => quitar(i)}
                >
                  <Icono nombre="x" tamano={18} />
                </button>
              </div>
              {errorEjercicio && <span className="error-texto">{errorEjercicio}</span>}
              <div className="kpis">
                <CampoFormulario etiqueta="Series" error={errores[`ejercicios[${i}].seriesObjetivo`]}>
                  <input
                    value={item.seriesObjetivo}
                    inputMode="numeric"
                    onChange={(evento) => cambiar(i, 'seriesObjetivo', evento.target.value)}
                  />
                </CampoFormulario>
                <CampoFormulario etiqueta="Repeticiones" error={errores[`ejercicios[${i}].repeticionesObjetivo`]}>
                  <input
                    value={item.repeticionesObjetivo}
                    inputMode="numeric"
                    onChange={(evento) => cambiar(i, 'repeticionesObjetivo', evento.target.value)}
                  />
                </CampoFormulario>
              </div>
            </div>
          )
        })}

        <button
          type="button"
          className="btn btn-secundario btn-bloque"
          onClick={() => setEligiendo(true)}
          disabled={ejercicios.length >= MAXIMO_EJERCICIOS}
        >
          <Icono nombre="mas" tamano={18} />
          Agregar ejercicio
        </button>

        <MensajeError error={errorEnvio} />
        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar rutina'}
        </button>
      </form>

      {eligiendo && (
        <SelectorEjercicios
          catalogo={catalogo}
          referencias={referencias}
          objetivo={objetivo}
          idsAgregados={ejercicios.map((item) => item.ejercicio.id)}
          lleno={ejercicios.length >= MAXIMO_EJERCICIOS}
          alAgregar={agregar}
          alCerrar={() => setEligiendo(false)}
        />
      )}
    </>
  )
}

function Encabezado({ alVolver }) {
  return (
    <div className="encabezado">
      <button type="button" className="btn-volver btn-icono" aria-label="Volver a mis rutinas" onClick={alVolver}>
        <Icono nombre="atras" />
      </button>
      <h1>Nueva rutina</h1>
    </div>
  )
}

// Lo que se escribió → el cuerpo de POST /rutinas (contrato §6), en el orden visible
function aCuerpo(nombre, objetivo, ejercicios) {
  return {
    nombre: nombre.trim(),
    objetivo,
    ejercicios: ejercicios.map((item) => ({
      ejercicioId: item.ejercicio.id,
      seriesObjetivo: leerNumero(item.seriesObjetivo),
      repeticionesObjetivo: leerNumero(item.repeticionesObjetivo),
    })),
  }
}

// Aviso rápido en el navegador con las mismas reglas del backend, que es quien valida de verdad.
// Las claves son las mismas rutas de "campos" de la API, así los dos errores se muestran igual.
function validar(nombre, ejercicios) {
  const errores = {}
  const largo = nombre.trim().length
  if (largo < 3 || largo > 80) errores.nombre = 'Debe tener entre 3 y 80 caracteres'
  if (ejercicios.length < 1 || ejercicios.length > MAXIMO_EJERCICIOS) errores.ejercicios = 'Agrega entre 1 y 15 ejercicios'

  ejercicios.forEach((item, i) => {
    if (!enRango(item.seriesObjetivo, 1, 10)) errores[`ejercicios[${i}].seriesObjetivo`] = 'Debe estar entre 1 y 10'
    if (!enRango(item.repeticionesObjetivo, 1, 50)) {
      errores[`ejercicios[${i}].repeticionesObjetivo`] = 'Debe estar entre 1 y 50'
    }
  })
  return errores
}

// ¿Es un entero entre minimo y maximo?
function enRango(texto, minimo, maximo) {
  const valor = leerNumero(texto)
  return texto.trim() !== '' && Number.isInteger(valor) && valor >= minimo && valor <= maximo
}
