// Colección "sesiones": cada entrenamiento con sus ejercicios y series dentro (MODELO-DATOS §5).
import mongoose from 'mongoose'

const esquemaSerie = new mongoose.Schema(
  {
    numero: { type: Number, required: true, min: 1 },
    pesoKg: { type: Number, required: true, min: 0, max: 500 },
    repeticiones: { type: Number, required: true, min: 1, max: 100 },
    esRecord: { type: Boolean, required: true, default: false },
  },
  { _id: false },
)

const esquemaRegistro = new mongoose.Schema(
  {
    orden: { type: Number, required: true, min: 1 },
    // Copia del ejercicio al momento de registrar (DM-09)
    ejercicio: {
      id: { type: Number, required: true },
      nombre: { type: String, required: true },
      grupoMuscular: { type: String, required: true },
    },
    series: {
      type: [esquemaSerie],
      validate: [(series) => series.length >= 1 && series.length <= 20, 'Debe tener entre 1 y 20 series'],
    },
  },
  { _id: false },
)

const esquemaSesion = new mongoose.Schema(
  {
    usuarioId: { type: Number, required: true },
    rutina: {
      id: { type: Number, required: true },
      nombre: { type: String, required: true },
    },
    fechaInicio: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/ },
    duracionMinutos: { type: Number, required: true, min: 1, max: 600 },
    registros: {
      type: [esquemaRegistro],
      validate: [(registros) => registros.length >= 1 && registros.length <= 15, 'Debe tener entre 1 y 15 ejercicios'],
    },
  },
  { versionKey: false },
)

esquemaSesion.index({ usuarioId: 1, fechaInicio: -1 })
esquemaSesion.index({ usuarioId: 1, 'registros.ejercicio.id': 1 })

// En la API, el _id sale como "id" en texto (contrato §1)
esquemaSesion.set('toJSON', {
  transform: (documento, json) => {
    json.id = String(json._id)
    delete json._id
    return json
  },
})

// El tercer parámetro fija el nombre de la colección (si no, Mongoose inventaría "sesions")
export default mongoose.model('Sesion', esquemaSesion, 'sesiones')
