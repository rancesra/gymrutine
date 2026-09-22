// Etiqueta, campo y, debajo, el error que llega en "campos" de la API (o una ayuda).
export default function CampoFormulario({ etiqueta, error, ayuda, children }) {
  return (
    <label className="campo">
      <span className="campo-etiqueta">{etiqueta}</span>
      <span className={error ? 'entrada error' : 'entrada'}>{children}</span>
      {error ? <span className="error-texto">{error}</span> : ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  )
}