// Convierte cualquier error en la respuesta {codigo, mensaje, campos} del contrato (§10).
// Express 5 trae aquí también los errores lanzados dentro de funciones async.
import { ErrorApi } from '../errores.js'

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'La ruta no existe' })
}

// Express reconoce el manejador de errores porque recibe 4 parámetros
export function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorApi) {
    const cuerpo = { codigo: error.codigo, mensaje: error.message }
    if (error.campos) cuerpo.campos = error.campos
    return res.status(error.estado).json(cuerpo)
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ codigo: 'VALIDACION_FALLIDA', mensaje: 'El cuerpo no es un JSON válido' })
  }
  if (error.name === 'ValidationError') {
    const campos = Object.fromEntries(Object.entries(error.errors).map(([campo, e]) => [campo, e.message]))
    return res.status(400).json({ codigo: 'VALIDACION_FALLIDA', mensaje: 'Hay campos con errores', campos })
  }
  console.error(error)
  res.status(500).json({ codigo: 'ERROR_INTERNO', mensaje: 'Algo salió mal' })
}
