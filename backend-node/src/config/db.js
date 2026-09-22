// Conexión con MongoDB mediante Mongoose.
import mongoose from 'mongoose'
import RegistroPeso from '../modelos/RegistroPeso.js'
import Sesion from '../modelos/Sesion.js'

export async function conectarBaseDatos() {
  await mongoose.connect(process.env.MONGODB_URI)
  // Crea las colecciones y sus índices aunque todavía estén vacías (así se ven en Compass)
  await Promise.all([Sesion.init(), RegistroPeso.init()])
  console.log('Conectado a MongoDB')
}
