// Ruta de /api/records (contrato §8): el récord vigente de cada ejercicio.
// La regla de récords y la consulta viven en servicios/records.js.
import { Router } from 'express'
import { listarRecords } from '../servicios/records.js'

const rutas = Router()

rutas.get('/', async (req, res) => {
  res.json(await listarRecords(req.usuario.id))
})

export default rutas
