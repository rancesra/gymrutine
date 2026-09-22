// Exige un token válido: sin él responde 401; con él deja el usuario en req.usuario.
import { ErrorApi } from '../errores.js'
import { obtenerUsuario } from '../servicios/cuentas.js'

export async function autenticar(req, res, next) {
  const cabecera = req.get('Authorization')
  if (!cabecera?.startsWith('Bearer ')) {
    throw new ErrorApi(401, 'NO_AUTENTICADO', 'Falta el token de acceso')
  }
  req.usuario = await obtenerUsuario(cabecera)
  next()
}
