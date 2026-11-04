import { NavLink } from 'react-router'

// Las tres pantallas de Progreso comparten esta navegación (mockup P11, P12 y P13).
export default function NavProgreso() {
  const clase = ({ isActive }) => (isActive ? 'chip activo' : 'chip')
  return (
    <div className="chips" role="group" aria-label="Progreso">
      <NavLink to="/progreso" end className={clase}>
        Por ejercicio
      </NavLink>
      <NavLink to="/progreso/records" className={clase}>
        Récords
      </NavLink>
      <NavLink to="/progreso/peso" className={clase}>
        Peso corporal
      </NavLink>
    </div>
  )
}
