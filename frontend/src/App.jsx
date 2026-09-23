import { Navigate, Route, Routes } from 'react-router'
import RutaPrivada from './auth/RutaPrivada.jsx'
import Plantilla from './componentes/Plantilla.jsx'
import PaginaEnConstruccion from './paginas/PaginaEnConstruccion.jsx'
import PaginaLogin from './paginas/PaginaLogin.jsx'
import PaginaPerfil from './paginas/PaginaPerfil.jsx'
import PaginaRegistro from './paginas/PaginaRegistro.jsx'

// Tabla de rutas: una por pantalla del mockup (ARQUITECTURA §7).
// Cada tarea reemplaza su PaginaEnConstruccion por la página real.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/registro" element={<PaginaRegistro />} />

      <Route element={<RutaPrivada />}>
        {/* Entrenar ocupa toda la pantalla: va sin la barra de navegación */}
        <Route path="/rutinas/:id/entrenar" element={<PaginaEnConstruccion titulo="Entrenar" tarea="T7" />} />

        <Route element={<Plantilla />}>
          <Route path="/" element={<PaginaEnConstruccion titulo="Inicio" tarea="T11" />} />
          <Route path="/ejercicios" element={<PaginaEnConstruccion titulo="Catálogo de ejercicios" tarea="T5" />} />
          <Route path="/rutinas" element={<PaginaEnConstruccion titulo="Mis rutinas" tarea="T6" />} />
          <Route path="/rutinas/nueva" element={<PaginaEnConstruccion titulo="Nueva rutina" tarea="T6" />} />
          <Route path="/rutinas/:id/editar" element={<PaginaEnConstruccion titulo="Editar rutina" tarea="T6" />} />
          <Route path="/historial" element={<PaginaEnConstruccion titulo="Historial" tarea="T7" />} />
          <Route path="/historial/:id" element={<PaginaEnConstruccion titulo="Detalle de sesión" tarea="T7" />} />
          <Route path="/progreso" element={<PaginaEnConstruccion titulo="Progreso" tarea="T9" />} />
          <Route path="/progreso/records" element={<PaginaEnConstruccion titulo="Récords" tarea="T8" />} />
          <Route path="/progreso/peso" element={<PaginaEnConstruccion titulo="Peso corporal" tarea="T10" />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}