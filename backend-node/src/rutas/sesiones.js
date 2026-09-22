// Rutas de /api/sesiones. Por ahora solo el historial vacío para la entrega del sprint 2;
// T7 agrega registrar, detalle, editar, eliminar y últimos registros.
import { Router } from 'express'
import Sesion from '../modelos/Sesion.js'

const rutas = Router()

// Historial del usuario, de la sesión más reciente a la más antigua
rutas.get('/', async (req, res) => {
  const sesiones = await Sesion.find({ usuarioId: req.usuario.id }).sort({ fechaInicio: -1, _id: -1 })
  res.json(sesiones)
})

export default rutas
