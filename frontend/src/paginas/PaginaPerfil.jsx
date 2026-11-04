import { useEffect, useState } from 'react'
import { api } from '../api/cliente.js'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { obtenerReferencias } from '../utilidades/referencias.js'

// P14 Perfil (historias H3 y H4). Reglas: docs/mockup/README.md, sección P14.
// El email se muestra pero no se edita; el nombre y el objetivo sí.
export default function PaginaPerfil() {
  const { usuario, actualizarUsuario, cerrarSesion } = useAuth()
  const [referencias, setReferencias] = useState(null)
  const [borrador, setBorrador] = useState({ nombre: usuario?.nombre ?? '', objetivo: usuario?.objetivo ?? '' })
  const [errores, setErrores] = useState({})
  const [errorAccion, setErrorAccion] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    obtenerReferencias().then(setReferencias).catch(setErrorAccion)
  }, [])

  // Lo que el usuario escribió, sin cambios pendientes, deja el botón en reposo
  const sinCambios = borrador.nombre.trim() === usuario?.nombre && borrador.objetivo === usuario?.objetivo

  function cambiar(campo, valor) {
    setBorrador({ ...borrador, [campo]: valor })
    setGuardado(false)
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorAccion(null)
    setGuardado(false)

    const nombre = borrador.nombre.trim()
    if (nombre.length < 2 || nombre.length > 80) {
      setErrores({ nombre: 'Debe tener entre 2 y 80 caracteres' })
      return
    }
    setErrores({})

    setGuardando(true)
    try {
      // La respuesta trae el usuario ya actualizado: se guarda en la sesión para toda la app
      actualizarUsuario(await api.put('/usuarios/me', { nombre, objetivo: borrador.objetivo }))
      setGuardado(true)
    } catch (e) {
      if (Object.keys(e.campos).length > 0) setErrores(e.campos)
      else setErrorAccion(e)
    } finally {
      setGuardando(false)
    }
  }

  async function salir() {
    setSaliendo(true)
    await cerrarSesion() // al borrarse la sesión, RutaPrivada lleva a /login
  }

  return (
    <section className="pagina">
      <h1>Perfil</h1>

      <div className="tarjeta fila">
        <span className="avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
        <div className="crece">
          <strong>{usuario?.nombre}</strong>
          <div className="texto-2">{usuario?.email}</div>
        </div>
      </div>

      {referencias === null ? (
        <Cargando texto="Cargando tu perfil…" />
      ) : (
        <form className="tarjeta formulario" onSubmit={guardar} noValidate>
          <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
            <input value={borrador.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} />
          </CampoFormulario>

          <div className="campo">
            <span className="campo-etiqueta">¿Qué buscas en el gimnasio?</span>
            {referencias.objetivos.map((objetivo) => (
              <label key={objetivo.codigo} className="opcion">
                <input
                  type="radio"
                  name="objetivo"
                  value={objetivo.codigo}
                  checked={borrador.objetivo === objetivo.codigo}
                  onChange={(evento) => cambiar('objetivo', evento.target.value)}
                />
                <span>
                  <strong>{objetivo.nombre}</strong>
                  <br />
                  <span className="texto-2">{objetivo.descripcion}</span>
                </span>
              </label>
            ))}
            {errores.objetivo && <span className="error-texto">{errores.objetivo}</span>}
          </div>

          <MensajeError error={errorAccion} />
          {guardado && (
            <div className="aviso exito" role="status">
              <span>
                <Icono nombre="check" tamano={16} /> Cambios guardados
              </span>
            </div>
          )}

          <button type="submit" className="btn btn-primario btn-bloque" disabled={guardando || sinCambios}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      )}

      <button type="button" className="btn btn-secundario btn-bloque" onClick={salir} disabled={saliendo}>
        {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </section>
  )
}
