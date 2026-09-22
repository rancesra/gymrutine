# Guía de T3 — Base del servicio de entrenamiento

**Para:** Santiago · **Tarea:** T3, base del servicio de entrenamiento (Node.js + Express + MongoDB) · **Rama:** `t3-base-node` · **Entrega:** la del sprint 2, el miércoles 23 de septiembre

Al terminar tendrás el segundo servicio de la arquitectura funcionando:

- Node.js con Express 5, conectado a la base `gymrutine` de MongoDB con Mongoose.
- Los modelos `Sesion` y `RegistroPeso`, con sus índices.
- El middleware que valida el token preguntándole al servicio de cuentas.
- Los errores con el formato del contrato.
- `GET /salud` y `GET /api/sesiones`.

En la presentación del miércoles 23 muestras el modelo de MongoDB en Compass (punto 2) y los dos servicios conectados (punto 6) ([plan de trabajo](../../PLAN-DE-TRABAJO.md#entrega-del-sprint-2--miércoles-23-de-septiembre)).

**Todo el código de esta guía ya se probó** con MongoDB 8.0: colecciones e índices, 401 sin token o con un token inválido, 200 con un token válido, 503 con el servicio de cuentas apagado, y cada usuario viendo solo sus sesiones. Si copias cada archivo tal cual, funciona.

**No tienes que esperar a Rances.** Mientras su API de cuentas (T4) no esté en `main`, validas el token contra la **API falsa** del paso 6, que responde igual que el [contrato](../CONTRATO-API.md).

Los comandos son para **PowerShell**, en la terminal de VS Code. En macOS son los mismos, salvo donde se indica.

## 1. Antes de empezar

1. Necesitas **Git, Node.js 24, VS Code, MongoDB 8.0 con Compass y Postman** ([guía de inicio](../../GUIA-INICIO.md) §1.1, §1.3, §1.4, §1.7 y §1.8), y haber aceptado las invitaciones de GitHub y de Jira (§0).
2. **MongoDB debe estar encendido.** Abre Compass → **New connection** → deja `mongodb://localhost:27017` → **Connect**. Si no conecta, en Windows presiona `Win + R`, escribe `services.msc`, busca **MongoDB Server (MongoDB)** y elige **Iniciar**.
3. Comprueba Node.js y npm:

   ```powershell
   node --version
   npm --version
   ```

   Si `npm` responde que *la ejecución de scripts está deshabilitada en este sistema*, ejecuta esto una sola vez y confirma con `S` (o `Y` si tu Windows está en inglés):

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

4. Abre la carpeta del repositorio en VS Code, trae lo último de `main` y crea tu rama ([guía de git](../../GUIA-GIT.md) §1). Si clonaste en otra carpeta, cambia `C:\dev\gymrutine` por la tuya:

   ```powershell
   cd C:\dev\gymrutine
   git switch main
   git pull
   git switch -c t3-base-node
   git push -u origin t3-base-node
   ```

## 2. Crear el proyecto

Desde la **raíz del repositorio**:

```powershell
mkdir backend-node
cd backend-node
npm init -y
npm install express mongoose
```

- **`npm init -y`** crea `package.json`, la ficha del proyecto.
- **`npm install express mongoose`** descarga Express 5 y Mongoose en `node_modules/` (no se sube) y los anota en `package.json` y `package-lock.json` (sí se suben).

Abre `backend-node/package.json` y cambia cuatro cosas:

1. Borra la línea `"main": "index.js",`.
2. En `"description"`, escribe `"Servicio de entrenamiento de GymRutine"`.
3. Reemplaza el bloque `"scripts"` por el de abajo.
4. Cambia `"type": "commonjs"` por `"type": "module"`. Así se usa `import` y `export`, como en React. Si la línea no existe, agrégala.

Así debe quedar. Las versiones de `dependencies` déjalas como las puso npm: pueden ser un poco más nuevas.

```json
{
  "name": "backend-node",
  "version": "1.0.0",
  "description": "Servicio de entrenamiento de GymRutine",
  "scripts": {
    "dev": "node --env-file=.env --watch src/index.js",
    "start": "node --env-file=.env src/index.js",
    "test": "node --test"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^9.10.1"
  }
}
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Arranca el servicio y lo reinicia solo cada vez que guardas un archivo (`--watch`). Es el que usas mientras programas |
| `npm start` | Arranca el servicio sin reiniciarse |
| `npm test` | Ejecuta las pruebas con `node --test`. Todavía no hay; las primeras llegan con el algoritmo de récords (T8) |

`--env-file=.env` hace que Node lea la configuración del archivo `.env` (paso 3). Node 24 ya lo trae: no hace falta la librería `dotenv`.

## 3. La configuración: `.env.ejemplo` y `.env`

Crea `backend-node/.env.ejemplo` (en VS Code: clic derecho sobre `backend-node` → **New File…**):

```ini
# Copia este archivo como .env (el .env no se sube al repositorio).
# Se usa 127.0.0.1 y no localhost: en Windows, Node puede resolver localhost a IPv6 y MongoDB solo escucha en IPv4.
PUERTO=3000
MONGODB_URI=mongodb://127.0.0.1:27017/gymrutine
URL_SERVICIO_CUENTAS=http://127.0.0.1:8080
```

Luego, dentro de `backend-node/`, crea tu propio `.env` como copia del ejemplo:

```powershell
Copy-Item .env.ejemplo .env
```

En macOS: `cp .env.ejemplo .env`.

- **`.env.ejemplo` sí se sube** al repositorio: dice qué variables existen. **`.env` no se sube** (lo excluye el `.gitignore` de la raíz): cada uno tiene el suyo.
- **`127.0.0.1` y no `localhost`:** en Windows, Node puede resolver `localhost` a la dirección IPv6 `::1`, y MongoDB solo escucha en IPv4. Con `localhost`, la conexión fallaría con `ECONNREFUSED ::1:27017`.

## 4. El código

**Cómo crear cada archivo:** en el explorador de VS Code, clic derecho sobre la carpeta `backend-node` → **New File…** y escribe la ruta completa, por ejemplo `src/config/db.js`. VS Code crea las carpetas que falten. Respeta mayúsculas y minúsculas: los `import` usan los nombres exactos y **terminan en `.js`**, porque con módulos ES Node no adivina la extensión.

Así queda `backend-node/` al terminar ([ARQUITECTURA.md](../ARQUITECTURA.md) §5):

```
backend-node/
├── .env.ejemplo            variables de configuración (se sube)
├── .env                    tu copia (no se sube)
├── package.json
└── src/
    ├── index.js            punto de entrada: conecta y arranca
    ├── app.js              arma Express: JSON, rutas y errores
    ├── errores.js          la clase ErrorApi
    ├── config/
    │   └── db.js           conexión con MongoDB
    ├── middlewares/
    │   ├── autenticar.js   exige un token válido
    │   └── errores.js      responde {codigo, mensaje, campos}
    ├── servicios/
    │   └── cuentas.js      habla con el servicio de cuentas
    ├── modelos/
    │   ├── Sesion.js       colección "sesiones"
    │   └── RegistroPeso.js colección "registrosPeso"
    └── rutas/
        └── sesiones.js     GET /api/sesiones
```

### 4.1 `src/index.js`

El punto de entrada: primero conecta con MongoDB y después abre el puerto. El `await` suelto funciona porque el proyecto usa módulos ES.

```js
// Punto de entrada: conecta con MongoDB y arranca el servidor HTTP.
import app from './app.js'
import { conectarBaseDatos } from './config/db.js'

const puerto = Number(process.env.PUERTO ?? 3000)

await conectarBaseDatos()
app.listen(puerto, () => {
  console.log(`Servicio de entrenamiento en http://localhost:${puerto}`)
})
```

### 4.2 `src/app.js`

Arma la aplicación: lee JSON, publica `/salud` sin token, protege todo `/api` con `autenticar`, monta las rutas y, al final, los manejadores de "ruta no encontrada" y de errores. **El orden importa:** Express recorre los `app.use` de arriba abajo.

```js
// Arma la aplicación de Express: JSON, rutas y manejo de errores.
import express from 'express'
import mongoose from 'mongoose'
import { autenticar } from './middlewares/autenticar.js'
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js'
import rutasSesiones from './rutas/sesiones.js'

const app = express()
app.use(express.json())

// Salud del servicio: sin token y fuera de /api, para comprobar rápido que arrancó
app.get('/salud', (req, res) => {
  const conectado = mongoose.connection.readyState === 1
  res.json({ estado: 'ok', mongo: conectado ? 'conectado' : 'desconectado' })
})

// Todo lo que está bajo /api exige un token válido del servicio de cuentas
app.use('/api', autenticar)
app.use('/api/sesiones', rutasSesiones)

app.use(rutaNoEncontrada)
app.use(manejarErrores)

export default app
```

### 4.3 `src/config/db.js`

Conecta con MongoDB. `init()` crea las colecciones y sus índices aunque todavía estén vacías, para que se vean en Compass el día de la entrega.

```js
// Conexión con MongoDB mediante Mongoose.
import mongoose from 'mongoose'
import RegistroPeso from '../modelos/RegistroPeso.js'
import Sesion from '../modelos/Sesion.js'

export async function conectarBaseDatos() {
  await mongoose.connect(process.env.MONGODB_URI)
  // Crea las colecciones y sus índices aunque todavía estén vacías (así se ven en Compass)
  await Promise.all([Sesion.init(), RegistroPeso.init()])
  console.log('Conectado a MongoDB')
}
```

### 4.4 `src/errores.js`

El error propio del servicio: estado HTTP, código del contrato, mensaje y, si aplica, los campos con error. Cualquier parte del código lo lanza con `throw new ErrorApi(...)`.

```js
// Error con el formato del contrato: estado HTTP, código estable, mensaje y, si aplica, campos.
export class ErrorApi extends Error {
  constructor(estado, codigo, mensaje, campos) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.campos = campos
  }
}
```

### 4.5 `src/middlewares/errores.js`

Convierte cualquier error en la respuesta del contrato (§10). Express 5 trae aquí también los errores lanzados dentro de funciones `async`, así que las rutas no necesitan `try/catch`.

```js
// Convierte cualquier error en la respuesta {codigo, mensaje, campos} del contrato (§10).
// Express 5 trae aquí también los errores lanzados dentro de funciones async.
import { ErrorApi } from '../errores.js'

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'La ruta no existe' })
}

// Express reconoce el manejador de errores porque recibe 4 parámetros
export function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorApi) {
    const cuerpo = { codigo: error.codigo, mensaje: error.message }
    if (error.campos) cuerpo.campos = error.campos
    return res.status(error.estado).json(cuerpo)
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ codigo: 'VALIDACION_FALLIDA', mensaje: 'El cuerpo no es un JSON válido' })
  }
  if (error.name === 'ValidationError') {
    const campos = Object.fromEntries(Object.entries(error.errors).map(([campo, e]) => [campo, e.message]))
    return res.status(400).json({ codigo: 'VALIDACION_FALLIDA', mensaje: 'Hay campos con errores', campos })
  }
  console.error(error)
  res.status(500).json({ codigo: 'ERROR_INTERNO', mensaje: 'Algo salió mal' })
}
```

### 4.6 `src/servicios/cuentas.js`

Habla con el servicio de cuentas usando el `fetch` que ya trae Node. Para saber si un token es válido, le pregunta quién es el usuario (`GET /api/usuarios/me`, [ARQUITECTURA.md](../ARQUITECTURA.md) §6). Si el servicio de cuentas no responde, lanza 503.

```js
// Cliente HTTP hacia el servicio de cuentas (Spring Boot). Usa el fetch que ya trae Node.
import { ErrorApi } from '../errores.js'

async function pedirACuentas(ruta, autorizacion) {
  try {
    return await fetch(`${process.env.URL_SERVICIO_CUENTAS}${ruta}`, {
      headers: { Authorization: autorizacion },
    })
  } catch {
    throw new ErrorApi(503, 'SERVICIO_NO_DISPONIBLE', 'El servicio de cuentas no responde')
  }
}

// Valida el token preguntándole al servicio de cuentas quién es el usuario (ARQUITECTURA §6)
export async function obtenerUsuario(autorizacion) {
  const respuesta = await pedirACuentas('/api/usuarios/me', autorizacion)
  if (respuesta.status === 401) {
    throw new ErrorApi(401, 'NO_AUTENTICADO', 'La sesión no es válida o ya venció')
  }
  if (!respuesta.ok) {
    throw new ErrorApi(503, 'SERVICIO_NO_DISPONIBLE', 'El servicio de cuentas respondió con un error')
  }
  return respuesta.json()
}
```

### 4.7 `src/middlewares/autenticar.js`

Exige la cabecera `Authorization: Bearer <token>`. Con un token válido deja el usuario en `req.usuario`: de ahí sale siempre el usuario, nunca de la URL ni del cuerpo.

```js
// Exige un token válido: sin él responde 401; con él deja el usuario en req.usuario.
import { ErrorApi } from '../errores.js'
import { obtenerUsuario } from '../servicios/cuentas.js'

export async function autenticar(req, res, next) {
  const cabecera = req.get('Authorization')
  if (!cabecera?.startsWith('Bearer ')) {
    throw new ErrorApi(401, 'NO_AUTENTICADO', 'Falta el token de acceso')
  }
  req.usuario = await obtenerUsuario(cabecera)
  next()
}
```

### 4.8 `src/modelos/Sesion.js`

La colección `sesiones`, fiel al [modelo de datos](../MODELO-DATOS.md) §5: cada sesión guarda dentro sus ejercicios y sus series, con una copia del nombre de la rutina y de cada ejercicio. Los dos índices aceleran el historial y el cálculo de récords. `toJSON` hace que la API devuelva `id` en texto en lugar de `_id`.

```js
// Colección "sesiones": cada entrenamiento con sus ejercicios y series dentro (MODELO-DATOS §5).
import mongoose from 'mongoose'

const esquemaSerie = new mongoose.Schema(
  {
    numero: { type: Number, required: true, min: 1 },
    pesoKg: { type: Number, required: true, min: 0, max: 500 },
    repeticiones: { type: Number, required: true, min: 1, max: 100 },
    esRecord: { type: Boolean, required: true, default: false },
  },
  { _id: false },
)

const esquemaRegistro = new mongoose.Schema(
  {
    orden: { type: Number, required: true, min: 1 },
    // Copia del ejercicio al momento de registrar (DM-09)
    ejercicio: {
      id: { type: Number, required: true },
      nombre: { type: String, required: true },
      grupoMuscular: { type: String, required: true },
    },
    series: {
      type: [esquemaSerie],
      validate: [(series) => series.length >= 1 && series.length <= 20, 'Debe tener entre 1 y 20 series'],
    },
  },
  { _id: false },
)

const esquemaSesion = new mongoose.Schema(
  {
    usuarioId: { type: Number, required: true },
    rutina: {
      id: { type: Number, required: true },
      nombre: { type: String, required: true },
    },
    fechaInicio: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/ },
    duracionMinutos: { type: Number, required: true, min: 1, max: 600 },
    registros: {
      type: [esquemaRegistro],
      validate: [(registros) => registros.length >= 1 && registros.length <= 15, 'Debe tener entre 1 y 15 ejercicios'],
    },
  },
  { versionKey: false },
)

esquemaSesion.index({ usuarioId: 1, fechaInicio: -1 })
esquemaSesion.index({ usuarioId: 1, 'registros.ejercicio.id': 1 })

// En la API, el _id sale como "id" en texto (contrato §1)
esquemaSesion.set('toJSON', {
  transform: (documento, json) => {
    json.id = String(json._id)
    delete json._id
    return json
  },
})

// El tercer parámetro fija el nombre de la colección (si no, Mongoose inventaría "sesions")
export default mongoose.model('Sesion', esquemaSesion, 'sesiones')
```

### 4.9 `src/modelos/RegistroPeso.js`

La colección `registrosPeso`. El índice único impide dos registros del mismo usuario en la misma fecha.

```js
// Colección "registrosPeso": peso corporal por usuario y fecha (MODELO-DATOS §5).
import mongoose from 'mongoose'

const esquemaRegistroPeso = new mongoose.Schema(
  {
    usuarioId: { type: Number, required: true },
    fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    pesoKg: { type: Number, required: true, min: 20, max: 350 },
  },
  { versionKey: false },
)

// Como máximo un registro por usuario y fecha
esquemaRegistroPeso.index({ usuarioId: 1, fecha: 1 }, { unique: true })

esquemaRegistroPeso.set('toJSON', {
  transform: (documento, json) => {
    json.id = String(json._id)
    delete json._id
    return json
  },
})

export default mongoose.model('RegistroPeso', esquemaRegistroPeso, 'registrosPeso')
```

### 4.10 `src/rutas/sesiones.js`

Por ahora solo el historial, que responde `[]` mientras no haya sesiones. Registrar, ver el detalle y eliminar llegan con T7. **Toda consulta filtra por `usuarioId`:** así nadie ve las sesiones de otro.

```js
// Rutas de /api/sesiones. Por ahora solo el historial vacío para la entrega del sprint 2;
// T7 agrega registrar, detalle, editar, eliminar y últimos registros.
import { Router } from 'express'
import Sesion from '../modelos/Sesion.js'

const rutas = Router()

// Historial del usuario, de la sesión más reciente a la más antigua
rutas.get('/', async (req, res) => {
  const sesiones = await Sesion.find({ usuarioId: req.usuario.id }).sort({ fechaInicio: -1, _id: -1 })
  res.json(sesiones)
})

export default rutas
```

## 5. Arrancar el servicio

Dentro de `backend-node/`:

```powershell
npm run dev
```

Debe mostrar:

```
Conectado a MongoDB
Servicio de entrenamiento en http://localhost:3000
```

- Si Windows pregunta si permites que **Node.js** se comunique en la red, puedes permitirlo en redes privadas. Para trabajar en tu computador da igual lo que elijas.
- Abre http://localhost:3000/salud en el navegador: debe responder `{"estado":"ok","mongo":"conectado"}`.
- En **Compass**, actualiza la lista de bases (ícono ⟳): aparece `gymrutine` con las colecciones `sesiones` y `registrosPeso`. En la pestaña **Indexes** de cada una:

| Colección | Índices |
|---|---|
| `sesiones` | `_id_`, `usuarioId_1_fechaInicio_-1` y `usuarioId_1_registros.ejercicio.id_1` |
| `registrosPeso` | `_id_` y `usuarioId_1_fecha_1`, marcado como **UNIQUE** |

## 6. Probar el token sin esperar a Rances: la API falsa

[`api-falsa-cuentas.mjs`](api-falsa-cuentas.mjs) imita el servicio de cuentas en el mismo puerto 8080: registro, login, logout, `GET /usuarios/me`, `GET /referencias` y `GET /rutinas/{id}`, con las respuestas y los errores del contrato. Guarda todo en memoria.

**En otra terminal**, en la raíz del repositorio:

```powershell
node docs/guias/api-falsa-cuentas.mjs
```

Muestra la usuaria de prueba (`ana@correo.com` / `clave-segura-1`) y un **token de Ana listo para usar**. Cópialo.

En **Postman**, crea una petición `GET http://127.0.0.1:3000/api/sesiones`. En la pestaña **Authorization** eliges **Bearer Token** y pegas el token.

| Prueba | Resultado esperado |
|---|---|
| Sin token (Authorization en **No Auth**) | 401 `NO_AUTENTICADO`: "Falta el token de acceso" |
| Con el token de Ana | 200 con `[]` |
| Con el token cambiado (agrégale una letra) | 401 `NO_AUTENTICADO`: "La sesión no es válida o ya venció" |
| `GET http://127.0.0.1:3000/api/no-existe` con el token | 404 `RUTA_NO_ENCONTRADA` |
| `POST http://127.0.0.1:3000/api/sesiones` con **Body → raw → JSON** y el texto `{"a":` | 400 `VALIDACION_FALLIDA`: "El cuerpo no es un JSON válido" |
| Detener la API falsa (`Ctrl + C`) y repetir la petición con el token | 503 `SERVICIO_NO_DISPONIBLE` |

**Así se consigue un token con el servicio real** (con la API falsa es igual): `POST http://127.0.0.1:8080/api/auth/login`, con **Body → raw → JSON**:

```json
{ "email": "ana@correo.com", "contrasena": "clave-segura-1" }
```

La respuesta trae el `token`.

### Cada usuario ve solo sus sesiones

1. En Compass, abre `gymrutine` → `sesiones` → **ADD DATA → Insert document**, borra lo que aparece y pega estas dos sesiones: una de Ana (usuario 7) y una de otro usuario (99).

   ```json
   [
     {
       "usuarioId": 7,
       "rutina": { "id": 3, "nombre": "Pecho y tríceps" },
       "fechaInicio": "2026-09-14T18:30:00",
       "duracionMinutos": 55,
       "registros": [
         {
           "orden": 1,
           "ejercicio": { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO" },
           "series": [{ "numero": 1, "pesoKg": 62.5, "repeticiones": 4, "esRecord": true }]
         }
       ]
     },
     {
       "usuarioId": 99,
       "rutina": { "id": 5, "nombre": "De otro usuario" },
       "fechaInicio": "2026-09-15T10:00:00",
       "duracionMinutos": 30,
       "registros": []
     }
   ]
   ```

2. Arranca otra vez la API falsa, copia el token nuevo y repite `GET /api/sesiones`: debe llegar **solo** la sesión de Ana, con `id` en texto y sin `_id`.
3. **Borra las dos sesiones** en Compass (ícono de la papelera en cada documento), para que la base quede vacía para la demostración.

Para detener el servicio o la API falsa: `Ctrl + C` en su terminal.

## 7. Con el servicio de cuentas real

Cuando Rances avise en el grupo que T1 y la API de T4 están en `main`:

1. Instala lo que falte para correr el servicio de cuentas: JDK 21, MySQL 8.4 y Workbench, y crea la base ([guía de inicio](../../GUIA-INICIO.md) §1.2, §1.5, §1.6 y §3).
2. Trae `main` a tu rama: `git pull origin main` ([guía de git](../../GUIA-GIT.md) §2).
3. Arranca el servicio de cuentas ([guía de inicio](../../GUIA-INICIO.md) §5.1) **en lugar de** la API falsa: los dos usan el puerto 8080.
4. Crea una cuenta (`POST http://127.0.0.1:8080/api/auth/registro`, cuerpo del [contrato](../CONTRATO-API.md) §3), usa su token y repite las pruebas del paso 6.

Si no alcanzas a instalar MySQL, esta prueba se hace el miércoles temprano en el computador de Rances, al unir los pull requests (cronograma del plan).

## 8. Subir tu trabajo

Desde la raíz del repositorio ([guía de git](../../GUIA-GIT.md) §3 a §5):

```powershell
git status
git add backend-node
git commit -m "Agrega la base del servicio de entrenamiento con Node y MongoDB"
git pull origin main
cd backend-node
npm test
cd ..
git push
```

- En `git status` deben aparecer `package.json`, `package-lock.json`, `.env.ejemplo` y `src/`. **Si aparece `.env` o `node_modules/`, no sigas y pregunta:** el `.env` es tuyo y no se sube.
- Luego abre el pull request en GitHub (**Compare & pull request**, base `main`). El título empieza con la clave de tu tarjeta de T3 en Jira: `GR-46 T3: base del servicio de entrenamiento`. Pide la revisión de Rances y, en "Cómo probarlo", pega las pruebas del paso 6.
- En Jira, pasa tu tarjeta de T3 (`GR-46`) a **En revisión**; cuando se una el PR, a **Listo** ([guía de Jira](JIRA.md) §7).
- En el mismo PR, marca en el README la casilla de T3.

## 9. Lo que sigue: sprint 3

- **Primero, T8 algoritmo de récords (24 y 25 de septiembre).** No depende de nadie: es una función pura, `calcularRecords`, con sus pruebas en `node --test` ([modelo de datos](../MODELO-DATOS.md) §7.1 y [plan](../../PLAN-DE-TRABAJO.md#t8--récords-personales-historias-18-y-19)).
- **Después, T7 API de sesiones (26 al 28 de septiembre),** con `PUT /api/sesiones/{id}` para editar (contrato §7). Para registrar una sesión, el servicio le pide la rutina al de cuentas con `GET /api/rutinas/{id}`, que hace Javier en T6 y debe estar en `main` el domingo 27. Mientras no esté, la API falsa ya responde para Ana la rutina 3 (activa) y la 4 (eliminada, `activa: false`), y cualquier otra da 404. Ver [¿Quién espera a quién?](../../PLAN-DE-TRABAJO.md#quién-espera-a-quién).
- **Tu CRUD para la entrega final es el de sesiones** (T7: registrar, ver, editar y eliminar), de la colección a las pantallas P7 a P10. Ver [Un CRUD por integrante](../../PLAN-DE-TRABAJO.md#un-crud-por-integrante).
- **El miércoles 23, en la entrega,** presentas el modelo de MongoDB en Compass (punto 2) y los dos servicios conectados (punto 6).

## 10. Si algo falla

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `npm` dice que *la ejecución de scripts está deshabilitada* | Política de PowerShell | El comando `Set-ExecutionPolicy` del paso 1 |
| `node: .env: not found` | Falta tu `.env` | `Copy-Item .env.ejemplo .env` dentro de `backend-node/` |
| `SyntaxError: Cannot use import statement outside a module` | `package.json` sigue con `"type": "commonjs"` | Cámbialo a `"module"` (paso 2) |
| `Cannot find module …/src/…` | Un `import` con la ruta o el nombre mal escritos, o sin `.js` al final | Compara la línea con el código de esta guía |
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`, unos 30 segundos después de arrancar | MongoDB está apagado | `services.msc` → **MongoDB Server** → **Iniciar** (paso 1) |
| `ECONNREFUSED ::1:27017` | El `.env` dice `localhost` | Usa `127.0.0.1`, como en `.env.ejemplo` |
| `Error: listen EADDRINUSE: address already in use :::3000` | El servicio ya está corriendo en otra terminal | Ciérralo con `Ctrl + C` en esa terminal |
| 503 `SERVICIO_NO_DISPONIBLE` | Ni la API falsa ni el servicio de cuentas están encendidos | Arranca la API falsa (paso 6) |
| En Compass no aparece `gymrutine` | La lista no se actualizó, o el servicio no arrancó | Pulsa ⟳ y revisa que la terminal diga "Conectado a MongoDB" |

---

_Última actualización: 2026-09-21_
