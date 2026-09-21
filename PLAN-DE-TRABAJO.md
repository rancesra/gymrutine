# Plan de trabajo — GymRutine

Qué le toca a cada integrante, en qué orden, qué necesita y cómo saber que terminó. **Cubre el proyecto completo: la entrega final es el sábado 3 de octubre de 2026**, con una entrega intermedia el **martes 22 de septiembre (login y base de datos)**.

Como el curso ya dio todas las clases, el proyecto deja de ir por cortes: se construye **una sola aplicación que usa todas las tecnologías del curso** (Spring Boot, JPA, MySQL, Node.js, Express, MongoDB, React, Maven, Postman, Git y Scrum). La arquitectura está en [ARQUITECTURA.md](docs/ARQUITECTURA.md).

**Orden de lectura para empezar:**

1. [Guía de inicio](GUIA-INICIO.md): instalar las herramientas, crear las bases de datos y clonar el repo.
2. Este plan: qué te toca, en qué sprint y en qué rama.
3. [Guía de git](GUIA-GIT.md): cómo trabajar día a día (pull, commits, push, pull requests y conflictos).
4. La guía paso a paso de tu primera tarea, con el código ya probado: [T2](docs/guias/T2-FRONTEND.md) (Javier) o [T3](docs/guias/T3-NODE.md) (Santiago).

**Las fuentes de verdad son el [contrato de API](docs/CONTRATO-API.md) y el [modelo de datos](docs/MODELO-DATOS.md).** Si algo de este plan los contradice, mandan ellos. Se cambian solo si lo acordamos los tres, y primero en el documento y después en el código.

## Fechas clave

| Fecha | Qué pasa |
|---|---|
| Lun 21 sep | Arranque: planeación, instalación y base de los tres proyectos |
| **Mar 22 sep** | **Entrega 1: login y base de datos** |
| Sáb 26 sep | Hito: catálogo, rutinas y API de entrenamiento listos |
| Mié 30 sep | Hito: entrenar, historial, récords y peso de punta a punta |
| Jue 1 oct | **Congelamiento:** desde aquí no entran funcionalidades nuevas, solo correcciones y pulido |
| Vie 2 oct | Pruebas completas en celular, datos de demostración y ensayo de la sustentación |
| **Sáb 3 oct** | **Entrega final** |

## Quién hace qué

| Integrante | Rol Scrum | Se hace cargo de |
|---|---|---|
| **Rances** | Product Owner y coordinador | **Servicio de cuentas y rutinas** (Spring Boot + MySQL): base y autenticación. **Peso corporal** (API en Node y pantalla). Pantallas de perfil, inicio y récords. Integración, Postman, datos de demostración y entrega |
| **Javier** | Scrum Master en los sprints 1 y 3 | **Frontend** (React): base, login y registro. **Catálogo y rutinas** de punta a punta (API en Spring y pantallas). Pantalla de progreso |
| **Santiago** | Scrum Master en los sprints 2 y 4 | **Servicio de entrenamiento** (Node + Express + MongoDB): base, sesiones, récords y progreso. Pantallas de entrenar, resumen, historial y detalle de sesión |

Cada uno trabaja de punta a punta en sus funcionalidades: los tres tocan backend y frontend, y cualquiera puede explicar cualquier parte en la sustentación.

## Resumen de tareas

| Tarea | Responsable | Sprint | Entrega | Historias | Depende de |
|---|---|---|---|---|---|
| **T0** Documentación y arquitectura | Rances | 1 | Estos documentos | — | — |
| **T1** Base del servicio de cuentas | Rances | 1 | Spring Boot + MySQL: entidades, errores, referencias y catálogo base | — | — |
| **T2** Base del frontend | Javier | 1 | React con Vite: rutas, cliente de la API, sesión y estilos | — | — |
| **T3** Base del servicio de entrenamiento | Santiago | 1 | Node + Express + MongoDB: conexión, modelos, validación del token y errores | — | Nadie; la prueba final del token, T4 API (mientras tanto, API falsa) |
| **T4** Cuenta y perfil | API: Rances · Login y registro: Javier · Perfil: Rances | 1 y 2 | Registro, login, logout, perfil e interceptor | H1–H4 | T1; las pantallas, también T2 |
| **T5** Catálogo de ejercicios | Javier | 2 | API en Spring y pantalla P4 | H5–H9 | T4 API, T2 |
| **T6** Rutinas | Javier | API: 2 · Pantallas: 3 | API en Spring y pantallas P5 y P6 | H10–H13 | T4 API; las pantallas, también T5 |
| **T7** Sesiones de entrenamiento | Santiago | API: 2 · Pantallas: 3 | API en Node y pantallas P7 a P10 | H14–H17 | T3, T6 API, T8 algoritmo |
| **T8** Récords personales | Algoritmo y API: Santiago · Pantalla: Rances | 2 a 4 | Recálculo con pruebas, `GET /records` y pantalla P12 | H18, H19 | T3; la pantalla, también T7 |
| **T9** Progreso por ejercicio | API: Santiago · Pantalla: Javier | 3 y 4 | API en Node y pantalla P11 | H20 | T7 API, T10 (componente de gráfica) |
| **T10** Peso corporal | Rances | API: 2 · Pantalla: 3 | API en Node y pantalla P13 con `GraficaLinea` | H21, H22 | T3, T2 |
| **T11** Inicio, integración y entrega | Rances, con todos | 4 | P3, colección de Postman, datos de demostración, pulido y sustentación | — | Todas |

## Calendario por sprint

| Sprint | Fechas | Objetivo | Rances | Javier | Santiago |
|---|---|---|---|---|---|
| **1** | lun 21 – mar 22 sep | **Login y base de datos** (Entrega 1) | T1 → T4 API de cuenta | T2 → T4 pantallas de login y registro | T3 base de Node y MongoDB |
| **2** | mié 23 – sáb 26 sep | Catálogo, rutinas y API de entrenamiento | T4 perfil (P14) · T10 API de peso | T5 API de catálogo → T6 API de rutinas → T5 pantalla P4 | T8 algoritmo de récords con pruebas → T7 API de sesiones |
| **3** | dom 27 – mié 30 sep | Entrenar de punta a punta | T10 pantalla de peso y `GraficaLinea` · colección de Postman | T6 pantallas de rutinas | T7 pantallas P7 a P10 · T8 API de récords · T9 API de progreso |
| **4** | jue 1 – sáb 3 oct | Progreso, pulido y entrega | T8 pantalla de récords · T11 | T9 pantalla de progreso · pulido en celular | Pruebas de punta a punta y corrección de errores · apoyo en T11 |

**Plan B si alguien se atrasa:** el sprint 4 tiene poco trabajo nuevo a propósito. Si Santiago no alcanza con las pantallas P9 y P10, pasan a Rances; si Javier no alcanza con P11, la pantalla sale primero solo con la tabla y la gráfica se agrega después.

## ¿Quién espera a quién?

**Hoy nadie espera a nadie.** Cada uno empieza por lo que no depende de otros. Cuando una tarea necesita una API que todavía no está en `main`, se avanza contra el [contrato](docs/CONTRATO-API.md) con la [API falsa del servicio de cuentas](docs/guias/api-falsa-cuentas.mjs), y solo la prueba final espera a la API real. Por lo mismo, **las API van antes que las pantallas**: los compañeros las necesitan.

### Hoy, lunes 21: los tres empiezan ya

| Quién | Empieza con | Paso a paso | Para la prueba final necesita | Mientras tanto |
|---|---|---|---|---|
| Rances | T1 y después la API de T4 | Secciones [T1](#t1--base-del-servicio-de-cuentas-spring-boot--mysql) y [T4](#t4--cuenta-y-perfil-historias-1-a-4) de este plan | — | — |
| Javier | T2 y después las pantallas de login y registro | [Guía de T2](docs/guias/T2-FRONTEND.md) | La API de T4 de Rances en `main` | API falsa |
| Santiago | T3 | [Guía de T3](docs/guias/T3-NODE.md) | La API de T4 de Rances en `main` | API falsa |

### Lo que cada uno le entrega a otro

Estas son las únicas esperas entre personas. Si una se va a atrasar, **avísalo en el grupo ese mismo día**: quien está en la última columna tendrá que reorganizarse.

| Debe estar en `main` el | Qué | Lo entrega | A quién desbloquea |
|---|---|---|---|
| **Mar 22 sep** | T1 y la API de cuenta (T4) | Rances | Javier empieza la API de catálogo (T5) el 23. Javier y Santiago hacen la prueba final del login y del token |
| **Mar 22 sep** | T2, base del frontend | Javier | Rances hace el perfil (P14) el 23. Todas las pantallas se construyen sobre ella |
| **Mar 22 sep** | T3, base del servicio de entrenamiento | Santiago | Rances empieza la API de peso (T10) el 24 |
| **Jue 25 sep** | API de rutinas (T6) | Javier | Santiago hace la prueba final de la API de sesiones (T7) y, desde el 27, sus pantallas de entrenar usan rutinas reales |
| **Sáb 26 sep** | API de sesiones (T7) | Santiago | Javier muestra la "última vez" en Mis rutinas (P5) |
| **Lun 28 sep** | `GraficaLinea`, con la pantalla de peso (T10) | Rances | Javier dibuja la gráfica de progreso (P11) el 1 de octubre |
| **Mié 30 sep** | API de récords (T8) y de progreso (T9) | Santiago | Rances hace la pantalla de récords (P12) y Javier la de progreso (P11), el 1 de octubre |
| **Jue 1 oct** | Todo lo anterior | Los tres | Inicio (P3), datos de demostración y entrega (T11) |

### Línea de tiempo

Cada barra es una parte de una tarea. En rojo, la **ruta crítica**: si una de esas partes se atrasa, se atrasa la entrega.

```mermaid
gantt
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    tickInterval 1day

    section Rances
    T1 Base Spring                   :crit, r1, 2026-09-21, 1d
    T4 API de cuenta                 :crit, r2, 2026-09-21, 2d
    T4 Perfil                        :r3, 2026-09-23, 1d
    T10 API de peso                  :r4, 2026-09-24, 2d
    T10 Pantalla de peso y gráfica   :r5, 2026-09-27, 2d
    Colección de Postman             :r6, 2026-09-29, 2d
    T8 Pantalla de récords           :r7, 2026-10-01, 1d
    T11 Inicio, demo y entrega       :crit, r8, 2026-10-01, 3d

    section Javier
    T2 Base React                    :j1, 2026-09-21, 1d
    T4 Login y registro              :j2, 2026-09-21, 2d
    T5 API de catálogo               :crit, j3, 2026-09-23, 2d
    T6 API de rutinas                :crit, j4, 2026-09-25, 1d
    T5 Pantalla de catálogo          :j5, 2026-09-26, 1d
    T6 Pantallas de rutinas          :j6, 2026-09-27, 3d
    T9 Pantalla de progreso          :j7, 2026-10-01, 1d
    Pulido en celular                :j8, 2026-10-02, 1d

    section Santiago
    T3 Base Node                     :s1, 2026-09-21, 2d
    T8 Algoritmo de récords          :s2, 2026-09-23, 1d
    T7 API de sesiones               :crit, s3, 2026-09-24, 3d
    T7 Pantallas de entrenar         :crit, s4, 2026-09-27, 3d
    T8 API de récords                :s5, 2026-09-30, 1d
    T9 API de progreso               :s6, 2026-09-30, 1d
    Pruebas de punta a punta         :s7, 2026-10-01, 2d

    section Hitos
    Entrega 1                        :milestone, m1, 2026-09-22, 0d
    Catálogo y API de entrenamiento  :milestone, m2, 2026-09-26, 0d
    Entrenar de punta a punta        :milestone, m3, 2026-09-30, 0d
    Congelamiento                    :milestone, m4, 2026-10-01, 0d
    Entrega final                    :milestone, m5, 2026-10-03, 0d
```

### Dependencias entre tareas

Cada flecha va de una tarea a la que la necesita. **Flecha continua:** hay que esperar a que esté en `main` para empezar. **Flecha punteada:** se puede empezar antes contra el contrato, con la API falsa; solo la prueba final espera. Todas las pantallas se construyen sobre T2, y las API sobre T1 o T3; esas flechas no se dibujan para que el diagrama se pueda leer. Colores: naranja, Rances; azul, Javier; verde, Santiago.

```mermaid
flowchart TB
    T1["T1 Base Spring<br/>Rances · 21 sep"]
    T2["T2 Base React<br/>Javier · 21 sep"]
    T4A["T4 API de cuenta<br/>Rances · 21 y 22 sep"]
    T4P["T4 Login y registro<br/>Javier · 21 y 22 sep"]
    T3["T3 Base Node<br/>Santiago · 21 y 22 sep"]
    T4F["T4 Perfil<br/>Rances · 23 sep"]
    T5A["T5 API de catálogo<br/>Javier · 23 y 24 sep"]
    T8L["T8 Algoritmo de récords<br/>Santiago · 23 sep"]
    T10A["T10 API de peso<br/>Rances · 24 y 25 sep"]
    T6A["T6 API de rutinas<br/>Javier · 25 sep"]
    T5P["T5 Pantalla de catálogo<br/>Javier · 26 sep"]
    T7A["T7 API de sesiones<br/>Santiago · 24 al 26 sep"]
    T10P["T10 Pantalla de peso y GraficaLinea<br/>Rances · 27 y 28 sep"]
    T6P["T6 Pantallas de rutinas<br/>Javier · 27 al 29 sep"]
    T7P["T7 Pantallas de entrenar e historial<br/>Santiago · 27 al 29 sep"]
    T8A["T8 API de récords<br/>Santiago · 30 sep"]
    T9A["T9 API de progreso<br/>Santiago · 30 sep"]
    T8P["T8 Pantalla de récords<br/>Rances · 1 oct"]
    T9P["T9 Pantalla de progreso<br/>Javier · 1 oct"]
    T11["T11 Inicio, demo y entrega<br/>Rances con todos · 1 al 3 oct"]

    T1 --> T4A
    T2 --> T4P
    T4A -.-> T4P
    T4A -.-> T3
    T4A --> T4F
    T4A --> T5A
    T3 --> T10A
    T3 --> T7A
    T5A --> T6A
    T5A --> T5P
    T8L --> T7A
    T6A -.-> T7A
    T10A --> T10P
    T6A --> T6P
    T7A --> T7P
    T7A --> T8A
    T7A --> T9A
    T8A --> T8P
    T9A --> T9P
    T10P --> T9P
    T6P --> T11
    T7P --> T11
    T8P --> T11
    T9P --> T11

    classDef rances fill:#ffedd5,stroke:#c2410c,color:#1c1917
    classDef javier fill:#dbeafe,stroke:#1d4ed8,color:#1c1917
    classDef santiago fill:#dcfce7,stroke:#15803d,color:#1c1917
    class T1,T4A,T4F,T10A,T10P,T8P,T11 rances
    class T2,T4P,T5A,T6A,T5P,T6P,T9P javier
    class T3,T8L,T7A,T7P,T8A,T9A santiago
```

### Si te toca esperar

1. **Trabaja contra el contrato.** La API falsa (`node docs/guias/api-falsa-cuentas.mjs`) responde registro, login, `GET /usuarios/me`, `GET /referencias` y `GET /rutinas/{id}`. Para lo que no tenga, usa los ejemplos del contrato como datos de prueba.
2. **Adelanta lo tuyo que no depende de nadie:** el algoritmo de récords (T8), los estilos de tu siguiente pantalla o las peticiones de Postman de tu API.
3. **Revisa los pull requests pendientes:** cada PR revisado desbloquea a alguien.
4. **Si llevas medio día bloqueado, dilo en el daily** o en el grupo: para eso está el plan B.

## Prioridades para llegar al 3 de octubre

| Prioridad | Qué entra | Historias |
|---|---|---|
| **Imprescindible** (sin esto no hay entrega) | Cuenta y login · ver el catálogo · rutinas · registrar una sesión · historial · récords automáticos · progreso · peso corporal | H1–H3, H5, H10–H15, H18, H20–H22 |
| **Importante** | Perfil · detalle de ejercicio · ejercicios propios · detalle y eliminación de sesión · pantalla de récords · inicio · datos de demostración | H4, H6–H9, H16, H17, H19 |
| **Si da el tiempo** | Borrador del entrenamiento en el navegador · enlace a YouTube · pulido de la vista de escritorio | Partes de H6 y H14 |

Lo imprescindible se termina primero, aunque lo importante quede para después.

---

## Entrega 1 — martes 22 de septiembre: login y base de datos

### Qué se muestra

| # | Qué | Cómo se ve | Quién lo presenta |
|---|---|---|---|
| 1 | **Arquitectura** | Diagrama de [ARQUITECTURA.md](docs/ARQUITECTURA.md) §1: React, dos servicios y dos bases de datos | Rances |
| 2 | **Base de datos MySQL** | MySQL Workbench: las 6 tablas creadas por JPA y los 40 ejercicios base cargados. Diagrama entidad-relación | Rances |
| 3 | **Base de datos MongoDB** | MongoDB Compass: la base `gymrutine` con las colecciones `sesiones` y `registrosPeso` y sus índices. Modelo de documentos | Santiago |
| 4 | **Login funcionando** | Crear una cuenta y entrar desde React; cerrar sesión; volver a entrar | Javier |
| 5 | **API probada en Postman** | Registro, login, `GET /api/usuarios/me` con y sin token (200 y 401) | Rances |
| 6 | **Los dos servicios conectados** | `GET /api/sesiones` en Node responde `[]` con token y 401 sin él: Node le pregunta a Spring si el token es válido | Santiago |

### Cronograma de hoy y mañana

| Cuándo | Rances | Javier | Santiago |
|---|---|---|---|
| **Hoy, primero** | Instalar lo que falte (guía de inicio) y crear la base `gymrutine` en MySQL | Instalar Node.js 24 | Instalar MongoDB 8.0, Compass y Postman |
| **Hoy** | T1: proyecto Spring Boot, conexión a MySQL, entidades y catálogo base | T2 con su [guía](docs/guias/T2-FRONTEND.md): proyecto React con Vite, rutas, sesión, cliente de la API y estilos del mockup | T3 con su [guía](docs/guias/T3-NODE.md): proyecto Node con Express, conexión a MongoDB y modelos |
| **Hoy, al final** | T4 API: registro, login, logout, `usuarios/me` e interceptor. PR a `main` | T4: pantallas P1 y P2, probadas con la API falsa. PR a `main` | T3: middleware que valida el token, probado con la API falsa. PR a `main` |
| **Mañana, temprano** | Revisar y unir los PR. Colección de Postman de autenticación | Probar login y registro contra la API real | Probar la validación del token contra el Spring real |
| **Mañana, antes de clase** | Ensayo de los 6 puntos de la demostración, los tres juntos | | |

Si algo no llega, **se entrega primero lo de las filas 1 a 5**: es lo que pide la entrega. La fila 6 muestra que la arquitectura ya funciona, pero no es obligatoria.

---

## Metodología: Scrum adaptado a 3 personas y 12 días

Usamos Scrum, la metodología del curso (temario §4), con sprints de 2 a 4 días.

| Rol | Quién | Responsabilidad |
|---|---|---|
| Product Owner | Rances | Prioriza el backlog y acepta o devuelve cada historia comparándola con sus criterios |
| Scrum Master | Javier en los sprints 1 y 3; Santiago en los sprints 2 y 4 | Facilita la planeación y la retrospectiva, detecta bloqueos y mantiene el tablero al día |
| Equipo de desarrollo | Los tres | Construye el incremento. Cada uno responde por sus tareas |

| Evento | Cuándo | Duración | Resultado |
|---|---|---|---|
| Planeación del sprint | Al inicio de cada sprint | 20 min | Las tarjetas del sprint en el tablero, cada una con responsable |
| Daily | Todos los días, por escrito en el grupo del equipo | 5 min | Qué hice, qué haré y qué me bloquea |
| Revisión | 22 sep, 26 sep, 30 sep y 2 oct | 20 min | Demostración contra los criterios de aceptación |
| Retrospectiva | Después de cada revisión | 10 min | Un cambio concreto para el siguiente sprint, anotado abajo |

**Artefactos:** el Product Backlog es [HISTORIAS.md](docs/HISTORIAS.md) con una issue de GitHub por historia; el Sprint Backlog es el tablero de GitHub Projects (**Backlog → Por hacer → En progreso → En revisión → Hecho**); el incremento es `main` al cierre de cada sprint, marcado con la etiqueta `sprint-N`. Todo error encontrado se registra como issue con la etiqueta `error`.

### Retrospectivas

| Sprint | Funcionó | No funcionó | Cambio para el siguiente sprint |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |

---

## Cómo trabajamos con git

**Nadie trabaja directo en `main`.** Cada parte de una tarea vive en su rama y entra con un pull request que revisa otro integrante. Con plazos tan cortos, **los PR se revisan el mismo día**: si te piden revisión, es lo primero que haces. El paso a paso está en la [guía de git](GUIA-GIT.md).

| Tarea | Ramas (una por PR) |
|---|---|
| T1 | `t1-base-spring` |
| T2 | `t2-base-react` |
| T3 | `t3-base-node` |
| T4 | `t4-cuenta-api` · `t4-perfil` (las pantallas de login y registro van en `t2-base-react`, con T2) |
| T5 | `t5-catalogo-api` · `t5-catalogo-pantalla` |
| T6 | `t6-rutinas-api` · `t6-rutinas-pantallas` |
| T7 | `t7-sesiones-api` · `t7-sesiones-pantallas` |
| T8 | `t8-records-algoritmo` · `t8-records-api` · `t8-records-pantalla` |
| T9 | `t9-progreso-api` · `t9-progreso-pantalla` |
| T10 | `t10-peso-api` · `t10-peso-pantalla` |
| T11 | `t11-cierre` (se puede dividir) |
| Documentación | `docs-<tema>` |

**Quién revisa a quién:** Rances revisa los PR de Javier y de Santiago; Javier y Santiago se turnan para revisar los de Rances. El PR del algoritmo de récords lo revisan los dos compañeros.

Cada proyecto vive en su carpeta (`backend-spring/`, `backend-node/` y `frontend/`), así que casi no hay conflictos entre los tres.

---

## Convenciones del servicio de cuentas (Spring Boot)

- **Paquetes por capa** dentro de `co.edu.uis.gymrutine`: `config`, `controller`, `dto`, `error`, `model`, `repository`, `seguridad` y `service`.
- **Nombres:** dominio y métodos en español (`Rutina`, `registrar`); sufijos técnicos en inglés (`Controller`, `Service`, `Repository`, `Request`, `Response`). Sin tildes ni ñ en los identificadores.
- **Entidades = clases JPA; DTOs = records.** Nunca se devuelve una entidad. Cada `Response` tiene un método estático `desde(entidad)`.
- **Entidades sin setters públicos:** cambian con métodos del dominio (`actualizar(...)`, `desactivar()`). El constructor sin argumentos que exige JPA es `protected`.
- **Inyección por constructor**, con campos `final`.
- **Todas las rutas empiezan por `/api`**, en el `@RequestMapping` de cada controller.
- **Validación en los `Request`** con el mensaje en español. **No** poner `@Validated` en la clase del controller: el manejador global no atraparía la excepción y el cliente recibiría un 500.
- **Errores:** se lanzan las excepciones del paquete `error` con el código del contrato; el manejador global las convierte en `{codigo, mensaje, campos}`.
- **El usuario autenticado** llega en el atributo de la petición `usuarioId`, que pone el interceptor. Nunca se toma de la URL ni del cuerpo.
- **Transacciones:** `@Transactional` en los servicios que escriben y `@Transactional(readOnly = true)` en los que leen.
- **Javadoc** en cada clase y en los métodos no evidentes. **Postman:** cada endpoint nuevo entra a la colección en el mismo PR.

## Convenciones del servicio de entrenamiento (Node + Express)

- **Node.js 24 con módulos ES** (`import` / `export`, como en React), Express 5 y Mongoose. Sin otras librerías: Node 24 ya trae `--env-file` para leer el `.env`, `--watch` para reiniciar al guardar y `node --test` para las pruebas.
- **Estructura** en `src/`: `rutas/` (endpoints), `servicios/` (reglas de negocio), `modelos/` (esquemas de Mongoose), `middlewares/` (autenticación y errores). Detalle en [ARQUITECTURA.md](docs/ARQUITECTURA.md) §5.
- **Nombres en español y `camelCase`;** los modelos en `PascalCase` (`Sesion.js`, `RegistroPeso.js`).
- **Las rutas no tienen reglas de negocio:** validan la entrada, llaman a un servicio y responden.
- **El usuario sale de `req.usuario`**, que pone el middleware `autenticar`. Nunca del cuerpo ni de la URL.
- **Toda consulta filtra por `usuarioId`:** así un recurso de otro usuario responde 404.
- **Errores:** se lanza un `ErrorApi(estado, codigo, mensaje, campos)`; el middleware de errores responde con el formato del contrato. Express 5 pasa solo al manejador los errores de las funciones `async`.
- **Configuración en `.env`** (que no se sube); en el repo va `.env.ejemplo` con las variables sin secretos.
- **La regla de récords es una función pura** en `servicios/records.js`, probada con `node --test` sin MongoDB.

## Convenciones del frontend (React)

- **React con Vite, en JavaScript** (`.jsx`, sin TypeScript). Estructura y rutas en [ARQUITECTURA.md](docs/ARQUITECTURA.md) §7.
- **Componentes de función con hooks,** uno por archivo, en `PascalCase`. Las páginas van en `src/paginas/` y empiezan por `Pagina`.
- **Ningún `fetch` fuera de `src/api/cliente.js`.** El proxy de Vite manda cada petición al servicio que corresponde.
- **Estado global solo para la sesión** (`AuthProvider`, que se lee con `useAuth()`). Sin librerías de estado ni de componentes.
- **Estilos en `src/estilos.css`** con las clases del [mockup HTML](docs/mockup/mockup.html). Sin estilos en línea, salvo valores calculados.
- **Listas con `key` estable:** el `id` de la API, nunca la posición.
- **`localStorage` solo guarda** `gymrutine.token`, `gymrutine.usuario` y `gymrutine.borrador.<rutinaId>`.
- **Chart.js** solo dentro de `GraficaLinea`. **`npm run lint` sin avisos** antes de subir (Oxlint, que trae la plantilla de Vite).

## Definición de terminado

- [ ] Compila y sus pruebas pasan: `./mvnw test` en `backend-spring/`, `npm test` en `backend-node/`, `npm run build` y `npm run lint` en `frontend/`
- [ ] Probado contra el contrato (en Postman para la API): mismos campos, códigos de estado y errores
- [ ] Las tablas, colecciones y campos coinciden con [MODELO-DATOS.md](docs/MODELO-DATOS.md)
- [ ] Las pantallas cumplen las reglas del [mockup](docs/mockup/README.md) y se ven bien a 360 px
- [ ] Casilla de la historia marcada en el README
- [ ] PR revisado por otro integrante y unido a `main`; issue cerrada y tarjeta en "Hecho"

---

## T1 — Base del servicio de cuentas (Spring Boot + MySQL)

**Responsable:** Rances · **Rama:** `t1-base-spring` · **Sprint:** 1

**Qué entrega**

- Proyecto Spring Boot en `backend-spring/`, conectado a la base `gymrutine` de MySQL.
- Las 5 entidades JPA (`Usuario`, `TokenAcceso`, `Ejercicio`, `Rutina` y `RutinaEjercicio`), los 3 enumerados y los repositorios, fieles a [MODELO-DATOS.md](docs/MODELO-DATOS.md) §2 a §4. Son 6 tablas, porque `ejercicio_objetivo` es la colección de objetivos dentro de `Ejercicio`.
- `GET /api/referencias`.
- `CargaCatalogoBase` con los 40 ejercicios de [MODELO-DATOS.md](docs/MODELO-DATOS.md) §10.
- `ManejadorGlobalErrores` con el formato `{codigo, mensaje, campos}` y las excepciones del contrato.

**Cómo**

- Generar el proyecto en https://start.spring.io:

  | Opción | Valor |
  |---|---|
  | Project | **Maven** (viene Gradle por defecto: hay que cambiarlo) |
  | Language | Java |
  | Spring Boot | 4.1.1 |
  | Group / Artifact | `co.edu.uis` / `gymrutine` |
  | Package name | `co.edu.uis.gymrutine` |
  | Packaging / Configuration / Java | Jar / YAML / 21 |
  | Dependencies | Spring Web, Spring Data JPA, MySQL Driver, Validation |

- **`application.yml`:** `jdbc:mysql://localhost:3306/gymrutine` con el usuario `gymrutine` / `gymrutine`, `ddl-auto: update` y `open-in-view: false`.
- **Enumerados con sus datos visibles:** cada `Objetivo` lleva nombre, descripción, series y repeticiones sugeridas. `GET /referencias` los recorre.
- **Carga del catálogo base idempotente:** cada ejercicio se inserta solo si no existe uno base con ese nombre.
- **Pieza compartida:** `EjercicioResumenResponse` (`id`, `nombre`, `grupoMuscular`, `equipo`, `activo`), que usan catálogo y rutinas.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `./mvnw spring-boot:run` con MySQL encendido | Arranca sin errores en el puerto 8080 |
| Esquema `gymrutine` en MySQL Workbench | Las 6 tablas, con las columnas y claves del modelo |
| Arrancar la aplicación dos veces | Siguen siendo 40 ejercicios base, sin duplicados |
| `GET /api/referencias` | 200 con 3 objetivos, 8 grupos musculares y 6 equipos |
| `./mvnw test` | `BUILD SUCCESS` |

## T2 — Base del frontend (React)

**Responsable:** Javier · **Rama:** `t2-base-react` · **Sprint:** 1

**Qué entrega**

- Proyecto de React en `frontend/`, creado con Vite, con las 14 rutas de [ARQUITECTURA.md](docs/ARQUITECTURA.md) §7, cada una con su título, la navegación y un contenido provisional.
- `src/api/cliente.js`; la sesión en `src/auth/` (`contexto.js`, `AuthProvider.jsx` y `useAuth.js`) y `src/auth/RutaPrivada.jsx`.
- Componentes compartidos: `Plantilla`, `BarraNavegacion`, `Icono`, `Cargando`, `EstadoVacio`, `MensajeError` y `CampoFormulario`.
- `src/utilidades/formato.js` y `src/utilidades/referencias.js`.
- `src/estilos.css` con las variables y clases del [mockup HTML](docs/mockup/mockup.html).
- **Paso a paso y con todo el código probado:** [guía de T2](docs/guias/T2-FRONTEND.md). Incluye también las pantallas P1 y P2 de T4 y cerrar sesión desde el perfil.

**Cómo**

- **Crear el proyecto** desde la raíz del repo con `npx create-vite@latest frontend --template react --no-eslint --no-immediate`: React en JavaScript, con **Oxlint** para revisar el código (`npm run lint`). Dentro de `frontend/`: `npm install react-router chart.js`. Se suben `package.json` y `package-lock.json`.
- **`vite.config.js` con el proxy hacia los dos servicios.** Las rutas del servicio de entrenamiento van **primero**, porque Vite usa la primera que coincide:
  - `/api/sesiones`, `/api/records`, `/api/progreso` y `/api/peso-corporal` → `http://127.0.0.1:3000`
  - `/api` (todo lo demás) → `http://127.0.0.1:8080`
  - Se usa `127.0.0.1` y no `localhost` para ir siempre por IPv4: en Windows, `localhost` puede resolverse a la dirección IPv6 `::1`.
- **`cliente.js`:** funciones para GET, POST, PUT y DELETE con rutas relativas (`/api/...`) que agregan `Authorization: Bearer` si hay token. Ante un error lanzan un objeto con `estado`, `codigo`, `mensaje` y `campos`; ante 401 borran la sesión y llevan a `/login`; si la petición no llega, lanzan un error "sin conexión".
- **La sesión:** `AuthProvider` guarda usuario y token en el estado de React y en `localStorage`, y ofrece `iniciarSesion`, `registrarse`, `cerrarSesion` y `actualizarUsuario`; los componentes la leen con `useAuth()`. El contexto, el proveedor y el hook van en archivos separados porque Oxlint lo exige (regla `only-export-components`) para que funcione la recarga en caliente. **`RutaPrivada`:** sin token, lleva a `/login`.
- **`formato.js`:** kilos con `Intl` (`es-CO`), fechas cortas como en el mockup (`lun 14 sep`) e interpretación de números escritos con coma.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `npm run dev` y abrir http://localhost:5173 sin token | Lleva a `/login` |
| Cualquier página a 360 px | Sin scroll horizontal y con la barra inferior |
| Una petición con los backends apagados | "No se pudo conectar con el servidor" |
| Login, registro y cerrar sesión con la API falsa | Los casos del paso 6 de la [guía de T2](docs/guias/T2-FRONTEND.md) |
| `npm run build` y `npm run lint` | Sin errores ni avisos |

## T3 — Base del servicio de entrenamiento (Node + Express + MongoDB)

**Responsable:** Santiago · **Rama:** `t3-base-node` · **Sprint:** 1

**Qué entrega**

- Proyecto Node en `backend-node/` con Express 5 y Mongoose, conectado a la base `gymrutine` de MongoDB.
- Los modelos `Sesion` y `RegistroPeso` con sus índices, fieles a [MODELO-DATOS.md](docs/MODELO-DATOS.md) §5.
- Middleware `autenticar`, que valida el token con el servicio de cuentas.
- Middleware de errores con el formato del contrato y la clase `ErrorApi`.
- `GET /salud` (sin token) y `GET /api/sesiones` (con token), que por ahora devuelve la lista vacía.
- **Paso a paso y con todo el código probado:** [guía de T3](docs/guias/T3-NODE.md).

**Cómo**

- `npm init -y` y `npm install express mongoose`. En `package.json`: `"type": "module"` (npm lo crea como `"commonjs"`) y los scripts `dev` (`node --env-file=.env --watch src/index.js`), `start` y `test` (`node --test`).
- **`.env.ejemplo`** (se sube) y `.env` (no se sube) con `PUERTO=3000`, `MONGODB_URI=mongodb://127.0.0.1:27017/gymrutine` y `URL_SERVICIO_CUENTAS=http://127.0.0.1:8080`. Con `localhost`, en Windows Node puede intentar la dirección IPv6 `::1`, y MongoDB solo escucha en IPv4.
- **Nombres de colección explícitos:** `mongoose.model("Sesion", esquema, "sesiones")`. Si no se indican, Mongoose inventa `sesions` y `registropesos`.
- **`autenticar`:**
  1. Sin cabecera `Authorization` → 401 `NO_AUTENTICADO`.
  2. Llama a `GET {URL_SERVICIO_CUENTAS}/api/usuarios/me` con la misma cabecera, usando el `fetch` que ya trae Node.
  3. Si responde 200, guarda el usuario en `req.usuario`; si responde 401, responde 401.
  4. Si el servicio de cuentas no contesta → 503 `SERVICIO_NO_DISPONIBLE`.
- Los índices se crean solos al arrancar. Por eso las colecciones aparecen en Compass aunque estén vacías, que es lo que se muestra en la entrega 1.
- **Mientras la API de T4 no esté en `main`,** el token se valida contra la API falsa (`node docs/guias/api-falsa-cuentas.mjs`), que al arrancar muestra un token de prueba.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `npm run dev` con MongoDB encendido | "Conectado a MongoDB" y escucha en el puerto 3000 |
| http://localhost:3000/salud | 200 con `{"estado": "ok", "mongo": "conectado"}` |
| MongoDB Compass | Base `gymrutine` con las colecciones `sesiones` y `registrosPeso` y sus índices |
| `GET /api/sesiones` sin token | 401 `NO_AUTENTICADO` |
| `GET /api/sesiones` con un token válido (servicio de cuentas o API falsa encendidos) | 200 con `[]` |
| El mismo pedido con el servicio de cuentas apagado | 503 `SERVICIO_NO_DISPONIBLE` |

## T4 — Cuenta y perfil (Historias 1 a 4)

**Responsables:** API, Rances (`t4-cuenta-api`, sprint 1) · Login y registro, Javier (en la rama `t2-base-react`, junto con T2; sprint 1) · Perfil, Rances (`t4-perfil`, sprint 2)

**Qué entrega**

- `POST /api/auth/registro`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/usuarios/me` y `PUT /api/usuarios/me` (contrato §3).
- `InterceptorAutenticacion`, registrado en `ConfiguracionWeb`.
- Pantallas P1 (iniciar sesión) y P2 (crear cuenta) para la entrega 1; P14 (perfil) en el sprint 2.

**Cómo**

- **`spring-security-crypto`** agregado a mano en el `pom.xml`, sin versión (la maneja Spring Boot). Solo se usa `BCryptPasswordEncoder`; **no** se agrega `spring-boot-starter-security`.
- **Email normalizado** (sin espacios y en minúsculas) antes de buscar o guardar. **Contraseña** de 8 a 72 caracteres y máximo 72 bytes.
- **Token:** `UUID.randomUUID()`, que vence a los 7 días. Al iniciar sesión se borran los tokens vencidos de ese usuario.
- **Interceptor:** protege `/api/**` excepto `/api/auth/registro`, `/api/auth/login` y `/api/referencias`. Lee `Authorization: Bearer <token>`, busca un token vigente y guarda el id del usuario en el atributo de la petición `usuarioId`. Los controllers lo reciben con `@RequestAttribute("usuarioId") Long usuarioId`.
- **`GET /api/usuarios/me` es también la puerta del servicio de entrenamiento:** Node lo llama en cada petición para validar el token, así que debe responder rápido y no cargar más datos de los necesarios.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| Registro válido | 201 con token y usuario; en MySQL, `contrasena_hash` empieza por `$2` y mide 60 |
| Registro con un email ya usado, en mayúsculas | 409 `EMAIL_YA_REGISTRADO` |
| Registro con contraseña de 7 caracteres | 400 con `campos.contrasena` |
| Login con contraseña incorrecta, o con un email que no existe | 401 `CREDENCIALES_INVALIDAS`, con el mismo mensaje |
| `GET /api/usuarios/me` sin token, o con un token vencido | 401 `NO_AUTENTICADO` |
| Logout y luego usar el mismo token | 204 y después 401 |
| `GET /api/sesiones` (Node) con el token | 200: el servicio de entrenamiento aceptó el token |
| Pantallas | Crear cuenta → inicio; cerrar sesión → iniciar sesión; volver a entrar |

## T5 — Catálogo de ejercicios (Historias 5 a 9)

**Responsable:** Javier · **Ramas:** `t5-catalogo-api` y `t5-catalogo-pantalla` · **Sprint:** 2

**Qué entrega:** `GET /api/ejercicios` con filtros, `GET /api/ejercicios/{id}`, `POST`, `PUT` y `DELETE` en el servicio de cuentas (contrato §5), y la pantalla P4 con el detalle y el formulario de ejercicio propio.

**Cómo**

- **Visibilidad (R1):** ejercicios activos cuyo usuario es nulo o es el autenticado. Con unas decenas de ejercicios, basta consultar los visibles y aplicar los filtros en el servicio.
- **Duplicados:** se compara el nombre sin espacios alrededor y sin distinguir mayúsculas contra los base y los propios activos; al editar, se excluye el mismo ejercicio.
- **Permisos (R2):** `PUT` o `DELETE` sobre uno base → 403; sobre uno ajeno → 404. `DELETE` es lógico e idempotente.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `GET /api/ejercicios` sin filtros | Los 40 base más los propios activos, ordenados por nombre |
| `?grupoMuscular=PECHO&objetivo=FUERZA` | Solo los que cumplen los dos filtros |
| `?grupoMuscular=VOLAR` | 400 `VALIDACION_FALLIDA` |
| `POST` con nombre "press de banca con barra" | 409 `EJERCICIO_DUPLICADO` |
| `PUT` sobre un ejercicio base | 403 `EJERCICIO_NO_EDITABLE` |
| `DELETE` de un propio, y repetirlo | 204 las dos veces; ya no se lista, pero `GET /{id}` lo devuelve con `activo: false` |

## T6 — Rutinas (Historias 10 a 13)

**Responsable:** Javier · **Ramas:** `t6-rutinas-api` (sprint 2) y `t6-rutinas-pantallas` (sprint 3)

**Qué entrega:** `GET /api/rutinas`, `GET /api/rutinas/{id}`, `POST`, `PUT` y `DELETE` en el servicio de cuentas (contrato §6), y las pantallas P5 y P6.

**Cómo**

- **Validaciones de la lista en el servicio:** ningún `ejercicioId` repetido; cada ejercicio visible y activo. Si no, 400 con `campos` en `ejercicios[i].ejercicioId`.
- **`PUT` reemplaza la colección:** se vacía la lista y se agregan las filas nuevas; `orphanRemoval` borra las viejas.
- **Rutina eliminada:** `GET` la devuelve con `activa: false`; `PUT` responde 404; `DELETE` repetido responde 204.
- **`GET /api/rutinas/{id}` también lo usa el servicio de entrenamiento** para validar una sesión: debe responder 404 si la rutina es de otro usuario.
- **La API va antes que la pantalla de catálogo (P4):** Santiago la necesita para probar la API de sesiones. Debe estar en `main` el jueves 25.
- **Pantalla P5:** la última vez que se entrenó cada rutina sale de `GET /api/sesiones` (servicio de entrenamiento), no del servicio de cuentas.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `POST` con 3 ejercicios | 201; `orden` 1, 2 y 3 según el arreglo |
| `POST` con el mismo ejercicio dos veces, o con `seriesObjetivo: 11` | 400 |
| `PUT` quitando un ejercicio y reordenando los demás | 200 con exactamente la lista enviada |
| `DELETE` | 204; ya no se lista; `GET /{id}` → 200 con `activa: false` |
| `GET` de una rutina de otro usuario | 404 `RUTINA_NO_ENCONTRADA` |
| Constructor: agregar un ejercicio con objetivo Resistencia | Llega prellenado con 3 × 15 |

## T7 — Sesiones de entrenamiento (Historias 14 a 17)

**Responsable:** Santiago · **Ramas:** `t7-sesiones-api` (sprint 2) y `t7-sesiones-pantallas` (sprint 3)

**Qué entrega:** `POST /api/sesiones`, `GET /api/sesiones`, `GET /api/sesiones/{id}`, `DELETE /api/sesiones/{id}` y `GET /api/sesiones/ultimos-registros` en el servicio de entrenamiento (contrato §7), y las pantallas P7 a P10.

**Cómo**

- **`POST`:**
  1. Validar el cuerpo (rangos del contrato).
  2. Pedir la rutina al servicio de cuentas: `GET /api/rutinas/{rutinaId}` con el mismo token. Si responde 404, la rutina no es válida (400). Si viene con `activa: false`, también 400.
  3. Verificar que cada `ejercicioId` está en la rutina y activo.
  4. Armar el documento con la **copia de los nombres** de la rutina y de cada ejercicio, y guardarlo.
  5. Recalcular los récords de cada ejercicio de la sesión (T8) y devolver el detalle con el resumen.
- **Mientras la API de rutinas (T6) no esté en `main`,** la API falsa responde `GET /api/rutinas/3` (activa) y `GET /api/rutinas/4` (eliminada) para la usuaria de prueba, y 404 para cualquier otra.
- **Sin transacciones:** MongoDB instalado en local (sin réplica) no tiene transacciones entre documentos. El recálculo es idempotente: si falla después de guardar, el siguiente registro o eliminación lo corrige ([ARQUITECTURA.md](docs/ARQUITECTURA.md), DEC-18).
- **Toda consulta lleva `usuarioId`.** Un id que no es un `ObjectId` válido responde 404, no 500 (`mongoose.isValidObjectId`).
- **`DELETE`:** borra el documento y después recalcula los récords de sus ejercicios.
- **`ultimos-registros`:** pide la rutina al servicio de cuentas y, por cada ejercicio, busca la sesión más reciente del usuario que lo incluye (en cualquier rutina) y su récord vigente.
- **Pantallas:** reglas de P7 a P10 del [mockup](docs/mockup/README.md). Lo más delicado es el borrador en `localStorage` y el reintento al guardar.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `POST` válido | 201 con `resumen` y series con `esRecord` |
| `POST` con un ejercicio que no está en la rutina, o con una rutina eliminada o de otro usuario | 400 |
| `POST` con `fechaInicio` futura, `pesoKg: 500.5` o `repeticiones: 0` | 400 con `campos` |
| `POST` con el servicio de cuentas apagado | 503 `SERVICIO_NO_DISPONIBLE` |
| `GET /api/sesiones` | De la más reciente a la más antigua, aunque se hayan registrado en otro orden |
| `GET /api/sesiones/abc` o una sesión de otro usuario | 404 `SESION_NO_ENCONTRADA` |
| Entrenar: recargar a mitad del entrenamiento | Se ofrece continuar el borrador |
| Entrenar: guardar sin conexión y luego reintentar | Primero el aviso y ningún dato perdido; después 201 y el resumen |

## T8 — Récords personales (Historias 18 y 19)

**Responsables:** algoritmo y API, Santiago (`t8-records-algoritmo` en el sprint 2 y `t8-records-api` en el sprint 3) · pantalla, Rances (`t8-records-pantalla`, sprint 4)

**Qué entrega:** la regla R6 ([MODELO-DATOS.md](docs/MODELO-DATOS.md) §7.1) en `servicios/records.js` con sus pruebas, el recálculo al registrar y eliminar sesiones, `GET /api/records` y la pantalla P12.

**Cómo**

- **Función pura primero, el 23 de septiembre,** antes de la API de sesiones: no depende de nadie. `calcularRecords(sesiones)` recibe las sesiones de un ejercicio ya ordenadas y devuelve qué series son récord. Se prueba con `node --test` en `test/records.test.js`, sin MongoDB.
- **`recalcularRecords(usuarioId, ejercicioId)`:** carga las sesiones del usuario que tienen ese ejercicio, ordenadas por `fechaInicio` y `_id`; aplica la función y guarda solo los documentos que cambiaron.
- **Pruebas obligatorias:** los 7 casos de la tabla del modelo, más el ejemplo completo (S1 a S4, eliminar S3 y agregar la sesión del 06-sep).
- **`GET /api/records`:** la serie con `esRecord` y mayor peso de cada ejercicio, ordenadas por nombre. La pantalla las agrupa por grupo muscular en el orden de `/referencias`.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `npm test` | Pasan los 7 casos y el ejemplo |
| Primera sesión de un ejercicio con 40 kg; luego otra con 40 kg | La primera es récord; la segunda no |
| Sesión con 42,5 × 8 y 42,5 × 6 | Solo la primera serie de 42,5 es récord |
| Registrar una sesión con fecha anterior y más peso | Pasa a ser récord y la posterior lo pierde |
| `GET /api/records` sin sesiones | 200 con `[]` |

## T9 — Progreso por ejercicio (Historia 20)

**Responsables:** API, Santiago (`t9-progreso-api`, sprint 3) · pantalla, Javier (`t9-progreso-pantalla`, sprint 4)

**Qué entrega:** `GET /api/progreso/ejercicios` y `GET /api/progreso/ejercicios/{id}` en el servicio de entrenamiento (contrato §8), y la pantalla P11.

**Cómo**

- **Ejercicios con historial:** los que aparecen en las sesiones del usuario, con la cantidad de sesiones; el nombre y el grupo salen de la copia guardada en la sesión.
- **Puntos:** por cada sesión que tiene el ejercicio, en orden cronológico: peso máximo, volumen y si alguna serie es récord. Si el usuario no tiene registros del ejercicio → 404.
- **Pantalla:** primero la tabla y después la gráfica, reutilizando `GraficaLinea` (T10). Cambiar entre peso y volumen no vuelve a pedir datos.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| Ejercicio nunca registrado | No aparece en `GET /api/progreso/ejercicios`; pedido por id → 404 |
| Tres sesiones registradas en desorden | Los puntos salen en orden cronológico |
| Volumen de un punto | Suma de peso × reps de ese ejercicio en esa sesión |
| La gráfica no se puede dibujar | La tabla sigue visible |

## T10 — Peso corporal (Historias 21 y 22)

**Responsable:** Rances · **Ramas:** `t10-peso-api` (sprint 2) y `t10-peso-pantalla` (sprint 3)

**Qué entrega:** `GET /api/peso-corporal`, `POST` y `DELETE` en el servicio de entrenamiento (contrato §9), la pantalla P13 y el componente `GraficaLinea`, que después reutiliza T9.

**Cómo**

- **Fecha repetida:** el índice único (`usuarioId`, `fecha`) rechaza el duplicado; el error de MongoDB con código `11000` se convierte en 409 `PESO_YA_REGISTRADO`.
- **`GraficaLinea`:** recibe los puntos, el texto del eje y qué puntos resaltar. Crea la gráfica de Chart.js en un efecto de React y la destruye al desmontarse; si no, en desarrollo aparece *Canvas is already in use*, porque React ejecuta los efectos dos veces a propósito.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| `POST` válido, y luego otro con la misma fecha | 201 y después 409 `PESO_YA_REGISTRADO` |
| `POST` con fecha futura o con `pesoKg: 10` | 400 |
| `DELETE` de un registro de otro usuario | 404 `REGISTRO_PESO_NO_ENCONTRADO` |
| Pantalla con un solo registro, o sin registros | El punto sin errores, o la invitación a registrar el primero |

## T11 — Inicio, integración y entrega

**Responsable:** Rances, con todos · **Rama:** `t11-cierre` · **Sprint:** 4

**Qué entrega**

- **P3 Inicio** completa.
- **Colección de Postman** en `postman/`, con carpetas por servicio y un entorno `GymRutine local` cuyo token se llena solo al iniciar sesión.
- **Datos de demostración:** una carpeta de la colección que, con el Collection Runner, crea una usuaria, 3 rutinas, unas 18 sesiones de las últimas 6 semanas con cargas que progresan y 6 registros de peso.
- **Pulido en celulares reales**, README final con cómo ejecutar todo, etiqueta `sprint-4` y ensayo de la sustentación.

**Cómo verificar**

| Caso | Esperado |
|---|---|
| Bases recién creadas + Collection Runner | La usuaria demo tiene gráficas con al menos 6 puntos y varios récords |
| Recorrido completo: cuenta → rutina → entrenar → récord → progreso → peso | Sin errores en la consola del navegador |
| Clonar el repo en un computador limpio y seguir la guía de inicio | Todo corre sin pasos que no estén escritos |

---

_Última actualización: 2026-09-21_
