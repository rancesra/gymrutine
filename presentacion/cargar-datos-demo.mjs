// Carga los datos de demostración de GymRutine usando la API, igual que lo haría una persona.
// No toca las bases de datos directamente, así que sirve en cualquier computador del equipo.
//
// Antes de correrlo hay que tener encendidos los dos servicios (GUIA-INICIO.md §5):
//   node presentacion/cargar-datos-demo.mjs
//
// Es idempotente: si la cuenta ya tiene sesiones, no crea nada y lo avisa.
const CUENTAS = 'http://127.0.0.1:8080/api'
const ENTRENAMIENTO = 'http://127.0.0.1:3000/api'

const CUENTA = {
  nombre: 'Ana Gómez',
  email: 'ana@correo.com',
  contrasena: 'clave-segura-1',
  objetivo: 'FUERZA',
}

let token = null

async function pedir(base, metodo, ruta, cuerpo) {
  const cabeceras = {}
  if (token) cabeceras.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new Error(`No se pudo conectar con ${base}. ¿Están encendidos los dos servicios?`)
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new Error(`${metodo} ${ruta} respondió ${respuesta.status}: ${JSON.stringify(datos)}`)
  }
  return datos
}

const cuentas = (metodo, ruta, cuerpo) => pedir(CUENTAS, metodo, ruta, cuerpo)
const entrenamiento = (metodo, ruta, cuerpo) => pedir(ENTRENAMIENTO, metodo, ruta, cuerpo)

// ---------- Fechas, siempre relativas a hoy para que la demostración se vea reciente ----------

function fechaHora(diasAtras, hora) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - diasAtras)
  const dos = (numero) => String(numero).padStart(2, '0')
  const dia = `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
  return hora === undefined ? dia : `${dia}T${hora}:00`
}

// ---------- Los datos ----------

const EJERCICIO_PROPIO = {
  nombre: 'Remo invertido en barra fija',
  grupoMuscular: 'ESPALDA',
  equipo: 'PESO_CORPORAL',
  objetivos: ['FUERZA', 'RESISTENCIA'],
  descripcion: 'Cuerpo recto, codos pegados y pecho hacia la barra',
}

// Cada rutina con los nombres de sus ejercicios; los ids se buscan en el catálogo
const RUTINAS = [
  {
    nombre: 'Pecho y tríceps',
    objetivo: 'FUERZA',
    ejercicios: [
      ['Press de banca con barra', 4, 5],
      ['Press inclinado con mancuernas', 3, 8],
      ['Fondos en paralelas', 3, 10],
      ['Extensión de tríceps en polea', 3, 12],
    ],
  },
  {
    nombre: 'Espalda y bíceps',
    objetivo: 'FUERZA',
    ejercicios: [
      ['Dominadas', 4, 6],
      ['Remo con barra', 4, 8],
      ['Curl con barra', 3, 10],
      [EJERCICIO_PROPIO.nombre, 3, 12],
    ],
  },
  {
    nombre: 'Pierna',
    objetivo: 'FUERZA',
    ejercicios: [
      ['Sentadilla con barra', 5, 5],
      ['Peso muerto rumano', 4, 8],
      ['Prensa de piernas', 3, 10],
      ['Curl femoral en máquina', 3, 12],
    ],
  },
  {
    nombre: 'Full body express',
    objetivo: 'RESISTENCIA',
    ejercicios: [
      ['Sentadilla con barra', 3, 15],
      ['Press de banca con barra', 3, 15],
      ['Remo con barra', 3, 15],
    ],
  },
]

// 15 sesiones en cinco semanas: tres por semana, rotando las rutinas y subiendo las cargas.
// [días atrás, hora, índice de la rutina, factor de carga]
const SESIONES = [
  [34, '18:30', 0, 0.86], [32, '18:15', 1, 0.86], [30, '09:10', 2, 0.86],
  [27, '18:40', 0, 0.89], [25, '18:20', 1, 0.89], [23, '09:05', 2, 0.89],
  [20, '18:35', 0, 0.92], [18, '18:10', 1, 0.92], [16, '09:15', 2, 0.92],
  [13, '18:30', 0, 0.96], [11, '18:25', 1, 0.96], [9, '09:00', 3, 0.96],
  [6, '18:40', 0, 1.0], [4, '18:15', 1, 1.0], [2, '09:20', 2, 1.0],
]

// Peso base de cada ejercicio en la última semana; las anteriores se calculan con el factor
const CARGAS = {
  'Press de banca con barra': 65,
  'Press inclinado con mancuernas': 26,
  'Fondos en paralelas': 0,
  'Extensión de tríceps en polea': 30,
  Dominadas: 0,
  'Remo con barra': 60,
  'Curl con barra': 30,
  [EJERCICIO_PROPIO.nombre]: 0,
  'Sentadilla con barra': 85,
  'Peso muerto rumano': 70,
  'Prensa de piernas': 140,
  'Curl femoral en máquina': 35,
}

const PESOS = [
  [35, 78.6], [28, 78.4], [21, 78.0], [14, 77.8], [7, 77.5], [1, 77.2],
]

// Redondea a 2,5 kg, que es lo que de verdad se puede cargar en una barra
function cargaDe(nombre, factor) {
  const base = CARGAS[nombre] ?? 20
  if (base === 0) return 0
  return Math.round((base * factor) / 2.5) * 2.5
}

// ---------- Carga ----------

async function entrar() {
  try {
    const sesion = await cuentas('POST', '/auth/login', { email: CUENTA.email, contrasena: CUENTA.contrasena })
    token = sesion.token
    console.log(`Cuenta de demostración: ${CUENTA.email} (ya existía)`)
  } catch {
    const sesion = await cuentas('POST', '/auth/registro', CUENTA)
    token = sesion.token
    console.log(`Cuenta de demostración creada: ${CUENTA.email}`)
  }
}

async function catalogoPorNombre() {
  const ejercicios = await cuentas('GET', '/ejercicios')
  return new Map(ejercicios.map((ejercicio) => [ejercicio.nombre, ejercicio.id]))
}

async function crearEjercicioPropio(catalogo) {
  if (catalogo.has(EJERCICIO_PROPIO.nombre)) return catalogo
  const creado = await cuentas('POST', '/ejercicios', EJERCICIO_PROPIO)
  console.log(`  Ejercicio propio: ${creado.nombre}`)
  return catalogo.set(creado.nombre, creado.id)
}

async function crearRutinas(catalogo) {
  const existentes = new Map((await cuentas('GET', '/rutinas')).map((rutina) => [rutina.nombre, rutina.id]))
  const ids = []
  for (const plantilla of RUTINAS) {
    if (existentes.has(plantilla.nombre)) {
      ids.push(existentes.get(plantilla.nombre))
      continue
    }
    const rutina = await cuentas('POST', '/rutinas', {
      nombre: plantilla.nombre,
      objetivo: plantilla.objetivo,
      ejercicios: plantilla.ejercicios.map(([nombre, series, repeticiones]) => ({
        ejercicioId: catalogo.get(nombre),
        seriesObjetivo: series,
        repeticionesObjetivo: repeticiones,
      })),
    })
    console.log(`  Rutina: ${rutina.nombre} (${rutina.ejercicios.length} ejercicios)`)
    ids.push(rutina.id)
  }
  return ids
}

async function crearSesiones(rutinasIds) {
  // Los ejercicios salen de la rutina tal como está guardada, no de la plantilla: si la rutina ya
  // existía con otros ejercicios, la sesión igual cuadra con ella (el servicio la valida contra Spring).
  const detalles = new Map()
  for (const id of new Set(rutinasIds)) {
    detalles.set(id, await cuentas('GET', `/rutinas/${id}`))
  }

  for (const [diasAtras, hora, indiceRutina, factor] of SESIONES) {
    const rutinaId = rutinasIds[indiceRutina]
    const registros = detalles.get(rutinaId).ejercicios.map((item) => {
      const carga = cargaDe(item.ejercicio.nombre, factor)
      const series = item.seriesObjetivo
      return {
        ejercicioId: item.ejercicio.id,
        series: Array.from({ length: series }, (_, i) => ({
          // La última serie es la más pesada: ahí es donde aparecen los récords
          pesoKg: carga === 0 ? 0 : carga + (i === series - 1 ? 2.5 : 0),
          repeticiones: Math.max(1, item.repeticionesObjetivo - i),
        })),
      }
    })
    await entrenamiento('POST', '/sesiones', {
      rutinaId,
      fechaInicio: fechaHora(diasAtras, hora),
      duracionMinutos: 45 + ((diasAtras * 7) % 20),
      registros,
    })
  }
  console.log(`  Sesiones: ${SESIONES.length} en las últimas cinco semanas`)
}

async function crearPesos() {
  for (const [diasAtras, pesoKg] of PESOS) {
    await entrenamiento('POST', '/peso-corporal', { fecha: fechaHora(diasAtras), pesoKg })
  }
  console.log(`  Peso corporal: ${PESOS.length} registros`)
}

async function principal() {
  await entrar()

  const sesiones = await entrenamiento('GET', '/sesiones')
  if (sesiones.length > 0) {
    console.log(`\nLa cuenta ya tiene ${sesiones.length} sesiones: no se crea nada.`)
    console.log('Para empezar de cero, borra sus datos y vuelve a correrlo.')
    return
  }

  let catalogo = await catalogoPorNombre()
  catalogo = await crearEjercicioPropio(catalogo)
  const rutinasIds = await crearRutinas(catalogo)
  await crearSesiones(rutinasIds)
  await crearPesos()

  const records = await entrenamiento('GET', '/records')
  console.log(`\nListo. Entra con ${CUENTA.email} / ${CUENTA.contrasena}`)
  console.log(`Quedaron ${RUTINAS.length} rutinas, ${SESIONES.length} sesiones, ${records.length} récords y ${PESOS.length} registros de peso.`)
}

principal().catch((error) => {
  console.error(`\n${error.message}`)
  process.exit(1)
})
