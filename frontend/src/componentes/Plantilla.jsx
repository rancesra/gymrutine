import { Outlet } from 'react-router'
import BarraNavegacion from './BarraNavegacion.jsx'

// Marco de las pantallas privadas: la barra de navegación y el contenido de cada página.
export default function Plantilla() {
  return (
    <div className="plantilla">
      <BarraNavegacion />
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}