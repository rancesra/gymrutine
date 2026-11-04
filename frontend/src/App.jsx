import { Navigate, Route, Routes } from 'react-router'
import RutaPrivada from './auth/RutaPrivada.jsx'
import Plantilla from './componentes/Plantilla.jsx'
import PaginaEjercicios from './paginas/PaginaEjercicios.jsx'
import PaginaEntrenar from './paginas/PaginaEntrenar.jsx'
import PaginaHistorial from './paginas/PaginaHistorial.jsx'
import PaginaInicio from './paginas/PaginaInicio.jsx'
import PaginaLogin from './paginas/PaginaLogin.jsx'
import PaginaPerfil from './paginas/PaginaPerfil.jsx'
import PaginaProgreso from './paginas/PaginaProgreso.jsx'
import PaginaRecords from './paginas/PaginaRecords.jsx'
import PaginaPeso from './paginas/PaginaPeso.jsx'
import PaginaRegistro from './paginas/PaginaRegistro.jsx'
import PaginaRutinaFormulario from './paginas/PaginaRutinaFormulario.jsx'
import PaginaRutinas from './paginas/PaginaRutinas.jsx'
import PaginaSesion from './paginas/PaginaSesion.jsx'

// Tabla de rutas: una por pantalla del mockup (ARQUITECTURA §7).
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/registro" element={<PaginaRegistro />} />

      <Route element={<RutaPrivada />}>
        {/* Entrenar ocupa toda la pantalla: va sin la barra de navegación */}
        <Route path="/rutinas/:id/entrenar" element={<PaginaEntrenar />} />

        <Route element={<Plantilla />}>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/ejercicios" element={<PaginaEjercicios />} />
          <Route path="/rutinas" element={<PaginaRutinas />} />
          <Route path="/rutinas/nueva" element={<PaginaRutinaFormulario />} />
          <Route path="/rutinas/:id/editar" element={<PaginaRutinaFormulario />} />
          <Route path="/historial" element={<PaginaHistorial />} />
          <Route path="/historial/:id" element={<PaginaSesion />} />
          <Route path="/progreso" element={<PaginaProgreso />} />
          <Route path="/progreso/records" element={<PaginaRecords />} />
          <Route path="/progreso/peso" element={<PaginaPeso />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}