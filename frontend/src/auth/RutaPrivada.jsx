import { Navigate, Outlet } from 'react-router'
import { useAuth } from './useAuth.js'

// Envuelve las rutas privadas: sin sesión iniciada, lleva a /login.
export default function RutaPrivada() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}