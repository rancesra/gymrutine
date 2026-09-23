// Estado "lista vacía": explica por qué no hay nada y, si se le pasa, ofrece la acción siguiente.
export default function EstadoVacio({ titulo, texto, children }) {
  return (
    <div className="vacio">
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
      {children}
    </div>
  )
}