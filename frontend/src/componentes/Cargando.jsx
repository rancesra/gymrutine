// Estado "cargando": bloques grises con la forma del contenido.
export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="cargando" role="status">
      <div className="esqueleto" />
      <div className="esqueleto" />
      <span className="texto-2">{texto}</span>
    </div>
  )
}