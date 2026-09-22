// Punto de entrada: conecta con MongoDB y arranca el servidor HTTP.
import app from './app.js'
import { conectarBaseDatos } from './config/db.js'

const puerto = Number(process.env.PUERTO ?? 3000)

await conectarBaseDatos()
app.listen(puerto, () => {
  console.log(`Servicio de entrenamiento en http://localhost:${puerto}`)
})
