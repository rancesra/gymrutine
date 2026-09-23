import { useContext } from 'react'
import { AuthContext } from './contexto.js'

// Da acceso a la sesión desde cualquier componente:
// const { token, usuario, iniciarSesion, registrarse, cerrarSesion } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}