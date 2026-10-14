// Rutas de /api/progreso (contrato §8): los ejercicios con historial y la evolución de cada uno.
// Las reglas viven en servicios/progreso.js.
import { Router } from 'express'
import { listarEjerciciosConHistorial, progresoEjercicio } from '../servicios/progreso.js'

const rutas = Router()

rutas.get('/ejercicios', async (req, res) => {
  res.json(await listarEjerciciosConHistorial(req.usuario.id))
})

rutas.get('/ejercicios/:id', async (req, res) => {
  res.json(await progresoEjercicio(req.usuario.id, req.params.id))
})

export default rutas
