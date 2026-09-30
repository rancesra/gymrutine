// Rutas de /api/sesiones (contrato §7). Reciben la petición, llaman al servicio y responden;
// las reglas de negocio viven en servicios/sesiones.js.
import { Router } from 'express'
import {
  corregirSesion,
  eliminarSesion,
  listarSesiones,
  obtenerSesion,
  registrarSesion,
  ultimosRegistros,
} from '../servicios/sesiones.js'

const rutas = Router()

// Historial del usuario, de la sesión más reciente a la más antigua
rutas.get('/', async (req, res) => {
  res.json(await listarSesiones(req.usuario.id))
})

// Va antes de /:id para que "ultimos-registros" no se tome como un id
rutas.get('/ultimos-registros', async (req, res) => {
  res.json(await ultimosRegistros(req.usuario.id, req.query.rutinaId, req.get('Authorization')))
})

rutas.get('/:id', async (req, res) => {
  res.json(await obtenerSesion(req.usuario.id, req.params.id))
})

rutas.post('/', async (req, res) => {
  res.status(201).json(await registrarSesion(req.usuario, req.body, req.get('Authorization')))
})

rutas.put('/:id', async (req, res) => {
  res.json(await corregirSesion(req.usuario.id, req.params.id, req.body))
})

rutas.delete('/:id', async (req, res) => {
  await eliminarSesion(req.usuario.id, req.params.id)
  res.status(204).end()
})

export default rutas
