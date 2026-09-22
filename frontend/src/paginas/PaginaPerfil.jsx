import { useState } from 'react'
import { useAuth } from '../auth/useAuth.js'

// P14 Perfil. Por ahora muestra los datos y cierra la sesión (historia H3).
// Editar el nombre y el objetivo (historia H4) llega en el sprint 2 (T4, Rances).
export default function PaginaPerfil() {
  const { usuario, cerrarSesion } = useAuth()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    await cerrarSesion() // al borrarse la sesión, RutaPrivada lleva a /login
  }

  return (
    <section className="pagina">
      <h1>Perfil</h1>
      <div className="tarjeta fila">
        <span className="avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{usuario?.nombre}</strong>
          <div className="texto-2">{usuario?.email}</div>
        </div>
      </div>
      <button type="button" className="btn btn-secundario btn-bloque" onClick={salir} disabled={saliendo}>
        {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </section>
  )
}