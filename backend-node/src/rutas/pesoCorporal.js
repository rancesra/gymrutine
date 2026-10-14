// Rutas de /api/peso-corporal (contrato §9). Reciben la petición, llaman al servicio y responden;
// las reglas de negocio viven en servicios/pesoCorporal.js.
import { Router } from 'express'
import { corregirPeso, eliminarPeso, listarRegistros, registrarPeso } from '../servicios/pesoCorporal.js'

const rutas = Router()

rutas.get('/', async (req, res) => {
  res.json(await listarRegistros(req.usuario.id))
})

rutas.post('/', async (req, res) => {
  res.status(201).json(await registrarPeso(req.usuario.id, req.body))
})

rutas.put('/:id', async (req, res) => {
  res.json(await corregirPeso(req.usuario.id, req.params.id, req.body))
})

rutas.delete('/:id', async (req, res) => {
  await eliminarPeso(req.usuario.id, req.params.id)
  res.status(204).end()
})

export default rutas