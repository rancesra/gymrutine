import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { obtenerReferencias } from '../utilidades/referencias.js'

// P2 Crear cuenta (historia H1). Reglas: docs/mockup/README.md, sección P2.
export default function PaginaRegistro() {
  const { token, registrarse } = useAuth()
  const [objetivos, setObjetivos] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [datos, setDatos] = useState({ nombre: '', email: '', contrasena: '', objetivo: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function cargarObjetivos() {
    obtenerReferencias()
      .then((referencias) => setObjetivos(referencias.objetivos))
      .catch(setErrorCarga)
  }

  useEffect(() => {
    cargarObjetivos()
  }, [])

  function reintentar() {
    setErrorCarga(null)
    cargarObjetivos()
  }

  // Al crear la cuenta la sesión queda iniciada, y esta pantalla lleva al inicio
  if (token) return <Navigate to="/" replace />

  function cambiar(campo) {
    return (evento) => setDatos({ ...datos, [campo]: evento.target.value })
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await registrarse({ ...datos, nombre: datos.nombre.trim(), email: datos.email.trim() })
    } catch (e) {
      setError(e)
      setEnviando(false)
    }
  }

  // Errores junto a cada campo: los de "campos" (400) y el email repetido (409)
  const errores = { ...(error?.campos ?? {}) }
  if (error?.codigo === 'EMAIL_YA_REGISTRADO') errores.email = error.message
  const errorGeneral = error && Object.keys(errores).length === 0 ? error : null

  return (
    <main className="pantalla-acceso">
      <h1>Crear cuenta</h1>
      <form className="formulario" onSubmit={enviar}>
        <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
          <input required minLength={2} maxLength={80} autoComplete="name" value={datos.nombre} onChange={cambiar('nombre')} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Email" error={errores.email}>
          <input type="email" required maxLength={120} autoComplete="email" value={datos.email} onChange={cambiar('email')} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Contraseña" error={errores.contrasena} ayuda="Entre 8 y 72 caracteres">
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={datos.contrasena}
            onChange={cambiar('contrasena')}
          />
        </CampoFormulario>

        <fieldset className="campo">
          <legend className="campo-etiqueta">¿Qué buscas en el gimnasio?</legend>
          <MensajeError error={errorCarga} alReintentar={reintentar} />
          {!objetivos && !errorCarga && <Cargando texto="Cargando objetivos…" />}
          {objetivos?.map((objetivo) => (
            <label key={objetivo.codigo} className="opcion">
              <input
                type="radio"
                name="objetivo"
                value={objetivo.codigo}
                required
                checked={datos.objetivo === objetivo.codigo}
                onChange={cambiar('objetivo')}
              />
              <span>
                <strong>{objetivo.nombre}</strong>
                <br />
                <span className="texto-2">{objetivo.descripcion}</span>
              </span>
            </label>
          ))}
          {errores.objetivo && <span className="error-texto">{errores.objetivo}</span>}
        </fieldset>

        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando || !objetivos}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <MensajeError error={errorGeneral} />
      </form>

      <p className="texto-2 centrado">
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </main>
  )
}