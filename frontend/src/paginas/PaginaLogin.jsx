import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'

// P1 Iniciar sesión (historia H2). Reglas: docs/mockup/README.md, sección P1.
export default function PaginaLogin() {
  const { token, iniciarSesion } = useAuth()
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  // Con la sesión ya iniciada, esta pantalla lleva directo al inicio
  if (token) return <Navigate to="/" replace />

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email.trim(), contrasena)
    } catch (e) {
      setError(e)
      setEnviando(false)
    }
  }

  return (
    <main className="pantalla-acceso">
      <div className="marca">
        <span className="logo-marca">
          <Icono nombre="rutinas" tamano={34} />
        </span>
        <span className="logo">
          Gym<b>Rutine</b>
        </span>
        <span className="texto-2">Entrena con plan. Mide de verdad.</span>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <CampoFormulario etiqueta="Email">
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Contraseña">
          <input
            type={verContrasena ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          <button
            type="button"
            className="btn-icono"
            onClick={() => setVerContrasena(!verContrasena)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icono nombre="ojo" />
          </button>
        </CampoFormulario>
        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
        <MensajeError error={error} />
      </form>

      <p className="texto-2 centrado">
        ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </main>
  )
}