// Muestra un error de la API. Si fue por falta de conexión, ofrece reintentar.
export default function MensajeError({ error, alReintentar }) {
  if (!error) return null
  return (
    <div className="aviso error" role="alert">
      <span>{error.message}</span>
      {alReintentar && error.codigo === 'SIN_CONEXION' && (
        <button type="button" className="btn btn-secundario btn-sm" onClick={alReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}