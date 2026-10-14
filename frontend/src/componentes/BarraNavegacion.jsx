import { NavLink, useLocation } from 'react-router'
import Icono from './Icono.jsx'

const secciones = [
  { ruta: '/', texto: 'Inicio', icono: 'inicio' },
  // El catálogo se abre desde Rutinas: mientras se ve, Rutinas sigue marcada
  { ruta: '/rutinas', texto: 'Rutinas', icono: 'rutinas', tambien: '/ejercicios' },
  { ruta: '/historial', texto: 'Historial', icono: 'historial' },
  { ruta: '/progreso', texto: 'Progreso', icono: 'progreso' },
  { ruta: '/perfil', texto: 'Perfil', icono: 'perfil' },
]

// Abajo en el celular y arriba desde 768 px (lo decide estilos.css).
export default function BarraNavegacion() {
  const { pathname } = useLocation()
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
          className={({ isActive }) =>
            isActive || (seccion.tambien && pathname.startsWith(seccion.tambien)) ? 'nav-item activo' : 'nav-item'
          }
        >
          <Icono nombre={seccion.icono} />
          <span>{seccion.texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}