// API falsa del servicio de cuentas. Es solo para desarrollo; no es parte de la aplicación.
//
// Responde igual que el Spring Boot real (docs/CONTRATO-API.md) en lo que el frontend y el
// servicio de entrenamiento necesitan mientras T1 y T4 no están en main: registro, login,
// logout, GET /usuarios/me, GET /referencias y el detalle de dos rutinas de ejemplo.
// Guarda todo en memoria: al detenerla se pierden las cuentas que se crearon.
//
// Se arranca desde la raíz del repositorio:   node docs/guias/api-falsa-cuentas.mjs
// Usa el puerto 8080, el mismo del servicio real, así que ni el proxy de Vite ni el servicio
// de entrenamiento cambian nada. Por eso no puede estar encendida junto con el servicio real.
import { randomUUID } from 'node:crypto'
import http from 'node:http'

const PUERTO = 8080
const RETARDO_MS = 300 // simula la demora de la red, para ver los estados de "cargando"

const referencias = {
  objetivos: [
    { codigo: 'FUERZA', nombre: 'Fuerza', descripcion: 'Pocas repeticiones con cargas altas', seriesSugeridas: 4, repeticionesSugeridas: 5 },
    { codigo: 'PERDIDA_PESO', nombre: 'Pérdida de peso', descripcion: 'Repeticiones moderadas y descansos cortos', seriesSugeridas: 3, repeticionesSugeridas: 12 },
    { codigo: 'RESISTENCIA', nombre: 'Resistencia', descripcion: 'Muchas repeticiones con cargas moderadas', seriesSugeridas: 3, repeticionesSugeridas: 15 },
  ],
  gruposMusculares: [
    { codigo: 'PECHO', nombre: 'Pecho' },
    { codigo: 'ESPALDA', nombre: 'Espalda' },
    { codigo: 'HOMBROS', nombre: 'Hombros' },
    { codigo: 'BICEPS', nombre: 'Bíceps' },
    { codigo: 'TRICEPS', nombre: 'Tríceps' },
    { codigo: 'PIERNAS', nombre: 'Piernas' },
    { codigo: 'GLUTEOS', nombre: 'Glúteos' },
    { codigo: 'ABDOMEN', nombre: 'Abdomen' },
  ],
  equipos: [
    { codigo: 'BARRA', nombre: 'Barra' },
    { codigo: 'MANCUERNAS', nombre: 'Mancuernas' },
    { codigo: 'MAQUINA', nombre: 'Máquina' },
    { codigo: 'POLEA', nombre: 'Polea' },
    { codigo: 'PESO_CORPORAL', nombre: 'Peso corporal' },
    { codigo: 'OTRO', nombre: 'Otro' },
  ],
}

// Usuaria de prueba: la del ejemplo del contrato
const usuarios = [
  { id: 7, nombre: 'Ana Gómez', email: 'ana@correo.com', contrasena: 'clave-segura-1', objetivo: 'FUERZA', fechaRegistro: '2026-09-14T18:30:00' },
]
const tokens = new Map() // token → id del usuario

// Rutinas de Ana: la 3 es la del contrato (§6) y la 4 está eliminada (activa: false)
const rutinas = [
  {
    usuarioId: 7,
    id: 3,
    nombre: 'Pecho y tríceps',
    objetivo: 'FUERZA',
    activa: true,
    ejercicios: [
      { orden: 1, ejercicio: { id: 1, nombre: 'Press de banca con barra', grupoMuscular: 'PECHO', equipo: 'BARRA', activo: true }, seriesObjetivo: 4, repeticionesObjetivo: 5 },
      { orden: 2, ejercicio: { id: 23, nombre: 'Extensión de tríceps en polea', grupoMuscular: 'TRICEPS', equipo: 'POLEA', activo: true }, seriesObjetivo: 3, repeticionesObjetivo: 10 },
    ],
  },
  {
    usuarioId: 7,
    id: 4,
    nombre: 'Pierna',
    objetivo: 'FUERZA',
    activa: false,
    ejercicios: [
      { orden: 1, ejercicio: { id: 25, nombre: 'Sentadilla con barra', grupoMuscular: 'PIERNAS', equipo: 'BARRA', activo: true }, seriesObjetivo: 4, repeticionesObjetivo: 5 },
    ],
  },
]

// Fecha y hora local sin zona, como en el contrato: 2026-09-21T18:30:00
function fechaLocal(fecha) {
  const dos = (numero) => String(numero).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`
}

// El usuario tal como lo devuelve la API: sin la contraseña
function publico({ id, nombre, email, objetivo, fechaRegistro }) {
  return { id, nombre, email, objetivo, fechaRegistro }
}

function iniciarSesion(usuario) {
  const token = randomUUID()
  tokens.set(token, usuario.id)
  const expiraEn = fechaLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  return { token, expiraEn, usuario: publico(usuario) }
}

function usuarioDelToken(req) {
  const cabecera = req.headers.authorization ?? ''
  const id = cabecera.startsWith('Bearer ') ? tokens.get(cabecera.slice(7)) : undefined
  return usuarios.find((usuario) => usuario.id === id)
}

function validarRegistro(datos) {
  const campos = {}
  const nombre = String(datos.nombre ?? '').trim()
  const email = String(datos.email ?? '').trim()
  const contrasena = String(datos.contrasena ?? '')
  if (nombre.length < 2 || nombre.length > 80) campos.nombre = 'Debe tener entre 2 y 80 caracteres'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) campos.email = 'Escribe un email válido'
  if (contrasena.length < 8 || contrasena.length > 72 || Buffer.byteLength(contrasena) > 72) {
    campos.contrasena = 'Debe tener entre 8 y 72 caracteres'
  }
  if (!referencias.objetivos.some((objetivo) => objetivo.codigo === datos.objetivo)) campos.objetivo = 'Elige un objetivo'
  return campos
}

// Decide la respuesta de cada petición: devuelve [estado, cuerpo]
function atender(metodo, ruta, datos, req) {
  const noAutenticado = [401, { codigo: 'NO_AUTENTICADO', mensaje: 'La sesión no es válida o ya venció' }]

  if (metodo === 'GET' && ruta === '/api/referencias') return [200, referencias]

  if (metodo === 'POST' && ruta === '/api/auth/registro') {
    const campos = validarRegistro(datos)
    if (Object.keys(campos).length > 0) return [400, { codigo: 'VALIDACION_FALLIDA', mensaje: 'Hay campos con errores', campos }]
    const email = datos.email.trim().toLowerCase()
    if (usuarios.some((usuario) => usuario.email === email)) {
      return [409, { codigo: 'EMAIL_YA_REGISTRADO', mensaje: 'Ya existe una cuenta con este email' }]
    }
    const nuevo = {
      id: Math.max(...usuarios.map((usuario) => usuario.id)) + 1,
      nombre: datos.nombre.trim(),
      email,
      contrasena: datos.contrasena,
      objetivo: datos.objetivo,
      fechaRegistro: fechaLocal(new Date()),
    }
    usuarios.push(nuevo)
    return [201, iniciarSesion(nuevo)]
  }

  if (metodo === 'POST' && ruta === '/api/auth/login') {
    if (!datos.email || !datos.contrasena) {
      return [400, { codigo: 'VALIDACION_FALLIDA', mensaje: 'Hay campos con errores', campos: { email: 'Es obligatorio', contrasena: 'Es obligatoria' } }]
    }
    const email = String(datos.email).trim().toLowerCase()
    const usuario = usuarios.find((u) => u.email === email && u.contrasena === datos.contrasena)
    if (!usuario) return [401, { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Email o contraseña incorrectos' }]
    return [200, iniciarSesion(usuario)]
  }

  // Desde aquí, todas exigen token
  const usuario = usuarioDelToken(req)

  if (metodo === 'POST' && ruta === '/api/auth/logout') {
    if (!usuario) return noAutenticado
    tokens.delete(req.headers.authorization.slice(7))
    return [204]
  }

  if (metodo === 'GET' && ruta === '/api/usuarios/me') {
    return usuario ? [200, publico(usuario)] : noAutenticado
  }

  const rutaRutina = ruta.match(/^\/api\/rutinas\/(\d+)$/)
  if (metodo === 'GET' && rutaRutina) {
    if (!usuario) return noAutenticado
    // Una rutina de otro usuario responde igual que una que no existe
    const rutina = rutinas.find((r) => r.id === Number(rutaRutina[1]) && r.usuarioId === usuario.id)
    if (!rutina) return [404, { codigo: 'RUTINA_NO_ENCONTRADA', mensaje: 'La rutina no existe' }]
    const { usuarioId, ...respuesta } = rutina
    return [200, respuesta]
  }

  return [404, { codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'La API falsa no tiene esta ruta' }]
}

const servidor = http.createServer((req, res) => {
  let texto = ''
  req.on('data', (parte) => (texto += parte))
  req.on('end', () => {
    let respuesta
    try {
      const datos = texto ? JSON.parse(texto) : {}
      respuesta = atender(req.method, new URL(req.url, 'http://localhost').pathname, datos, req)
    } catch {
      respuesta = [400, { codigo: 'VALIDACION_FALLIDA', mensaje: 'El cuerpo no es un JSON válido' }]
    }
    const [estado, cuerpo] = respuesta
    setTimeout(() => {
      console.log(`${req.method} ${req.url} → ${estado}`)
      if (cuerpo === undefined) {
        res.writeHead(estado).end()
      } else {
        res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(cuerpo))
      }
    }, RETARDO_MS)
  })
})

servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PUERTO} está ocupado. ¿Está encendido el servicio de cuentas real, u otra API falsa?`)
    process.exit(1)
  }
  throw error
})

servidor.listen(PUERTO, '127.0.0.1', () => {
  const tokenDeAna = iniciarSesion(usuarios[0]).token
  console.log(`API falsa del servicio de cuentas en http://127.0.0.1:${PUERTO}`)
  console.log('Usuaria de prueba: ana@correo.com / clave-segura-1')
  console.log(`Token de Ana, listo para Postman: ${tokenDeAna}`)
  console.log('Para detenerla: Ctrl + C\n')
})
