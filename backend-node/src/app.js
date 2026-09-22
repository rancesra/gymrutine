// Arma la aplicación de Express: JSON, rutas y manejo de errores.
import express from 'express'
import mongoose from 'mongoose'
import { autenticar } from './middlewares/autenticar.js'
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js'
import rutasSesiones from './rutas/sesiones.js'

const app = express()
app.use(express.json())

// Salud del servicio: sin token y fuera de /api, para comprobar rápido que arrancó
app.get('/salud', (req, res) => {
  const conectado = mongoose.connection.readyState === 1
  res.json({ estado: 'ok', mongo: conectado ? 'conectado' : 'desconectado' })
})

// Todo lo que está bajo /api exige un token válido del servicio de cuentas
app.use('/api', autenticar)
app.use('/api/sesiones', rutasSesiones)

app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
