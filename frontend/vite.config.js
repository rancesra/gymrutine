import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El proxy manda cada petición /api al servicio que corresponde (ARQUITECTURA §7).
// Las rutas del servicio de entrenamiento van primero: Vite usa la primera que coincide.
const entrenamiento = 'http://127.0.0.1:3000'
const cuentas = 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sesiones': entrenamiento,
      '/api/records': entrenamiento,
      '/api/progreso': entrenamiento,
      '/api/peso-corporal': entrenamiento,
      '/api': cuentas,
    },
  },
})