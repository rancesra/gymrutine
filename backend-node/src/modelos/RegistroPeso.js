// Colección "registrosPeso": peso corporal por usuario y fecha (MODELO-DATOS §5).
import mongoose from 'mongoose'

const esquemaRegistroPeso = new mongoose.Schema(
  {
    usuarioId: { type: Number, required: true },
    fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    pesoKg: { type: Number, required: true, min: 20, max: 350 },
  },
  { versionKey: false },
)

// Como máximo un registro por usuario y fecha
esquemaRegistroPeso.index({ usuarioId: 1, fecha: 1 }, { unique: true })

esquemaRegistroPeso.set('toJSON', {
  transform: (documento, json) => {
    json.id = String(json._id)
    delete json._id
    return json
  },
})

export default mongoose.model('RegistroPeso', esquemaRegistroPeso, 'registrosPeso')
