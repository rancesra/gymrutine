# Guía de T2 — Base del frontend y pantallas de acceso

**Para:** Javier · **Tareas:** T2 (base del frontend) y las pantallas de T4 que te tocan: P1 iniciar sesión, P2 crear cuenta y cerrar sesión desde el perfil · **Rama:** `t2-base-react` · **Entrega:** la del sprint 2, el miércoles 23 de septiembre

Al terminar tendrás el frontend de React funcionando: las 14 rutas del mockup con su navegación, el cliente de la API, la sesión y las pantallas para crear una cuenta, iniciar sesión y cerrarla. En la presentación del miércoles 23 muestras el repositorio (punto 3) y el login funcionando (punto 5) ([plan de trabajo](../../PLAN-DE-TRABAJO.md#entrega-del-sprint-2--miércoles-23-de-septiembre)).

**Todo el código de esta guía ya se probó** de punta a punta: login, registro, errores, sin conexión y vista de celular. Si copias cada archivo tal cual, funciona.

**No tienes que esperar a Rances.** Mientras su API de cuentas (T4) no esté en `main`, pruebas contra la **API falsa** del paso 6, que responde igual que el [contrato](../CONTRATO-API.md).

Los comandos son para **PowerShell**, en la terminal de VS Code. En macOS son los mismos, salvo donde se indica.

## 1. Antes de empezar

1. Necesitas **Git, Node.js 24 y VS Code** ([guía de inicio](../../GUIA-INICIO.md) §1), y haber aceptado las invitaciones de GitHub y de Jira (§0). Para esta tarea todavía no hacen falta MySQL ni MongoDB.
2. Comprueba Node.js y npm:

   ```powershell
   node --version
   npm --version
   ```

   Si `npm` responde que *la ejecución de scripts está deshabilitada en este sistema*, ejecuta esto una sola vez y confirma con `S` (o `Y` si tu Windows está en inglés):

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

3. Abre la carpeta del repositorio en VS Code, trae lo último de `main` y crea tu rama ([guía de git](../../GUIA-GIT.md) §1). Si clonaste en otra carpeta, cambia `C:\dev\gymrutine` por la tuya:

   ```powershell
   cd C:\dev\gymrutine
   git switch main
   git pull
   git switch -c t2-base-react
   git push -u origin t2-base-react
   ```

## 2. Crear el proyecto con Vite

Desde la **raíz del repositorio** (la carpeta `gymrutine`):

```powershell
npx create-vite@latest frontend --template react --no-eslint --no-immediate
```

- Crea la carpeta `frontend/` con React en JavaScript y **Oxlint**, el revisor de código que trae la plantilla (lo ejecuta `npm run lint`). `--no-immediate` hace que no instale ni arranque nada todavía.
- Si pregunta `Need to install the following packages: create-vite… Ok to proceed? (y)`, escribe `y`.
- Si aun así te hace preguntas, responde **React**, luego **JavaScript**, luego **Oxlint**, y a *Install with npm and start now?*, **No**.

Borra lo que trae la plantilla y no se usa. Sigue en la raíz del repositorio:

```powershell
Remove-Item frontend/src/App.css, frontend/src/index.css, frontend/public/icons.svg, frontend/README.md
Remove-Item -Recurse frontend/src/assets
```

En macOS: `rm frontend/src/App.css frontend/src/index.css frontend/public/icons.svg frontend/README.md` y `rm -r frontend/src/assets`.

Instala las librerías:

```powershell
cd frontend
npm install
npm install react-router chart.js
```

- **`npm install`** descarga lo que trae la plantilla (React, Vite y Oxlint) en `frontend/node_modules/`, que no se sube al repositorio.
- **`react-router`** lleva de una pantalla a otra; **`chart.js`** dibuja las gráficas (se usa desde el sprint 3).

Todavía no arranques la app: `main.jsx` y `App.jsx` importan archivos que acabas de borrar. En el paso 4 los reemplazas.

## 3. Cómo crear cada archivo

- **Archivo nuevo:** en el explorador de VS Code, clic derecho sobre la carpeta `frontend` → **New File…** y escribe la ruta completa, por ejemplo `src/api/cliente.js`. VS Code crea las carpetas que falten.
- **Archivo que ya existe** (`index.html`, `vite.config.js`, `src/main.jsx` y `src/App.jsx`): borra todo su contenido y pega el nuevo.
- **Respeta mayúsculas y minúsculas** en los nombres: los `import` los escriben exactamente así.

Así queda `frontend/` al terminar:

```
frontend/
├── index.html
├── vite.config.js           proxy hacia los dos servicios
├── package.json             lo crea Vite; npm lo actualiza solo
└── src/
    ├── main.jsx             punto de entrada
    ├── App.jsx              tabla de rutas: una por pantalla
    ├── estilos.css          variables y clases del mockup
    ├── api/
    │   └── cliente.js       única puerta hacia la API
    ├── auth/
    │   ├── contexto.js      el contexto de la sesión
    │   ├── AuthProvider.jsx guarda la sesión: iniciar, registrarse y cerrar
    │   ├── useAuth.js       lee la sesión desde cualquier componente
    │   └── RutaPrivada.jsx  sin sesión, lleva a /login
    ├── componentes/         piezas que usan todas las pantallas
    ├── paginas/             una página por pantalla del mockup
    └── utilidades/
        ├── formato.js       kilos y fechas en formato colombiano
        └── referencias.js   objetivos, grupos musculares y equipos
```

## 4. La base del frontend (T2)

### 4.1 `index.html`

La página que carga Vite. Cambian el idioma (`es`) y el título de la pestaña.

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GymRutine</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4.2 `vite.config.js`

El **proxy**: el navegador siempre llama a `/api/...` en el puerto 5173, y Vite reenvía cada petición al servicio que corresponde. Gracias a él no hace falta configurar CORS. Se usa `127.0.0.1` y no `localhost` para que la conexión vaya siempre por IPv4: en Windows, `localhost` puede resolverse a la dirección IPv6 `::1`, donde no todo escucha.

```js
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
```

### 4.3 `src/main.jsx`

Arranca React. Envuelve la app con el enrutador (`BrowserRouter`) y con la sesión (`AuthProvider`), para que cualquier pantalla pueda usar los dos. También carga los estilos.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider.jsx'
import './estilos.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

### 4.4 `src/App.jsx`

La tabla de rutas, igual a la de [ARQUITECTURA.md](../ARQUITECTURA.md) §7. Las pantallas privadas van dentro de `RutaPrivada` y, salvo Entrenar, dentro de `Plantilla`, que pone la barra de navegación. Las que todavía no existen muestran "En construcción" y dicen qué tarea las trae: cada uno reemplaza la suya cuando la haga.

```jsx
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
```

### 4.5 `src/api/cliente.js`

**El único archivo que usa `fetch`.** Las pantallas llaman a `api.get('/rutinas')`, `api.post(...)`, etc. El cliente agrega el token, convierte el JSON y, si algo sale mal, lanza un `ErrorApi` con el `codigo`, el `mensaje` y los `campos` del contrato. Ante un 401 por token vencido, borra la sesión y lleva a `/login`.

```js
// Única puerta hacia la API: agrega el token, convierte el JSON y traduce los errores
// al formato del contrato {codigo, mensaje, campos}. Ningún componente usa fetch directamente.

const CLAVE_TOKEN = 'gymrutine.token'
const CLAVE_USUARIO = 'gymrutine.usuario'

export class ErrorApi extends Error {
  constructor({ estado, codigo, mensaje, campos }) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.campos = campos ?? {}
  }
}

const sinConexion = () =>
  new ErrorApi({ estado: 0, codigo: 'SIN_CONEXION', mensaje: 'No se pudo conectar con el servidor' })

async function pedir(metodo, ruta, cuerpo) {
  const cabeceras = {}
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) cabeceras.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw sinConexion()
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos

  // Si el servicio está apagado, el proxy de Vite responde 500 sin JSON
  if (respuesta.status >= 500 && datos === null) throw sinConexion()

  // Token vencido o inválido: se borra la sesión y se vuelve a iniciar sesión
  if (respuesta.status === 401 && datos?.codigo === 'NO_AUTENTICADO') {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    window.location.assign('/login')
  }

  throw new ErrorApi({
    estado: respuesta.status,
    codigo: datos?.codigo ?? 'ERROR_INESPERADO',
    mensaje: datos?.mensaje ?? 'Algo salió mal. Intenta de nuevo',
    campos: datos?.campos,
  })
}

export const api = {
  get: (ruta) => pedir('GET', ruta),
  post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
  put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
  borrar: (ruta) => pedir('DELETE', ruta),
}
```

### 4.6 La sesión: `src/auth/`

Son cuatro archivos. El contexto, el proveedor y el hook van separados porque Oxlint (regla `only-export-components`) pide que un archivo que exporta un componente no exporte nada más; así funciona la recarga en caliente de Vite.

`src/auth/contexto.js`: crea el contexto.

```js
import { createContext } from 'react'

// Contexto de la sesión. Lo llena AuthProvider y se lee con useAuth().
export const AuthContext = createContext(null)
```

`src/auth/AuthProvider.jsx`: guarda el token y el usuario en el estado de React y en `localStorage`, para que la sesión sobreviva a una recarga. Ofrece `iniciarSesion`, `registrarse`, `cerrarSesion` y `actualizarUsuario` (este último lo usará Rances en el perfil).

```jsx
import { useState } from 'react'
import { api } from '../api/cliente.js'
import { AuthContext } from './contexto.js'

// Sesión del usuario disponible en toda la app. Se guarda también en localStorage
// para que sobreviva a una recarga de la página.
const CLAVE_TOKEN = 'gymrutine.token'
const CLAVE_USUARIO = 'gymrutine.usuario'

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CLAVE_TOKEN))
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  function guardarSesion(respuesta) {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    setToken(respuesta.token)
    setUsuario(respuesta.usuario)
  }

  async function iniciarSesion(email, contrasena) {
    guardarSesion(await api.post('/auth/login', { email, contrasena }))
  }

  async function registrarse(datos) {
    guardarSesion(await api.post('/auth/registro', datos))
  }

  async function cerrarSesion() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Aunque el servidor no responda, la sesión se cierra en este navegador
    }
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setToken(null)
    setUsuario(null)
  }

  function actualizarUsuario(nuevo) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevo))
    setUsuario(nuevo)
  }

  const valor = { token, usuario, iniciarSesion, registrarse, cerrarSesion, actualizarUsuario }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
```

`src/auth/useAuth.js`: la forma de leer la sesión desde cualquier componente.

```js
import { useContext } from 'react'
import { AuthContext } from './contexto.js'

// Da acceso a la sesión desde cualquier componente:
// const { token, usuario, iniciarSesion, registrarse, cerrarSesion } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}
```

`src/auth/RutaPrivada.jsx`: si no hay sesión, lleva a `/login`.

```jsx
import { Navigate, Outlet } from 'react-router'
import { useAuth } from './useAuth.js'

// Envuelve las rutas privadas: sin sesión iniciada, lleva a /login.
export default function RutaPrivada() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
```

### 4.7 Componentes compartidos: `src/componentes/`

Piezas del mockup que usan todas las pantallas.

`src/componentes/Icono.jsx`: los íconos de la barra de navegación y el del ojo de la contraseña.

```jsx
// Íconos de trazo simple (los mismos del mockup). Uso: <Icono nombre="inicio" />
const trazos = {
  inicio: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  rutinas: 'M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11',
  historial: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  progreso: 'M4 4v16h16M7 15l4-4 3 3 5-6',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  ojo: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
}

export default function Icono({ nombre, tamano = 22 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={trazos[nombre]} />
    </svg>
  )
}
```

`src/componentes/BarraNavegacion.jsx`: abajo en el celular y arriba en el computador. `NavLink` marca la sección activa.

```jsx
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
```

`src/componentes/Plantilla.jsx`: el marco de las pantallas privadas. `<Outlet />` es el lugar donde React Router pone la página de la ruta actual.

```jsx
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
```

`src/componentes/CampoFormulario.jsx`: etiqueta, campo y, debajo, el error de ese campo o una ayuda.

```jsx
// Etiqueta, campo y, debajo, el error que llega en "campos" de la API (o una ayuda).
export default function CampoFormulario({ etiqueta, error, ayuda, children }) {
  return (
    <label className="campo">
      <span className="campo-etiqueta">{etiqueta}</span>
      <span className={error ? 'entrada error' : 'entrada'}>{children}</span>
      {error ? <span className="error-texto">{error}</span> : ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  )
}
```

`src/componentes/MensajeError.jsx`: muestra un error de la API; si fue por falta de conexión, ofrece reintentar.

```jsx
// Muestra un error de la API. Si fue por falta de conexión, ofrece reintentar.
export default function MensajeError({ error, alReintentar }) {
  if (!error) return null
  return (
    <div className="aviso error" role="alert">
      <span>{error.message}</span>
      {alReintentar && error.codigo === 'SIN_CONEXION' && (
        <button type="button" className="btn btn-secundario btn-sm" onClick={alReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}
```

`src/componentes/Cargando.jsx`: el estado "cargando" del mockup.

```jsx
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
```

`src/componentes/EstadoVacio.jsx`: el estado "lista vacía" del mockup.

```jsx
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
```

### 4.8 Utilidades: `src/utilidades/`

`src/utilidades/formato.js`: números y fechas como en el mockup. La API siempre usa punto decimal (`62.5`); en pantalla se ve `62,5 kg`.

```js
// Números y fechas en formato colombiano, como en el mockup. La API siempre usa punto decimal.
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// 62.5 → "62,5 kg"  ·  1935 → "1.935 kg"
export function formatoKg(valor) {
  return `${numero.format(valor)} kg`
}

// Lee lo que escribe el usuario, con coma o con punto: "57,5" → 57.5
export function leerNumero(texto) {
  return Number(String(texto).trim().replace(',', '.'))
}

// "2026-09-14" o "2026-09-14T18:30:00" → "lun 14 sep"
// Opciones: { diaSemana: false } → "14 sep"  ·  { anio: true } → "lun 14 sep 2026"
export function formatoFecha(texto, { diaSemana = true, anio = false } = {}) {
  // Sin hora, new Date("2026-09-14") se lee en UTC y en Colombia mostraría el día anterior
  const fecha = new Date(texto.length === 10 ? `${texto}T00:00:00` : texto)
  const partes = [fecha.getDate(), meses[fecha.getMonth()]]
  if (diaSemana) partes.unshift(dias[fecha.getDay()])
  if (anio) partes.push(fecha.getFullYear())
  return partes.join(' ')
}
```

`src/utilidades/referencias.js`: pide `GET /referencias` una sola vez por pestaña y lo guarda.

```js
import { api } from '../api/cliente.js'

// Objetivos, grupos musculares y equipos con su nombre visible (GET /referencias).
// Se piden una vez y se guardan mientras la pestaña esté abierta.
const CLAVE = 'gymrutine.referencias'

export async function obtenerReferencias() {
  const guardadas = sessionStorage.getItem(CLAVE)
  if (guardadas) return JSON.parse(guardadas)
  const referencias = await api.get('/referencias')
  sessionStorage.setItem(CLAVE, JSON.stringify(referencias))
  return referencias
}

// nombreDe(referencias.objetivos, 'PERDIDA_PESO') → "Pérdida de peso"
export function nombreDe(lista, codigo) {
  return lista.find((elemento) => elemento.codigo === codigo)?.nombre ?? codigo
}
```

### 4.9 `src/paginas/PaginaEnConstruccion.jsx`

La página provisional de las rutas que todavía no existen.

```jsx
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
```

### 4.10 `src/estilos.css`

Las variables y clases del [mockup HTML](../mockup/mockup.html). Todas las pantallas usan estas clases; no se escriben estilos en línea. Si una pantalla necesita una clase nueva, se agrega aquí.

```css
/* Estilos compartidos de GymRutine. Variables y clases tomadas del mockup (docs/mockup/mockup.html). */
:root {
  --papel: #ffffff;
  --app: #f5f5f4;
  --linea: #e7e5e4;
  --borde: #d6d3d1;
  --tinta: #1c1917;
  --tinta-2: #57534e;
  --tinta-3: #78716c;
  --carbon: #1f2937;
  --naranja: #c2410c;
  --naranja-suave: #ffedd5;
  --naranja-fondo: #fff7ed;
  --oro-suave: #fef3c7;
  --oro-tinta: #713f12;
  --verde-suave: #dcfce7;
  --rojo: #b91c1c;
  --rojo-suave: #fee2e2;
  --radio: 14px;
  --sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-family: var(--sans);
  color: var(--tinta);
  background: var(--app);
}
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; font-size: 15px; line-height: 1.5; }
h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }
h2 { font-size: 17px; margin: 0; }
a { color: var(--naranja); font-weight: 600; }

/* Marco de las pantallas privadas: barra abajo en el celular, arriba desde 768 px */
.plantilla { min-height: 100vh; padding-bottom: 80px; }
.contenido { max-width: 720px; margin: 0 auto; padding: 16px; }
.barra-navegacion {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 10;
  display: grid; grid-template-columns: repeat(5, 1fr);
  background: var(--papel); border-top: 1px solid var(--linea); padding: 6px 4px 10px;
}
.barra-navegacion .logo { display: none; }
.nav-item {
  display: grid; justify-items: center; gap: 2px; min-height: 44px;
  font-size: 11px; font-weight: 500; color: var(--tinta-3); text-decoration: none;
}
.nav-item.activo { color: var(--naranja); font-weight: 700; }
@media (min-width: 768px) {
  .plantilla { padding-bottom: 0; }
  .barra-navegacion {
    position: sticky; top: 0; bottom: auto; display: flex; align-items: center; gap: 6px;
    height: 64px; padding: 0 28px; border-top: 0; border-bottom: 1px solid var(--linea);
  }
  .barra-navegacion .logo { display: inline; margin-right: auto; font-size: 20px; }
  .nav-item { display: inline-flex; align-items: center; gap: 6px; min-height: 0; padding: 8px 12px; border-radius: 10px; font-size: 14px; }
  .nav-item.activo { background: var(--naranja-fondo); }
  .contenido { padding: 28px; }
}

/* Pantallas de acceso: iniciar sesión y crear cuenta */
.pantalla-acceso { max-width: 420px; margin: 0 auto; padding: 32px 20px; display: grid; gap: 16px; }
.marca { display: grid; justify-items: center; gap: 8px; margin: 24px 0 8px; }
.logo { font-weight: 800; font-size: 24px; letter-spacing: -0.03em; color: var(--tinta); }
.logo b { color: var(--naranja); }
.logo-marca { width: 64px; height: 64px; border-radius: 18px; background: var(--naranja); color: #fff; display: grid; place-items: center; }
.formulario { display: grid; gap: 14px; }
.centrado { text-align: center; }

/* Campos */
.campo { display: grid; gap: 6px; margin: 0; padding: 0; border: 0; min-width: 0; }
.campo-etiqueta { font-size: 13px; font-weight: 600; color: var(--tinta-2); padding: 0; }
.entrada {
  display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 12px;
  border: 1.5px solid var(--borde); border-radius: 12px; background: var(--papel);
}
.entrada:focus-within { border-color: var(--naranja); box-shadow: 0 0 0 3px var(--naranja-suave); }
.entrada.error { border-color: var(--rojo); background: #fffbfb; }
.entrada input, .entrada select, .entrada textarea {
  width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--tinta);
}
.error-texto { font-size: 12.5px; color: var(--rojo); }
.ayuda { font-size: 12px; color: var(--tinta-3); }
.opcion {
  display: grid; grid-template-columns: 22px 1fr; gap: 10px; padding: 12px; cursor: pointer;
  border: 1.5px solid var(--borde); border-radius: 12px; background: var(--papel);
}
.opcion:has(input:checked) { border-color: var(--naranja); background: var(--naranja-fondo); }
.opcion input { width: 18px; height: 18px; margin: 2px 0 0; accent-color: var(--naranja); }

/* Botones: 44 px de alto como mínimo */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 16px;
  border: 1.5px solid transparent; border-radius: 12px; font: 600 15px var(--sans); text-decoration: none; cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: default; }
.btn-primario { background: var(--naranja); color: #fff; }
.btn-secundario { background: var(--papel); color: var(--tinta); border-color: var(--borde); }
.btn-peligro { background: var(--papel); color: var(--rojo); border-color: #fca5a5; }
.btn-bloque { width: 100%; }
.btn-sm { min-height: 36px; padding: 0 12px; border-radius: 10px; font-size: 13.5px; }
.btn-icono { display: grid; place-items: center; width: 36px; height: 36px; border: 0; background: none; color: var(--tinta-3); cursor: pointer; }

/* Tarjetas, avisos y estados compartidos */
.pagina { display: grid; gap: 14px; }
.tarjeta { background: var(--papel); border: 1px solid var(--linea); border-radius: var(--radio); padding: 14px; }
.fila { display: flex; align-items: center; gap: 12px; }
.texto-2 { color: var(--tinta-2); font-size: 13px; }
.avatar { width: 44px; height: 44px; flex: none; display: grid; place-items: center; border-radius: 50%; background: var(--carbon); color: #fff; font-weight: 700; }
.aviso { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px; border-radius: 12px; font-size: 13.5px; }
.aviso.error { background: var(--rojo-suave); color: #7f1d1d; }
.aviso.exito { background: var(--verde-suave); color: #14532d; }
.vacio { display: grid; justify-items: center; gap: 8px; padding: 32px 12px; text-align: center; color: var(--tinta-2); }
.vacio p { margin: 0; }
.cargando { display: grid; gap: 10px; }
.esqueleto {
  height: 56px; border-radius: 12px;
  background: linear-gradient(90deg, #e7e5e4 0%, #f5f5f4 45%, #e7e5e4 90%); background-size: 300% 100%;
  animation: brillo 1.4s ease-in-out infinite;
}
@keyframes brillo { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .esqueleto { animation: none; } }
```

## 5. Las pantallas de acceso (T4: historias H1 a H3)

Las reglas de cada pantalla están en [docs/mockup/README.md](../mockup/README.md), secciones P1, P2 y P14.

### 5.1 `src/paginas/PaginaLogin.jsx` · P1 Iniciar sesión

Si ya hay sesión, lleva directo al inicio. Mientras envía, el botón se desactiva y dice "Entrando…". Los errores de la API aparecen debajo del botón.

```jsx
import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Icono from '../componentes/Icono.jsx'
import MensajeError from '../componentes/MensajeError.jsx'

// P1 Iniciar sesión (historia H2). Reglas: docs/mockup/README.md, sección P1.
export default function PaginaLogin() {
  const { token, iniciarSesion } = useAuth()
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  // Con la sesión ya iniciada, esta pantalla lleva directo al inicio
  if (token) return <Navigate to="/" replace />

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email.trim(), contrasena)
    } catch (e) {
      setError(e)
      setEnviando(false)
    }
  }

  return (
    <main className="pantalla-acceso">
      <div className="marca">
        <span className="logo-marca">
          <Icono nombre="rutinas" tamano={34} />
        </span>
        <span className="logo">
          Gym<b>Rutine</b>
        </span>
        <span className="texto-2">Entrena con plan. Mide de verdad.</span>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <CampoFormulario etiqueta="Email">
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Contraseña">
          <input
            type={verContrasena ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
          <button
            type="button"
            className="btn-icono"
            onClick={() => setVerContrasena(!verContrasena)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icono nombre="ojo" />
          </button>
        </CampoFormulario>
        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
        <MensajeError error={error} />
      </form>

      <p className="texto-2 centrado">
        ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </main>
  )
}
```

### 5.2 `src/paginas/PaginaRegistro.jsx` · P2 Crear cuenta

Los objetivos salen de `GET /referencias`. Los errores de validación (400) y el email repetido (409) aparecen debajo de su campo. Al crear la cuenta, la sesión queda iniciada.

```jsx
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import CampoFormulario from '../componentes/CampoFormulario.jsx'
import Cargando from '../componentes/Cargando.jsx'
import MensajeError from '../componentes/MensajeError.jsx'
import { obtenerReferencias } from '../utilidades/referencias.js'

// P2 Crear cuenta (historia H1). Reglas: docs/mockup/README.md, sección P2.
export default function PaginaRegistro() {
  const { token, registrarse } = useAuth()
  const [objetivos, setObjetivos] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [datos, setDatos] = useState({ nombre: '', email: '', contrasena: '', objetivo: '' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  function cargarObjetivos() {
    obtenerReferencias()
      .then((referencias) => setObjetivos(referencias.objetivos))
      .catch(setErrorCarga)
  }

  useEffect(() => {
    cargarObjetivos()
  }, [])

  function reintentar() {
    setErrorCarga(null)
    cargarObjetivos()
  }

  // Al crear la cuenta la sesión queda iniciada, y esta pantalla lleva al inicio
  if (token) return <Navigate to="/" replace />

  function cambiar(campo) {
    return (evento) => setDatos({ ...datos, [campo]: evento.target.value })
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await registrarse({ ...datos, nombre: datos.nombre.trim(), email: datos.email.trim() })
    } catch (e) {
      setError(e)
      setEnviando(false)
    }
  }

  // Errores junto a cada campo: los de "campos" (400) y el email repetido (409)
  const errores = { ...(error?.campos ?? {}) }
  if (error?.codigo === 'EMAIL_YA_REGISTRADO') errores.email = error.message
  const errorGeneral = error && Object.keys(errores).length === 0 ? error : null

  return (
    <main className="pantalla-acceso">
      <h1>Crear cuenta</h1>
      <form className="formulario" onSubmit={enviar}>
        <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
          <input required minLength={2} maxLength={80} autoComplete="name" value={datos.nombre} onChange={cambiar('nombre')} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Email" error={errores.email}>
          <input type="email" required maxLength={120} autoComplete="email" value={datos.email} onChange={cambiar('email')} />
        </CampoFormulario>
        <CampoFormulario etiqueta="Contraseña" error={errores.contrasena} ayuda="Entre 8 y 72 caracteres">
          <input
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={datos.contrasena}
            onChange={cambiar('contrasena')}
          />
        </CampoFormulario>

        <fieldset className="campo">
          <legend className="campo-etiqueta">¿Qué buscas en el gimnasio?</legend>
          <MensajeError error={errorCarga} alReintentar={reintentar} />
          {!objetivos && !errorCarga && <Cargando texto="Cargando objetivos…" />}
          {objetivos?.map((objetivo) => (
            <label key={objetivo.codigo} className="opcion">
              <input
                type="radio"
                name="objetivo"
                value={objetivo.codigo}
                required
                checked={datos.objetivo === objetivo.codigo}
                onChange={cambiar('objetivo')}
              />
              <span>
                <strong>{objetivo.nombre}</strong>
                <br />
                <span className="texto-2">{objetivo.descripcion}</span>
              </span>
            </label>
          ))}
          {errores.objetivo && <span className="error-texto">{errores.objetivo}</span>}
        </fieldset>

        <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando || !objetivos}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <MensajeError error={errorGeneral} />
      </form>

      <p className="texto-2 centrado">
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </main>
  )
}
```

### 5.3 `src/paginas/PaginaPerfil.jsx` · P14 Perfil, por ahora solo con cerrar sesión

Rances la completa en el sprint 2, con la edición del nombre y el objetivo (historia H4).

```jsx
import { useState } from 'react'
import { useAuth } from '../auth/useAuth.js'

// P14 Perfil. Por ahora muestra los datos y cierra la sesión (historia H3).
// Editar el nombre y el objetivo (historia H4) llega en el sprint 2 (T4, Rances).
export default function PaginaPerfil() {
  const { usuario, cerrarSesion } = useAuth()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    await cerrarSesion() // al borrarse la sesión, RutaPrivada lleva a /login
  }

  return (
    <section className="pagina">
      <h1>Perfil</h1>
      <div className="tarjeta fila">
        <span className="avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{usuario?.nombre}</strong>
          <div className="texto-2">{usuario?.email}</div>
        </div>
      </div>
      <button type="button" className="btn btn-secundario btn-bloque" onClick={salir} disabled={saliendo}>
        {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </section>
  )
}
```

## 6. Probar sin esperar a Rances: la API falsa

[`api-falsa-cuentas.mjs`](api-falsa-cuentas.mjs) imita el servicio de cuentas en el mismo puerto 8080: registro, login, logout, `GET /usuarios/me` y `GET /referencias`, con las mismas respuestas y errores del contrato. Guarda todo en memoria.

1. **Terminal 1**, en la raíz del repositorio:

   ```powershell
   node docs/guias/api-falsa-cuentas.mjs
   ```

   Debe decir `API falsa del servicio de cuentas en http://127.0.0.1:8080` y mostrar la usuaria de prueba: **`ana@correo.com`** con la contraseña **`clave-segura-1`**.

2. **Terminal 2** (**Terminal → New Terminal** en VS Code):

   ```powershell
   cd frontend
   npm run dev
   ```

3. Abre http://localhost:5173 y haz estas pruebas:

| Prueba | Resultado esperado |
|---|---|
| Abrir http://localhost:5173 | Lleva a `/login` |
| Iniciar sesión con `ana@correo.com` y una contraseña equivocada | "Email o contraseña incorrectos" |
| Iniciar sesión con `ana@correo.com` y `clave-segura-1` | Entra al inicio ("En construcción") con la barra de navegación |
| Recargar la página (F5) | Sigue con la sesión iniciada |
| Perfil → **Cerrar sesión** | Vuelve a `/login` |
| Crear cuenta con el email `ANA@correo.com` | "Ya existe una cuenta con este email", debajo del campo email |
| Crear cuenta con datos nuevos | Entra al inicio con la sesión iniciada |
| Cerrar sesión, detener la API falsa (`Ctrl + C` en la terminal 1) e intentar iniciar sesión | "No se pudo conectar con el servidor" |
| Con la API falsa detenida, abrir http://localhost:5173/registro en una **pestaña nueva** | Aviso de conexión con el botón **Reintentar**. Al arrancar de nuevo la API falsa y pulsarlo, aparecen los objetivos |
| F12 → modo dispositivo (`Ctrl + Shift + M`) a 360 px de ancho | La barra de navegación queda abajo y no hay scroll horizontal |
| `npm run lint` (en `frontend/`) | No muestra ningún mensaje |
| `npm run build` (en `frontend/`) | Termina con `✓ built in …` |

La API falsa olvida todo al detenerse. Si la reinicias con una sesión abierta en el navegador, ese token deja de valer: cierra sesión y vuelve a entrar.

Para detener Vite o la API falsa: `Ctrl + C` en su terminal.

## 7. Con el servicio de cuentas real

Cuando Rances avise en el grupo que T1 y la API de T4 están en `main`:

1. Instala lo que falte para correr el servicio de cuentas: JDK 21, MySQL 8.4 y Workbench, y crea la base ([guía de inicio](../../GUIA-INICIO.md) §1.2, §1.5, §1.6 y §3).
2. Trae `main` a tu rama: `git pull origin main` ([guía de git](../../GUIA-GIT.md) §2).
3. Arranca el servicio de cuentas ([guía de inicio](../../GUIA-INICIO.md) §5.1) **en lugar de** la API falsa: los dos usan el puerto 8080, así que no pueden estar encendidos a la vez.
4. Repite las pruebas del paso 6. La usuaria Ana no existe en la base real: primero crea una cuenta.

Si no alcanzas a instalar MySQL, esta prueba se hace el miércoles temprano en el computador de Rances, al unir los pull requests (cronograma del plan).

## 8. Subir tu trabajo

Desde la raíz del repositorio ([guía de git](../../GUIA-GIT.md) §3 a §5):

```powershell
git status
git add frontend
git commit -m "Agrega la base del frontend y las pantallas de login y registro"
git pull origin main
cd frontend
npm run lint
npm run build
cd ..
git push
```

- En `git status` deben aparecer solo archivos de `frontend/`. Si aparece `node_modules/` o `dist/`, no sigas y pregunta: el `.gitignore` debería excluirlos.
- Luego abre el pull request en GitHub (**Compare & pull request**, base `main`). El título empieza con la clave de tu tarjeta de T2 en Jira: `GR-45 T2 y T4: base del frontend, login y registro`. Pide la revisión de Rances y, en "Cómo probarlo", pega los pasos de la sección 6.
- En Jira, pasa tus tarjetas (`GR-45` T2 y `GR-8` a `GR-10`, H1 a H3) a **En revisión**; cuando se una el PR, a **Listo** ([guía de Jira](JIRA.md) §7).
- En el mismo PR, marca en el README la casilla de T2. Las de H1 a H3 se marcan cuando también esté la API de Rances.

## 9. Mientras esperas la revisión

- **Deja listo tu computador para el sprint 2.** Tus siguientes tareas son APIs en Spring Boot (T5 catálogo y T6 rutinas): instala el JDK 21, MySQL y Workbench, y crea la base ([guía de inicio](../../GUIA-INICIO.md) §1.2, §1.5, §1.6 y §3).
- **Lee lo que viene:** el [contrato](../CONTRATO-API.md) §5 (ejercicios) y §6 (rutinas), las reglas R1 y R2 del [modelo de datos](../MODELO-DATOS.md) y las pantallas P4 a P6 del [mockup](../mockup/README.md).
- **Tu orden en el sprint 3, desde el jueves 24:** primero la API de catálogo (T5), después la API de rutinas (T6), que debe estar en `main` el domingo 27, y al final la pantalla de catálogo (P4). Santiago necesita tu API de rutinas para registrar sesiones; ver [¿Quién espera a quién?](../../PLAN-DE-TRABAJO.md#quién-espera-a-quién).
- **Tu CRUD para la entrega final es el de rutinas** (T6: crear, ver, editar y eliminar), de la base de datos a la pantalla. Ver [Un CRUD por integrante](../../PLAN-DE-TRABAJO.md#un-crud-por-integrante).

## 10. Si algo falla

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `npm` dice que *la ejecución de scripts está deshabilitada* | Política de PowerShell | El comando `Set-ExecutionPolicy` del paso 1 |
| `node` o `npm` *no se reconoce como nombre de un cmdlet* | VS Code se abrió antes de instalar Node.js | Cierra VS Code por completo y vuelve a abrirlo |
| La página sale en blanco | Un error de JavaScript | F12 → pestaña **Console**. Casi siempre es un `import` con el nombre del archivo mal escrito |
| "No se pudo conectar con el servidor" | La API falsa (o el servicio de cuentas) está apagada | Arráncala (paso 6) |
| Vite dice `Port 5173 is in use, trying another one…` | Ya hay otro Vite corriendo | Usa la dirección que muestra, o cierra la otra terminal |
| La API falsa dice que el puerto 8080 está ocupado | El servicio de cuentas real u otra API falsa ya están encendidos | Deja solo uno de los dos |
| `npm run lint` muestra un aviso | El código no cumple una regla | El aviso dice el archivo y la línea; corrígelo y vuelve a ejecutarlo |

---

_Última actualización: 2026-09-21_
