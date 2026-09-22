# Contrato de API — GymRutine

**Versión:** 2.1
**Fecha:** 2026-09-21
**Lo implementan:** el servicio de cuentas (Spring Boot) y el servicio de entrenamiento (Node.js)
**Lo consumen:** el frontend y la colección de Postman

Es el acuerdo entre el frontend y el backend: qué endpoints existen, qué reciben, qué devuelven y cómo responden cuando algo sale mal. Permite que las pantallas y la API se construyan en paralelo sin esperarse.

**Si el código y este documento no coinciden, manda el contrato.** O se corrige el código, o se cambia el contrato acordándolo entre los tres y anotándolo en el historial (§13).

## 1. Convenciones

| Tema | Regla |
|---|---|
| Servicios | **Cuentas** (Spring Boot, `http://localhost:8080/api`): autenticación, usuarios, referencias, ejercicios y rutinas. **Entrenamiento** (Node.js, `http://localhost:3000/api`): sesiones, récords, progreso y peso corporal. La columna *Servicio* de §2 dice cuál atiende cada endpoint |
| Desde el frontend | Siempre la ruta relativa `/api/...`: el proxy de Vite la manda al servicio que corresponde |
| Formato | JSON en UTF-8 (`Content-Type: application/json`) |
| Nombres de campos | En español y `camelCase`: `fechaInicio`, `pesoKg` |
| Fechas | `fecha`: `AAAA-MM-DD`. Fecha y hora: `AAAA-MM-DDTHH:mm:ss`, en hora local de Colombia y sin zona horaria |
| Pesos | Número en kilogramos, máximo 2 decimales: `57.5` |
| Identificadores | Enteros en el servicio de cuentas (`7`). Texto en el de entrenamiento: el `ObjectId` de MongoDB, de 24 caracteres (`"66f1c0a2e4b0a1b2c3d4e5f6"`) |
| Autenticación | Los endpoints marcados con 🔒 exigen la cabecera `Authorization: Bearer <token>`, en los dos servicios. El token lo emite el servicio de cuentas |
| Enumerados | Viajan como código (`PERDIDA_PESO`). El nombre visible sale de `GET /referencias` |
| Consultas sin resultados | Responden 200 con una lista vacía, no 404 |
| Recursos de otro usuario | Responden igual que un recurso inexistente: 404 |

## 2. Resumen de endpoints

| Método | Endpoint | Descripción | Servicio | Auth | Historia |
|---|---|---|---|---|---|
| POST | `/auth/registro` | Crea la cuenta y devuelve un token | Cuentas | Pública | H1 |
| POST | `/auth/login` | Inicia sesión y devuelve un token | Cuentas | Pública | H2 |
| POST | `/auth/logout` | Invalida el token | Cuentas | 🔒 | H3 |
| GET | `/usuarios/me` | Perfil del usuario autenticado. También lo usa el servicio de entrenamiento para validar el token | Cuentas | 🔒 | H4 |
| PUT | `/usuarios/me` | Cambia nombre y objetivo | Cuentas | 🔒 | H4 |
| GET | `/referencias` | Objetivos, grupos musculares y equipos | Cuentas | Pública | H1, H5, H10 |
| GET | `/ejercicios` | Catálogo visible, con filtros | Cuentas | 🔒 | H5 |
| GET | `/ejercicios/{id}` | Detalle de un ejercicio | Cuentas | 🔒 | H6 |
| POST | `/ejercicios` | Crea un ejercicio propio | Cuentas | 🔒 | H7 |
| PUT | `/ejercicios/{id}` | Edita un ejercicio propio | Cuentas | 🔒 | H8 |
| DELETE | `/ejercicios/{id}` | Elimina (borrado lógico) un ejercicio propio | Cuentas | 🔒 | H9 |
| GET | `/rutinas` | Mis rutinas activas | Cuentas | 🔒 | H11 |
| GET | `/rutinas/{id}` | Detalle de una rutina con sus ejercicios | Cuentas | 🔒 | H11 |
| POST | `/rutinas` | Crea una rutina | Cuentas | 🔒 | H10 |
| PUT | `/rutinas/{id}` | Reemplaza una rutina completa | Cuentas | 🔒 | H12 |
| DELETE | `/rutinas/{id}` | Elimina (borrado lógico) una rutina | Cuentas | 🔒 | H13 |
| POST | `/sesiones` | Registra una sesión y recalcula récords | Entrenamiento | 🔒 | H14, H18 |
| GET | `/sesiones` | Historial de sesiones | Entrenamiento | 🔒 | H15 |
| GET | `/sesiones/{id}` | Detalle de una sesión | Entrenamiento | 🔒 | H16 |
| GET | `/sesiones/ultimos-registros?rutinaId={id}` | Lo que se hizo la última vez en cada ejercicio de la rutina | Entrenamiento | 🔒 | H14 |
| PUT | `/sesiones/{id}` | Corrige la fecha, la duración y las series de una sesión, y recalcula récords | Entrenamiento | 🔒 | H23, H18 |
| DELETE | `/sesiones/{id}` | Elimina una sesión y recalcula récords | Entrenamiento | 🔒 | H17, H18 |
| GET | `/records` | Récord vigente de cada ejercicio | Entrenamiento | 🔒 | H19 |
| GET | `/progreso/ejercicios` | Ejercicios que el usuario ha registrado | Entrenamiento | 🔒 | H20 |
| GET | `/progreso/ejercicios/{id}` | Evolución de un ejercicio sesión a sesión | Entrenamiento | 🔒 | H20 |
| GET | `/peso-corporal` | Registros de peso corporal | Entrenamiento | 🔒 | H22 |
| POST | `/peso-corporal` | Registra el peso de una fecha | Entrenamiento | 🔒 | H21 |
| PUT | `/peso-corporal/{id}` | Corrige la fecha o el peso de un registro | Entrenamiento | 🔒 | H24 |
| DELETE | `/peso-corporal/{id}` | Elimina un registro de peso | Entrenamiento | 🔒 | H22 |

## 3. Autenticación y perfil

### POST /auth/registro

```json
{
  "nombre": "Ana Gómez",
  "email": "ana@correo.com",
  "contrasena": "clave-segura-1",
  "objetivo": "FUERZA"
}
```

| Campo | Regla |
|---|---|
| `nombre` | Requerido, 2 a 80 caracteres |
| `email` | Requerido, formato de email, máximo 120. Se guarda en minúsculas |
| `contrasena` | Requerida, 8 a 72 caracteres y máximo 72 bytes (una tilde ocupa 2 bytes; es el límite de BCrypt) |
| `objetivo` | Requerido, un código de objetivo |

→ **201** con la sesión iniciada:

```json
{
  "token": "3f6c1e0a-8a4b-4c1e-9d2f-7b5a1c9e2d41",
  "expiraEn": "2026-09-21T18:30:00",
  "usuario": {
    "id": 7,
    "nombre": "Ana Gómez",
    "email": "ana@correo.com",
    "objetivo": "FUERZA",
    "fechaRegistro": "2026-09-14T18:30:00"
  }
}
```

→ **400** `VALIDACION_FALLIDA` · **409** `EMAIL_YA_REGISTRADO` (sin importar mayúsculas)

### POST /auth/login

```json
{ "email": "ana@correo.com", "contrasena": "clave-segura-1" }
```

→ **200** con el mismo cuerpo que el registro
→ **400** `VALIDACION_FALLIDA` si falta un campo
→ **401** `CREDENCIALES_INVALIDAS`, con el mismo mensaje tanto si el email no existe como si la contraseña no coincide, para no revelar qué emails están registrados

### POST /auth/logout 🔒

Sin cuerpo. → **204** (el token deja de funcionar) · **401** `NO_AUTENTICADO`

### GET /usuarios/me 🔒

→ **200** con el objeto `usuario` del registro · **401**

### PUT /usuarios/me 🔒

```json
{ "nombre": "Ana María Gómez", "objetivo": "RESISTENCIA" }
```

Mismas reglas que en el registro. El email y la contraseña no se cambian en esta versión.
→ **200** con el usuario actualizado · **400** · **401**

### Reglas del token

- Vence **7 días** después de emitido.
- Si falta, no existe o está vencido, cualquier endpoint 🔒 responde **401** `NO_AUTENTICADO`.
- Ante un 401, el frontend borra el token guardado y lleva al usuario a `/login`.

## 4. Referencias

### GET /referencias

Pública, porque el formulario de registro la necesita antes de iniciar sesión.

→ **200**

```json
{
  "objetivos": [
    { "codigo": "FUERZA", "nombre": "Fuerza", "descripcion": "Pocas repeticiones con cargas altas", "seriesSugeridas": 4, "repeticionesSugeridas": 5 },
    { "codigo": "PERDIDA_PESO", "nombre": "Pérdida de peso", "descripcion": "Repeticiones moderadas y descansos cortos", "seriesSugeridas": 3, "repeticionesSugeridas": 12 },
    { "codigo": "RESISTENCIA", "nombre": "Resistencia", "descripcion": "Muchas repeticiones con cargas moderadas", "seriesSugeridas": 3, "repeticionesSugeridas": 15 }
  ],
  "gruposMusculares": [
    { "codigo": "PECHO", "nombre": "Pecho" },
    { "codigo": "ESPALDA", "nombre": "Espalda" },
    { "codigo": "HOMBROS", "nombre": "Hombros" },
    { "codigo": "BICEPS", "nombre": "Bíceps" },
    { "codigo": "TRICEPS", "nombre": "Tríceps" },
    { "codigo": "PIERNAS", "nombre": "Piernas" },
    { "codigo": "GLUTEOS", "nombre": "Glúteos" },
    { "codigo": "ABDOMEN", "nombre": "Abdomen" }
  ],
  "equipos": [
    { "codigo": "BARRA", "nombre": "Barra" },
    { "codigo": "MANCUERNAS", "nombre": "Mancuernas" },
    { "codigo": "MAQUINA", "nombre": "Máquina" },
    { "codigo": "POLEA", "nombre": "Polea" },
    { "codigo": "PESO_CORPORAL", "nombre": "Peso corporal" },
    { "codigo": "OTRO", "nombre": "Otro" }
  ]
}
```

## 5. Ejercicios

### Modelo Ejercicio

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | entero | |
| `nombre` | texto | 3 a 80 caracteres |
| `grupoMuscular` | código | |
| `equipo` | código | |
| `objetivos` | lista de códigos | 1 a 3, sin repetir |
| `descripcion` | texto o `null` | Máximo 500 caracteres |
| `propio` | booleano | `true` si es del usuario (editable); `false` si es del catálogo base |
| `activo` | booleano | `false` si el usuario lo eliminó |

```json
{
  "id": 1,
  "nombre": "Press de banca con barra",
  "grupoMuscular": "PECHO",
  "equipo": "BARRA",
  "objetivos": ["FUERZA"],
  "descripcion": "Baja la barra al pecho con control y empuja hasta extender los brazos.",
  "propio": false,
  "activo": true
}
```

### GET /ejercicios 🔒

Ejercicios **visibles y activos**: el catálogo base y los propios del usuario, ordenados por nombre.

| Parámetro | Por defecto | Regla |
|---|---|---|
| `grupoMuscular` | todos | Un código de grupo muscular |
| `equipo` | todos | Un código de equipo |
| `objetivo` | todos | Solo los recomendados para ese objetivo |
| `soloPropios` | `false` | `true` para ver únicamente los ejercicios propios |

Ejemplo: `GET /ejercicios?grupoMuscular=PECHO&objetivo=FUERZA`

→ **200** con una lista de Ejercicio (vacía si ninguno cumple el filtro) · **400** si un código no existe

### GET /ejercicios/{id} 🔒

→ **200** con el Ejercicio. Un ejercicio propio eliminado también se devuelve, con `activo: false`, para poder mostrarlo en el historial.
→ **404** `EJERCICIO_NO_ENCONTRADO` si no existe o es propio de otro usuario

### POST /ejercicios 🔒

```json
{
  "nombre": "Press en máquina Smith",
  "grupoMuscular": "PECHO",
  "equipo": "MAQUINA",
  "objetivos": ["FUERZA", "PERDIDA_PESO"],
  "descripcion": null
}
```

Reglas del modelo Ejercicio. `id`, `propio` y `activo` los asigna el servidor; si llegan en el cuerpo, se ignoran.

→ **201** con el Ejercicio creado (`propio: true`, `activo: true`)
→ **400** `VALIDACION_FALLIDA`
→ **409** `EJERCICIO_DUPLICADO` si ya existe un ejercicio base o uno propio activo con ese nombre, sin importar mayúsculas

### PUT /ejercicios/{id} 🔒

Reemplaza el ejercicio completo: el cuerpo lleva todos los campos, con las mismas reglas que `POST`.

→ **200** · **400** · **403** `EJERCICIO_NO_EDITABLE` si es del catálogo base · **404** si no existe, es de otro usuario o está eliminado · **409** `EJERCICIO_DUPLICADO`

### DELETE /ejercicios/{id} 🔒

Borrado lógico (`activo: false`).

- Deja de aparecer en `GET /ejercicios` y no se puede agregar a rutinas ni registrar en sesiones nuevas.
- Sigue apareciendo en las rutinas que ya lo tenían (con `activo: false`) y en el historial.
- Si ya estaba eliminado, responde 204 sin cambiar nada.

→ **204** · **403** `EJERCICIO_NO_EDITABLE` · **404** `EJERCICIO_NO_ENCONTRADO`

## 6. Rutinas

### GET /rutinas 🔒

Rutinas activas del usuario, ordenadas por nombre.

→ **200**

```json
[
  {
    "id": 3,
    "nombre": "Pecho y tríceps",
    "objetivo": "FUERZA",
    "cantidadEjercicios": 2
  }
]
```

La última vez que se entrenó cada rutina no viene aquí, porque las sesiones viven en el servicio de entrenamiento: la pantalla la obtiene de `GET /sesiones`.

### GET /rutinas/{id} 🔒

→ **200**

```json
{
  "id": 3,
  "nombre": "Pecho y tríceps",
  "objetivo": "FUERZA",
  "activa": true,
  "ejercicios": [
    {
      "orden": 1,
      "ejercicio": { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO", "equipo": "BARRA", "activo": true },
      "seriesObjetivo": 4,
      "repeticionesObjetivo": 5
    },
    {
      "orden": 2,
      "ejercicio": { "id": 23, "nombre": "Extensión de tríceps en polea", "grupoMuscular": "TRICEPS", "equipo": "POLEA", "activo": true },
      "seriesObjetivo": 3,
      "repeticionesObjetivo": 10
    }
  ]
}
```

Una rutina eliminada también se devuelve, con `activa: false`, para que el historial pueda mostrar su nombre.
→ **404** `RUTINA_NO_ENCONTRADA` si no existe o es de otro usuario

### POST /rutinas 🔒

```json
{
  "nombre": "Pecho y tríceps",
  "objetivo": "FUERZA",
  "ejercicios": [
    { "ejercicioId": 1, "seriesObjetivo": 4, "repeticionesObjetivo": 5 },
    { "ejercicioId": 23, "seriesObjetivo": 3, "repeticionesObjetivo": 10 }
  ]
}
```

| Campo | Regla |
|---|---|
| `nombre` | Requerido, 3 a 80 caracteres |
| `objetivo` | Requerido, un código de objetivo |
| `ejercicios` | 1 a 15 elementos, sin repetir `ejercicioId` |
| `ejercicios[].ejercicioId` | Un ejercicio visible para el usuario y activo |
| `ejercicios[].seriesObjetivo` | Requerido, 1 a 10 |
| `ejercicios[].repeticionesObjetivo` | Requerido, 1 a 50 |

- El `orden` de cada ejercicio es su posición en el arreglo (1, 2, 3…).
- Un `ejercicioId` inexistente, ajeno o eliminado es un error del cuerpo: **400**, no 404.

→ **201** con el detalle de la rutina · **400** `VALIDACION_FALLIDA`

### PUT /rutinas/{id} 🔒

Reemplaza nombre, objetivo y **la lista completa** de ejercicios, con las mismas reglas que `POST`. Las sesiones ya registradas con la rutina no cambian.

→ **200** · **400** · **404** `RUTINA_NO_ENCONTRADA` si no existe, es de otro usuario o está eliminada

### DELETE /rutinas/{id} 🔒

Borrado lógico (`activa: false`). La rutina deja de listarse, no se puede editar (404) ni entrenar (400 en `POST /sesiones`), y sus sesiones siguen en el historial. Si ya estaba eliminada, responde 204 sin cambiar nada.

→ **204** · **404** `RUTINA_NO_ENCONTRADA`

## 7. Sesiones de entrenamiento

### POST /sesiones 🔒

```json
{
  "rutinaId": 3,
  "fechaInicio": "2026-09-14T18:30:00",
  "duracionMinutos": 55,
  "registros": [
    {
      "ejercicioId": 1,
      "series": [
        { "pesoKg": 55, "repeticiones": 5 },
        { "pesoKg": 57.5, "repeticiones": 5 },
        { "pesoKg": 60, "repeticiones": 5 },
        { "pesoKg": 62.5, "repeticiones": 4 }
      ]
    },
    {
      "ejercicioId": 23,
      "series": [
        { "pesoKg": 25, "repeticiones": 12 },
        { "pesoKg": 27.5, "repeticiones": 10 },
        { "pesoKg": 27.5, "repeticiones": 9 }
      ]
    }
  ]
}
```

| Campo | Regla |
|---|---|
| `rutinaId` | Requerido. Rutina del usuario y activa |
| `fechaInicio` | Requerida. No puede ser futura |
| `duracionMinutos` | Requerida, 1 a 600 |
| `registros` | 1 a 15 elementos |
| `registros[].ejercicioId` | Pertenece a la rutina, está activo y no se repite |
| `registros[].series` | 1 a 20 elementos |
| `series[].pesoKg` | Requerido, 0 a 500, máximo 2 decimales |
| `series[].repeticiones` | Requerido, 1 a 100 |

- `orden` y `numero` los asigna el servidor según la posición en los arreglos.
- `esRecord` no se envía: lo calcula el servidor con la regla R6 de [MODELO-DATOS.md](MODELO-DATOS.md) §7.1. Si llega, se ignora.
- Los ejercicios de la rutina que no vienen en `registros` se consideran no realizados.
- La rutina se consulta al servicio de cuentas con el token del usuario: si no existe, es de otro usuario o está eliminada, la sesión se rechaza con 400.
- Después de guardar la sesión se recalculan los récords de sus ejercicios. MongoDB en local no tiene transacciones: el recálculo es idempotente ([MODELO-DATOS.md](MODELO-DATOS.md) §7.1).

→ **201** con el detalle de la sesión · **400** `VALIDACION_FALLIDA` · **503** `SERVICIO_NO_DISPONIBLE` si el servicio de cuentas no responde

### Modelo SesionDetalle

```json
{
  "id": "66f1c0a2e4b0a1b2c3d4e5f6",
  "rutina": { "id": 3, "nombre": "Pecho y tríceps" },
  "fechaInicio": "2026-09-14T18:30:00",
  "duracionMinutos": 55,
  "resumen": {
    "ejercicios": 2,
    "series": 7,
    "repeticiones": 50,
    "volumenKg": 1935.0,
    "records": 1
  },
  "registros": [
    {
      "orden": 1,
      "ejercicio": { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO" },
      "volumenKg": 1112.5,
      "series": [
        { "numero": 1, "pesoKg": 55.0, "repeticiones": 5, "esRecord": false },
        { "numero": 2, "pesoKg": 57.5, "repeticiones": 5, "esRecord": false },
        { "numero": 3, "pesoKg": 60.0, "repeticiones": 5, "esRecord": false },
        { "numero": 4, "pesoKg": 62.5, "repeticiones": 4, "esRecord": true }
      ]
    },
    {
      "orden": 2,
      "ejercicio": { "id": 23, "nombre": "Extensión de tríceps en polea", "grupoMuscular": "TRICEPS" },
      "volumenKg": 822.5,
      "series": [
        { "numero": 1, "pesoKg": 25.0, "repeticiones": 12, "esRecord": false },
        { "numero": 2, "pesoKg": 27.5, "repeticiones": 10, "esRecord": false },
        { "numero": 3, "pesoKg": 27.5, "repeticiones": 9, "esRecord": false }
      ]
    }
  ]
}
```

| Campo de `resumen` | Cómo se calcula |
|---|---|
| `ejercicios` | Cantidad de ejercicios registrados |
| `series` | Cantidad de series |
| `repeticiones` | Suma de las repeticiones |
| `volumenKg` | Suma de `pesoKg × repeticiones` de todas las series |
| `records` | Cantidad de series con `esRecord: true` en este momento (puede cambiar si se registra, edita o elimina otra sesión) |

En el ejemplo, la extensión de tríceps no tiene récord porque 27,5 kg ya era el máximo de una sesión anterior: empatar no cuenta.

### GET /sesiones 🔒

Historial del usuario, de la sesión más reciente a la más antigua (por `fechaInicio`).

→ **200**

```json
[
  {
    "id": "66f1c0a2e4b0a1b2c3d4e5f6",
    "rutina": { "id": 3, "nombre": "Pecho y tríceps" },
    "fechaInicio": "2026-09-14T18:30:00",
    "duracionMinutos": 55,
    "resumen": { "ejercicios": 2, "series": 7, "repeticiones": 50, "volumenKg": 1935.0, "records": 1 }
  }
]
```

### GET /sesiones/{id} 🔒

→ **200** con SesionDetalle · **404** `SESION_NO_ENCONTRADA` si no existe o es de otro usuario

### GET /sesiones/ultimos-registros?rutinaId={id} 🔒

Datos para prellenar la pantalla de entrenamiento. El servicio de entrenamiento pide la rutina al de cuentas, con el token del usuario, y devuelve un elemento por cada ejercicio de la rutina, en el mismo orden.

→ **200**

```json
[
  {
    "ejercicioId": 1,
    "recordKg": 60.0,
    "fechaInicio": "2026-09-10T18:00:00",
    "series": [
      { "numero": 1, "pesoKg": 55.0, "repeticiones": 5 },
      { "numero": 2, "pesoKg": 57.5, "repeticiones": 5 },
      { "numero": 3, "pesoKg": 60.0, "repeticiones": 5 },
      { "numero": 4, "pesoKg": 60.0, "repeticiones": 5 }
    ]
  },
  {
    "ejercicioId": 23,
    "recordKg": 27.5,
    "fechaInicio": "2026-09-10T18:00:00",
    "series": [
      { "numero": 1, "pesoKg": 25.0, "repeticiones": 12 },
      { "numero": 2, "pesoKg": 27.5, "repeticiones": 10 },
      { "numero": 3, "pesoKg": 27.5, "repeticiones": 8 }
    ]
  }
]
```

- **La última vez** es la sesión más reciente del usuario, por `fechaInicio`, que incluyó ese ejercicio, **en cualquier rutina**.
- `recordKg` es el peso del récord vigente, o `null` si no hay ninguno.
- Si el ejercicio nunca se ha registrado: `fechaInicio: null` y `series: []`.

→ **404** `RUTINA_NO_ENCONTRADA` si la rutina no existe o es de otro usuario · **503** `SERVICIO_NO_DISPONIBLE`

### PUT /sesiones/{id} 🔒

Corrige una sesión ya registrada: su fecha, su duración y las series de sus ejercicios. Reemplaza la sesión completa, así que el cuerpo lleva **todas** las series, no solo las que cambian.

```json
{
  "fechaInicio": "2026-09-14T18:30:00",
  "duracionMinutos": 55,
  "registros": [
    {
      "ejercicioId": 1,
      "series": [
        { "pesoKg": 55, "repeticiones": 5 },
        { "pesoKg": 57.5, "repeticiones": 5 },
        { "pesoKg": 60, "repeticiones": 5 },
        { "pesoKg": 60, "repeticiones": 4 }
      ]
    },
    {
      "ejercicioId": 23,
      "series": [
        { "pesoKg": 25, "repeticiones": 12 },
        { "pesoKg": 27.5, "repeticiones": 10 }
      ]
    }
  ]
}
```

| Campo | Regla |
|---|---|
| `fechaInicio` | Requerida. No puede ser futura |
| `duracionMinutos` | Requerida, 1 a 600 |
| `registros` | Exactamente los mismos ejercicios que ya tiene la sesión, cada uno una vez y en cualquier orden: no se agregan ni se quitan |
| `registros[].series` | 1 a 20 elementos |
| `series[].pesoKg` | Requerido, 0 a 500, máximo 2 decimales |
| `series[].repeticiones` | Requerido, 1 a 100 |

- La rutina no cambia y **no se consulta al servicio de cuentas:** la sesión conserva su copia de los nombres, aunque la rutina o un ejercicio se hayan eliminado después.
- `orden` se conserva; `numero` lo asigna el servidor según la posición en el arreglo. `esRecord` no se envía: si llega, se ignora.
- Después de guardar se recalculan los récords de los ejercicios de la sesión (R6): si cambiaron la fecha o los pesos, otra sesión puede ganar o perder un récord.

→ **200** con el detalle de la sesión (SesionDetalle) · **400** `VALIDACION_FALLIDA` (por ejemplo, si falta o sobra un ejercicio) · **404** `SESION_NO_ENCONTRADA` si no existe o es de otro usuario

### DELETE /sesiones/{id} 🔒

Borrado físico del documento de la sesión, con sus registros y series. Después se recalculan los récords de cada ejercicio que tenía. Como el borrado es físico, repetir la petición responde 404.

→ **204** · **404** `SESION_NO_ENCONTRADA`

## 8. Récords y progreso

### GET /records 🔒

El récord vigente de cada ejercicio: la serie marcada como récord con el mayor peso. Ordenados por nombre del ejercicio; la pantalla los agrupa por grupo muscular en el orden de `GET /referencias`. Los ejercicios registrados solo con 0 kg no aparecen.

→ **200**

```json
[
  {
    "ejercicio": { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO" },
    "pesoKg": 62.5,
    "repeticiones": 4,
    "fechaInicio": "2026-09-14T18:30:00",
    "sesionId": "66f1c0a2e4b0a1b2c3d4e5f6"
  }
]
```

### GET /progreso/ejercicios 🔒

Ejercicios que el usuario ha registrado al menos una vez, incluidos los propios que después eliminó. Sirve para el selector de la pantalla de progreso. Ordenados por nombre.

→ **200**

```json
[
  { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO", "sesiones": 3 }
]
```

### GET /progreso/ejercicios/{id} 🔒

Un punto por cada sesión en la que se hizo el ejercicio, en orden cronológico. Es lo que dibuja la gráfica.

→ **200**

```json
{
  "ejercicio": { "id": 1, "nombre": "Press de banca con barra", "grupoMuscular": "PECHO" },
  "puntos": [
    { "sesionId": "66ed9a10e4b0a1b2c3d4e5a1", "fechaInicio": "2026-09-07T18:10:00", "pesoMaximoKg": 60.0, "volumenKg": 1100.0, "esRecord": true },
    { "sesionId": "66f0b1c4e4b0a1b2c3d4e5b2", "fechaInicio": "2026-09-10T18:00:00", "pesoMaximoKg": 60.0, "volumenKg": 1162.5, "esRecord": false },
    { "sesionId": "66f1c0a2e4b0a1b2c3d4e5f6", "fechaInicio": "2026-09-14T18:30:00", "pesoMaximoKg": 62.5, "volumenKg": 1112.5, "esRecord": true }
  ]
}
```

- `pesoMaximoKg`: el mayor peso del ejercicio en esa sesión.
- `volumenKg`: suma de `pesoKg × repeticiones` del ejercicio en esa sesión.
- `esRecord`: `true` si alguna serie del ejercicio en esa sesión es récord.
- El nombre y el grupo del ejercicio salen de la copia guardada en las sesiones.

→ **404** `EJERCICIO_NO_ENCONTRADO` si el usuario no tiene registros de ese ejercicio (el selector solo ofrece ejercicios con historial)

## 9. Peso corporal

### GET /peso-corporal 🔒

Registros del usuario en orden cronológico (del más antiguo al más reciente).

→ **200**

```json
[
  { "id": "66e0a1f2e4b0a1b2c3d4e501", "fecha": "2026-08-31", "pesoKg": 78.2 },
  { "id": "66e8b3a4e4b0a1b2c3d4e502", "fecha": "2026-09-07", "pesoKg": 78.4 },
  { "id": "66f1c3b8e4b0a1b2c3d4e601", "fecha": "2026-09-14", "pesoKg": 77.9 }
]
```

### POST /peso-corporal 🔒

```json
{ "fecha": "2026-09-14", "pesoKg": 77.9 }
```

| Campo | Regla |
|---|---|
| `fecha` | Requerida. No puede ser futura |
| `pesoKg` | Requerido, 20 a 350, máximo 2 decimales |

→ **201** con el registro creado · **400** `VALIDACION_FALLIDA` · **409** `PESO_YA_REGISTRADO` si ya hay un registro en esa fecha

### PUT /peso-corporal/{id} 🔒

Corrige un registro: reemplaza su fecha y su peso. El cuerpo y las reglas son los mismos que en `POST`.

```json
{ "fecha": "2026-09-14", "pesoKg": 77.6 }
```

→ **200** con el registro corregido · **400** `VALIDACION_FALLIDA` · **404** `REGISTRO_PESO_NO_ENCONTRADO` si no existe o es de otro usuario · **409** `PESO_YA_REGISTRADO` si **otro** registro del usuario ya tiene esa fecha

### DELETE /peso-corporal/{id} 🔒

→ **204** · **404** `REGISTRO_PESO_NO_ENCONTRADO` si no existe o es de otro usuario

## 10. Formato de error

Todos los errores previstos en este contrato responden con este formato:

```json
{
  "codigo": "VALIDACION_FALLIDA",
  "mensaje": "Hay campos con errores",
  "campos": {
    "email": "no tiene un formato válido",
    "registros[0].series[1].pesoKg": "debe estar entre 0 y 500"
  }
}
```

- `codigo` es estable: el frontend decide qué hacer según el código, nunca leyendo el mensaje.
- `mensaje` está en español y se puede mostrar al usuario.
- `campos` solo aparece en `VALIDACION_FALLIDA` cuando el error es de campos concretos. La clave es la ruta del campo, para resaltarlo en el formulario.

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDACION_FALLIDA` | 400 | Cuerpo o parámetros inválidos, JSON mal formado, referencias inválidas dentro del cuerpo |
| `NO_AUTENTICADO` | 401 | Falta el token, no existe o está vencido |
| `CREDENCIALES_INVALIDAS` | 401 | Email o contraseña incorrectos al iniciar sesión |
| `EJERCICIO_NO_EDITABLE` | 403 | Se intenta editar o eliminar un ejercicio del catálogo base |
| `EJERCICIO_NO_ENCONTRADO` | 404 | El ejercicio no existe o es propio de otro usuario |
| `RUTINA_NO_ENCONTRADA` | 404 | La rutina no existe, es de otro usuario o (al editar) está eliminada |
| `SESION_NO_ENCONTRADA` | 404 | La sesión no existe o es de otro usuario |
| `REGISTRO_PESO_NO_ENCONTRADO` | 404 | El registro de peso no existe o es de otro usuario |
| `EMAIL_YA_REGISTRADO` | 409 | Ya hay una cuenta con ese email |
| `EJERCICIO_DUPLICADO` | 409 | Ya existe un ejercicio visible con ese nombre |
| `PESO_YA_REGISTRADO` | 409 | Ya hay un registro de peso en esa fecha |
| `SERVICIO_NO_DISPONIBLE` | 503 | El servicio de entrenamiento no pudo comunicarse con el de cuentas |

Los errores no previstos (una falla interna o una ruta que no existe) usan el formato por defecto de cada servicio. El frontend los muestra como un error genérico. Los errores previstos, en cambio, llegan con este mismo formato desde los dos servicios.

## 11. Pantallas y endpoints

Qué consume cada pantalla del [mockup](mockup/README.md), con su ruta en el frontend.

| Pantalla | Ruta del frontend | Endpoints |
|---|---|---|
| P1 Iniciar sesión | `/login` | `POST /auth/login` |
| P2 Crear cuenta | `/registro` | `GET /referencias`, `POST /auth/registro` |
| P3 Inicio | `/` | `GET /rutinas`, `GET /sesiones`, `GET /records`, `GET /peso-corporal` |
| P4 Catálogo de ejercicios | `/ejercicios` | `GET /referencias`, `GET /ejercicios`, `GET /ejercicios/{id}`, `POST`, `PUT` y `DELETE /ejercicios` |
| P5 Mis rutinas | `/rutinas` | `GET /rutinas`, `DELETE /rutinas/{id}` y `GET /sesiones` (para la última vez de cada rutina) |
| P6 Constructor de rutina | `/rutinas/nueva`, `/rutinas/:id/editar` | `GET /referencias`, `GET /ejercicios`, `GET /rutinas/{id}`, `POST /rutinas`, `PUT /rutinas/{id}` |
| P7 Entrenar | `/rutinas/:id/entrenar` | `GET /rutinas/{id}`, `GET /sesiones/ultimos-registros?rutinaId=`, `POST /sesiones` |
| P8 Resumen de la sesión | `/rutinas/:id/entrenar` (al guardar) | Respuesta de `POST /sesiones` (sin peticiones nuevas) |
| P9 Historial | `/historial` | `GET /sesiones` |
| P10 Detalle de sesión | `/historial/:id` | `GET /sesiones/{id}`, `PUT /sesiones/{id}` (al editar), `DELETE /sesiones/{id}` |
| P11 Progreso por ejercicio | `/progreso` | `GET /progreso/ejercicios`, `GET /progreso/ejercicios/{id}` |
| P12 Récords | `/progreso/records` | `GET /records`, `GET /referencias` (para agrupar) |
| P13 Peso corporal | `/progreso/peso` | `GET /peso-corporal`, `POST /peso-corporal`, `PUT /peso-corporal/{id}`, `DELETE /peso-corporal/{id}` |
| P14 Perfil | `/perfil` | `GET /usuarios/me`, `PUT /usuarios/me`, `GET /referencias`, `POST /auth/logout` |

## 12. Fuera de alcance en esta versión

- Recuperar o cambiar la contraseña, cambiar el email o eliminar la cuenta.
- Agregar o quitar ejercicios de una sesión ya registrada: se elimina y se registra de nuevo.
- Agregar a una sesión ejercicios que no están en la rutina.
- Ejercicios que se miden por tiempo o distancia (plancha, cinta, bicicleta).
- Paginación: los volúmenes esperados por usuario son pequeños.
- Unidades en libras.
- Administración del catálogo base desde la app.

## 13. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-09-14 | v1.0: versión inicial |
| 2026-09-15 | v1.1: sin CORS, porque el frontend usa el proxy de Vite; §11 con la ruta de cada pantalla en React. Ningún endpoint cambia |
| 2026-09-21 | v2.0: dos servicios. Columna *Servicio* en §2; ids de texto en el servicio de entrenamiento; `GET /rutinas/{id}/ultimos-registros` pasa a `GET /sesiones/ultimos-registros?rutinaId=`; `GET /rutinas` ya no trae `ultimaSesion`; la sesión guarda copia de los nombres (sin `activa` ni `activo`); `GET /records` se ordena por nombre; progreso responde 404 sin registros; nuevo error `SERVICIO_NO_DISPONIBLE` (503) |
| 2026-09-21 | v2.1: un CRUD completo por integrante, como pide el curso: nuevos `PUT /sesiones/{id}` (H23) y `PUT /peso-corporal/{id}` (H24). Editar una sesión sale de §12. Quedan 29 endpoints |
