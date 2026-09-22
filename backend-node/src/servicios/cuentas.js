// Cliente HTTP hacia el servicio de cuentas (Spring Boot). Usa el fetch que ya trae Node.
import { ErrorApi } from '../errores.js'

async function pedirACuentas(ruta, autorizacion) {
  try {
    return await fetch(`${process.env.URL_SERVICIO_CUENTAS}${ruta}`, {
      headers: { Authorization: autorizacion },
    })
  } catch {
    throw new ErrorApi(503, 'SERVICIO_NO_DISPONIBLE', 'El servicio de cuentas no responde')
  }
}

// Valida el token preguntándole al servicio de cuentas quién es el usuario (ARQUITECTURA §6)
export async function obtenerUsuario(autorizacion) {
  const respuesta = await pedirACuentas('/api/usuarios/me', autorizacion)
  if (respuesta.status === 401) {
    throw new ErrorApi(401, 'NO_AUTENTICADO', 'La sesión no es válida o ya venció')
  }
  if (!respuesta.ok) {
    throw new ErrorApi(503, 'SERVICIO_NO_DISPONIBLE', 'El servicio de cuentas respondió con un error')
  }
  return respuesta.json()
}
