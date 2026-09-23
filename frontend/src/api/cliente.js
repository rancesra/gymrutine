// Única puerta hacia la API: agrega el token, convierte el JSON y traduce los errores
// al formato del contrato {codigo, mensaje, campos}. Ningún componente usa fetch directamente.

const CLAVE_TOKEN = 'gymrutine.token'
const CLAVE_USUARIO = 'gymrutine.usuario'

export class ErrorApi extends Error {
  constructor({ estado, codigo, mensaje, campos }) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.campos = campos ?? {}
  }
}

const sinConexion = () =>
  new ErrorApi({ estado: 0, codigo: 'SIN_CONEXION', mensaje: 'No se pudo conectar con el servidor' })

async function pedir(metodo, ruta, cuerpo) {
  const cabeceras = {}
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) cabeceras.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw sinConexion()
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos

  // Si el servicio está apagado, el proxy de Vite responde 500 sin JSON
  if (respuesta.status >= 500 && datos === null) throw sinConexion()

  // Token vencido o inválido: se borra la sesión y se vuelve a iniciar sesión
  if (respuesta.status === 401 && datos?.codigo === 'NO_AUTENTICADO') {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    window.location.assign('/login')
  }

  throw new ErrorApi({
    estado: respuesta.status,
    codigo: datos?.codigo ?? 'ERROR_INESPERADO',
    mensaje: datos?.mensaje ?? 'Algo salió mal. Intenta de nuevo',
    campos: datos?.campos,
  })
}

export const api = {
  get: (ruta) => pedir('GET', ruta),
  post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
  put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
  borrar: (ruta) => pedir('DELETE', ruta),
}