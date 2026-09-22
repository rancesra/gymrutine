import { useState } from 'react'
import { api } from '../api/cliente.js'
import { AuthContext } from './contexto.js'

// Sesión del usuario disponible en toda la app. Se guarda también en localStorage
// para que sobreviva a una recarga de la página.
const CLAVE_TOKEN = 'gymrutine.token'
const CLAVE_USUARIO = 'gymrutine.usuario'

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CLAVE_TOKEN))
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  function guardarSesion(respuesta) {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    setToken(respuesta.token)
    setUsuario(respuesta.usuario)
  }

  async function iniciarSesion(email, contrasena) {
    guardarSesion(await api.post('/auth/login', { email, contrasena }))
  }

  async function registrarse(datos) {
    guardarSesion(await api.post('/auth/registro', datos))
  }

  async function cerrarSesion() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Aunque el servidor no responda, la sesión se cierra en este navegador
    }
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setToken(null)
    setUsuario(null)
  }

  function actualizarUsuario(nuevo) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevo))
    setUsuario(nuevo)
  }

  const valor = { token, usuario, iniciarSesion, registrarse, cerrarSesion, actualizarUsuario }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}