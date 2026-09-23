import { NavLink } from 'react-router'
import Icono from './Icono.jsx'

const secciones = [
  { ruta: '/', texto: 'Inicio', icono: 'inicio' },
  { ruta: '/rutinas', texto: 'Rutinas', icono: 'rutinas' },
  { ruta: '/historial', texto: 'Historial', icono: 'historial' },
  { ruta: '/progreso', texto: 'Progreso', icono: 'progreso' },
  { ruta: '/perfil', texto: 'Perfil', icono: 'perfil' },
]

// Abajo en el celular y arriba desde 768 px (lo decide estilos.css).
export default function BarraNavegacion() {
  return (
    <nav className="barra-navegacion">
      <span className="logo">
        Gym<b>Rutine</b>
      </span>
      {secciones.map((seccion) => (
        <NavLink
          key={seccion.ruta}
          to={seccion.ruta}
          end={seccion.ruta === '/'}
          className={({ isActive }) => (isActive ? 'nav-item activo' : 'nav-item')}
        >
          <Icono nombre={seccion.icono} />
          <span>{seccion.texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}