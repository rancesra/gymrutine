import { useState } from 'react'
import { api } from '../api/cliente.js'
import CampoFormulario from './CampoFormulario.jsx'
import Icono from './Icono.jsx'
import MensajeError from './MensajeError.jsx'

const MAXIMO_DESCRIPCION = 500

// Formulario de un ejercicio propio (P4, historias H7 y H8), a pantalla completa.
// ejercicio: el que se edita, o null para crear uno nuevo · alGuardar(ejercicioGuardado) · alCerrar()
export default function FormularioEjercicio({ ejercicio, referencias, objetivoInicial, alCerrar, alGuardar }) {
  const editando = ejercicio !== null
  const [datos, setDatos] = useState(() => ({
    nombre: ejercicio?.nombre ?? '',
    grupoMuscular: ejercicio?.grupoMuscular ?? '',
    equipo: ejercicio?.equipo ?? '',
    objetivos: ejercicio?.objetivos ?? (objetivoInicial ? [objetivoInicial] : []),
    descripcion: ejercicio?.descripcion ?? '',
  }))
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function cambiar(campo) {
    return (evento) => setDatos({ ...datos, [campo]: evento.target.value })
  }

  function alternarObjetivo(codigo) {
    const objetivos = datos.objetivos.includes(codigo)
      ? datos.objetivos.filter((o) => o !== codigo)
      : [...datos.objetivos, codigo]
    setDatos({ ...datos, objetivos })
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorEnvio(null)
    const encontrados = validar(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    // Los objetivos van en el orden de GET /referencias, sin importar en qué orden se marcaron
    const cuerpo = {
      ...datos,
      nombre: datos.nombre.trim(),
      objetivos: referencias.objetivos.map((o) => o.codigo).filter((codigo) => datos.objetivos.includes(codigo)),
      descripcion: datos.descripcion.trim() || null,
    }
    try {
      const guardado = editando ? await api.put(`/ejercicios/${ejercicio.id}`, cuerpo) : await api.post('/ejercicios', cuerpo)
      alGuardar(guardado)
    } catch (e) {
      // 409: ya existe un ejercicio con ese nombre, el mensaje va bajo el nombre
      if (e.codigo === 'EJERCICIO_DUPLICADO') setErrores({ nombre: e.message })
      else if (Object.keys(e.campos).length > 0) setErrores(e.campos)
      else setErrorEnvio(e)
      setEnviando(false)
    }
  }

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario">
      <form className="hoja-contenido" onSubmit={guardar} noValidate>
        <div className="encabezado">
          <button type="button" className="btn-volver btn-icono" aria-label="Cancelar" onClick={alCerrar}>
            <Icono nombre="atras" />
          </button>
          <h1 id="titulo-formulario">{editando ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h1>
        </div>

        <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
          <input value={datos.nombre} maxLength={80} placeholder="Press en máquina Smith" onChange={cambiar('nombre')} />
        </CampoFormulario>

        <div className="kpis">
          <CampoFormulario etiqueta="Grupo muscular" error={errores.grupoMuscular}>
            <select value={datos.grupoMuscular} onChange={cambiar('grupoMuscular')}>
              <option value="" disabled>
                Elige uno
              </option>
              {referencias.gruposMusculares.map((grupo) => (
                <option key={grupo.codigo} value={grupo.codigo}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>
          <CampoFormulario etiqueta="Equipo" error={errores.equipo}>
            <select value={datos.equipo} onChange={cambiar('equipo')}>
              <option value="" disabled>
                Elige uno
              </option>
              {referencias.equipos.map((opcion) => (
                <option key={opcion.codigo} value={opcion.codigo}>
                  {opcion.nombre}
                </option>
              ))}
            </select>
          </CampoFormulario>
        </div>

        <fieldset className="campo">
          <legend className="campo-etiqueta">Recomendado para</legend>
          {referencias.objetivos.map((opcion) => (
            <label key={opcion.codigo} className="opcion">
              <input
                type="checkbox"
                checked={datos.objetivos.includes(opcion.codigo)}
                onChange={() => alternarObjetivo(opcion.codigo)}
              />
              <span>{opcion.nombre}</span>
            </label>
          ))}
          {errores.objetivos && <span className="error-texto">{errores.objetivos}</span>}
        </fieldset>

        <CampoFormulario
          etiqueta="Descripción (opcional)"
          error={errores.descripcion}
          ayuda={`${datos.descripcion.length} / ${MAXIMO_DESCRIPCION}`}
        >
          <textarea
            rows={3}
            value={datos.descripcion}
            maxLength={MAXIMO_DESCRIPCION}
            placeholder="Cómo se hace, en pocas palabras"
            onChange={cambiar('descripcion')}
          />
        </CampoFormulario>

        <MensajeError error={errorEnvio} />
        <div className="pie-fijo">
          <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar ejercicio'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Aviso rápido en el navegador con las mismas reglas del backend, que es quien valida de verdad.
function validar(datos) {
  const errores = {}
  const largo = datos.nombre.trim().length
  if (largo < 3 || largo > 80) errores.nombre = 'Debe tener entre 3 y 80 caracteres'
  if (!datos.grupoMuscular) errores.grupoMuscular = 'Elige un grupo muscular'
  if (!datos.equipo) errores.equipo = 'Elige un equipo'
  if (datos.objetivos.length === 0) errores.objetivos = 'Elige entre 1 y 3 objetivos'
  if (datos.descripcion.length > MAXIMO_DESCRIPCION) errores.descripcion = 'Máximo 500 caracteres'
  return errores
}
