import EstadoVacio from '../componentes/EstadoVacio.jsx'

// Página provisional: cada tarea la reemplaza por la pantalla real.
export default function PaginaEnConstruccion({ titulo, tarea }) {
  return (
    <section className="pagina">
      <h1>{titulo}</h1>
      <EstadoVacio titulo="En construcción" texto={`Esta pantalla llega con la tarea ${tarea} del plan de trabajo.`} />
    </section>
  )
}