# GymRutine — Informe inicial

**Asignatura:** Entornos de Programación (código 24542) · Universidad Industrial de Santander, Escuela de Ingeniería de Sistemas e Informática
**Entregas:** sprint 2 el 23 de septiembre de 2026 (Jira, diseño de la base de datos y repositorio) · **proyecto final el 9 de octubre de 2026** (login, un CRUD por integrante y evidencias)
**Equipo:** Rances Ramírez (Product Owner y coordinador) · Javier · Santiago
**Repositorio:** https://github.com/rancesra/gymrutine
**Versión:** 3.1 · **Fecha:** 2026-09-21

Este documento presenta el proyecto: qué problema resuelve, para quién, qué incluye y qué no, y qué decisiones se tomaron. El detalle técnico está en los documentos de la sección 14.

---

## 1. El problema

Las personas que entrenan solas en el gimnasio, sin un entrenador presente, tienen dos fallas que se refuerzan entre sí:

1. **Rutinas desalineadas de su objetivo.** Siguen rutinas genéricas sacadas de internet, pensadas para otro cuerpo y otra meta, o las arman sobre la marcha y sin estructura. Quien quiere ganar fuerza termina haciendo un circuito de resistencia; quien quiere bajar de peso hace series de fuerza máxima.
2. **No llevan un registro sistemático.** Entrenan "de memoria": no saben con cuánto peso hicieron press de banca hace tres semanas. Sin ese dato no pueden saber si progresan, están estancadas o retroceden. La sensación ("creo que voy mejor") reemplaza a la evidencia.

El resultado es un entrenamiento que se siente productivo, pero que no se puede **verificar**.

## 2. Justificación y pertinencia

GymRutine ataca los dos problemas a la vez:

- **Rutinas alineadas al objetivo del usuario** (fuerza, pérdida de peso o resistencia): el objetivo define las series y repeticiones sugeridas y los ejercicios recomendados.
- **Progreso medible de verdad:** no el visto bueno de "completé la rutina", sino la **evolución real de las cargas por ejercicio a lo largo del tiempo**, con gráficas, récords personales detectados automáticamente y, para quien busca bajar de peso, la evolución de su peso corporal.

Esa es la diferencia entre usar una app y usar una libreta: la app compara, grafica y detecta un récord; el papel no.

### Relación con los propósitos del curso

| Propósito del programa de la asignatura | Dónde se aplica en GymRutine |
|---|---|
| Entender Scrum: roles, responsabilidades, artefactos y fases | Scrum adaptado a 3 personas ([plan de trabajo](../PLAN-DE-TRABAJO.md)) |
| Usar una herramienta de gestión para el seguimiento de errores e incidencias | Jira como tablero Scrum, con los errores registrados como *Bug* ([guía de Jira](guias/JIRA.md)) |
| Gestionar versiones con Git y un repositorio en GitHub | Ramas por tarea, pull requests y `main` protegida ([guía de git](../GUIA-GIT.md)) |
| Arquitectura en capas que desacopla el frontend del backend y los comunica por API REST | Dos APIs (Spring Boot y Node.js) y un frontend que solo habla con ellas |
| Construir la capa del cliente con JavaScript consumiendo la API REST | Frontend en React (temario §10) |
| Diseño de bases de datos y MySQL (temario §6) | Modelo entidad-relación normalizado sobre MySQL ([modelo de datos](MODELO-DATOS.md)) |
| Verificar programas diseñando y realizando pruebas | Pruebas unitarias de la regla de récords y colección de Postman |
| Backend con Spring Boot, API REST, Maven, JPA y Postman (temario §7) | Servicio de cuentas y rutinas |
| Arquitectura de microservicios (temario §7.1) | Dos servicios, cada uno con su base de datos, que se comunican por REST ([arquitectura](ARQUITECTURA.md)) |
| Backend con Node.js y base de datos NoSQL MongoDB (temario §8 y §9) | Servicio de entrenamiento con Express y Mongoose |

## 3. Usuario principal

**Persona que entrena sola y gestiona sus propias rutinas.** Tiene un objetivo, va al gimnasio con regularidad y quiere saber si está mejorando.

> **No hay rol de entrenador en este alcance.** La relación entrenador–cliente multiplicaría las entidades, los permisos y las pantallas sin aportar a lo que evalúa el curso.

## 4. Plataforma

**Aplicación web responsiva, hecha con React.** Se ve y funciona bien desde el navegador del celular, que es donde realmente se usa: de pie, entre series y con una mano.

- **Sin app móvil nativa:** no se enseña en el curso y consumiría el tiempo del proyecto. Queda como trabajo futuro.
- **Sin funcionamiento sin conexión (decisión D1):** una PWA cambiaría la arquitectura y no está en el temario. Para la mala señal del gimnasio, el entrenamiento en curso se guarda como borrador en el navegador y el guardado se puede reintentar sin perder datos.

## 5. Funcionalidades

| # | Funcionalidad | Qué hace | Historias |
|---|---|---|---|
| F1 | **Cuenta y objetivo** | Crear cuenta con email y contraseña, iniciar y cerrar sesión, y elegir el objetivo: fuerza, pérdida de peso o resistencia | H1–H4 |
| F2 | **Catálogo de ejercicios** | 40 ejercicios base, filtrables por grupo muscular, equipo y objetivo, más ejercicios propios con CRUD | H5–H9 |
| F3 | **Rutinas** | Rutinas con ejercicios del catálogo y sus series y repeticiones objetivo, prellenadas según el objetivo | H10–H13 |
| F4 | **Registro de sesiones** | Ejecutar una rutina registrando cada serie realmente hecha (peso y repeticiones), con fecha y duración, prellenada con lo que se hizo la última vez. Una sesión registrada se puede corregir o eliminar | H14–H17, H23 |
| F5 | **Progreso con gráficas** | Evolución del peso máximo y del volumen por ejercicio, sesión a sesión | H20 |
| F6 | **Récords personales automáticos** | El sistema detecta cuándo una serie supera el máximo histórico del usuario en ese ejercicio y la marca como récord | H18, H19 |
| F7 | **Peso corporal** | Registro del peso por fecha, que se puede corregir o eliminar, y su gráfica: la métrica de progreso del objetivo "pérdida de peso" (decisión D3) | H21, H22, H24 |

**La distinción central del modelo:** la rutina guarda lo **planeado** (series y repeticiones objetivo); la sesión guarda lo **ejecutado** (peso y repeticiones reales de cada serie). De comparar ambos sale todo el valor de la app.

**Cómo se concreta "rutinas alineadas al objetivo":**

| Objetivo | Series × repeticiones sugeridas | Idea |
|---|---|---|
| Fuerza | 4 × 5 | Pocas repeticiones con cargas altas |
| Pérdida de peso | 3 × 12 | Repeticiones moderadas y descansos cortos |
| Resistencia | 3 × 15 | Muchas repeticiones con cargas moderadas |

Al agregar un ejercicio a una rutina, estos valores vienen prellenados y el usuario los puede cambiar. Además, el catálogo marca qué ejercicios se recomiendan para cada objetivo.

## 6. Fuera de alcance

Se mencionan como trabajo futuro, pero no se desarrollan:

- Notificaciones y recordatorios.
- App móvil nativa, o PWA con funcionamiento sin conexión y notificaciones.
- Rol entrenador–cliente.
- Nutrición, comunidad social y escáner de alimentos.
- Ejercicios que se miden por tiempo o distancia (cardio, plancha).
- Historial en calendario y rachas; favoritos en el catálogo.
- Recuperar o cambiar la contraseña, cambiar el email y eliminar la cuenta.
- Agregar o quitar ejercicios de una sesión ya registrada: se elimina y se registra de nuevo.

**Extensiones candidatas** (solo si sobra tiempo; **no comprometidas**):

- 1RM estimado por ejercicio (fórmula de Epley o de Brzycki).
- Plantillas de rutina predefinidas por objetivo y nivel.
- Temporizador de descanso entre series.

## 7. Benchmark: GymTracker (KreatorDev)

Se analizaron la ficha y las 9 capturas de [Gym Tracker — GymTracker](https://play.google.com/store/apps/details?id=com.kreatordev.gymtracker), una app de Google Play con más de 500 descargas, actualizada en julio de 2025.

### 7.1 Lo que confirma nuestra idea

Su propuesta central coincide con la nuestra: **biblioteca de ejercicios + constructor de rutinas + registro de sesiones + estadísticas por ejercicio + récords**. Nuestro MVP no inventa el problema: es el núcleo que una app real del dominio considera imprescindible. Es un buen argumento para la sustentación.

### 7.2 Lo que muestran las capturas

| Captura | Qué muestra | Qué nos dice |
|---|---|---|
| Sesión del día | Lista de ejercicios; cada serie como un recuadro "kg / reps"; arriba, ejercicios · series · kg totales y los grupos musculares trabajados; un "+" por ejercicio para agregar series | **Las series de un mismo ejercicio cambian de peso** (30, 35, 40 y 45 kg): confirma que hay que registrar por serie (D2) |
| Resultado | Tarjetas con kg levantados, ejercicios, series y repeticiones, con trofeos por récords; debajo, la lista de récords por ejercicio con peso máximo y repeticiones máximas | Mostrar el resumen y los récords al terminar es lo que da la sensación de progreso |
| Peso corporal | Gráfica de línea del peso en el tiempo y lista de registros con fecha | Confirma que el peso corporal es la métrica natural de progreso para quien busca bajar de peso (D3) |
| Biblioteca | Ejercicios agrupados por músculo con contador ("Chest (163)"), filtros por equipo, favoritos; detalle con animación, etiquetas y enlaces para buscar la técnica | Agrupar y filtrar hace usable un catálogo grande; el enlace a la técnica es barato y útil |
| Calendario | Mes con puntos de colores en los días entrenados, uno por grupo muscular | Bonito, pero no esencial |
| Programas | Planes predefinidos por días a la semana y nivel (principiante, intermedio, avanzado) | Coincide con nuestra extensión candidata de plantillas |
| Menú y calculadoras | Menú en cuadrícula; calculadoras de discos, IMC, calorías y zonas de frecuencia cardiaca | Fuera del problema que atacamos |

### 7.3 Mejoras que sí incorporamos

| Idea tomada de GymTracker | Por qué nos sirve | Dónde quedó |
|---|---|---|
| **Prellenar con los valores de la última vez** | La mejora de usabilidad más grande por el menor costo: entre series, el usuario solo corrige un número en lugar de escribirlo todo. El dato ya está en la base de datos | H14, `GET /sesiones/ultimos-registros`, pantalla P7 |
| **Resumen al terminar la sesión** con volumen total, series, repeticiones y récords | Da sensación de progreso incluso en días sin récord. Son sumas, no una funcionalidad nueva | H14, pantalla P8 |
| **Mostrar el récord actual mientras se entrena** | Dice exactamente qué peso hay que superar | Pantalla P7 |
| **Catálogo agrupado por músculo, con contador y filtros de equipo** | Con 40 ejercicios o más, armar una rutina sin filtros es incómodo | H5, pantalla P4 |
| **Enlace para buscar la técnica** del ejercicio | Costo casi nulo: un enlace a una búsqueda en YouTube | H6 |
| **Fecha editable de la sesión** | Permite registrar un entrenamiento que se olvidó anotar | H14 |
| **Peso corporal con gráfica y lista** | Métrica del objetivo "pérdida de peso", que antes no tenía ninguna | H21, H22, pantalla P13 |

### 7.4 Lo que explícitamente no copiamos

- **Más de 1.300 ejercicios animados.** Sembramos 40 bien elegidos: el valor académico está en el CRUD y la API, no en el volumen de datos.
- **Nutrición, escáner de códigos de barras y planes de comida.** Es otro dominio completo.
- **Comunidad.** Otro dominio, que además exige moderación y cuidado de la privacidad.
- **Herramientas para entrenadores.** Fuera de alcance (§3).
- **Calculadoras, calendario y favoritos.** No resuelven el problema de §1.
- **Anuncios y compras dentro de la app.** No aplica.

> **Un detalle que sí importa:** GymTracker anuncia funcionamiento sin conexión. No es casualidad: **en los gimnasios suele haber mala señal.** Por eso lo decidimos desde el principio (D1) y mitigamos el riesgo sin cambiar la arquitectura (§4).

## 8. Modelo conceptual

| Entidad | Qué representa |
|---|---|
| **Usuario** | Quien entrena: nombre, email, contraseña cifrada y objetivo |
| **Ejercicio** | Elemento del catálogo base, o ejercicio propio de un usuario |
| **Rutina** | Plan de entrenamiento de un usuario, con su objetivo |
| **RutinaEjercicio** | Un ejercicio dentro de una rutina, con series y repeticiones objetivo |
| **Sesión de entrenamiento** | Una ejecución real de una rutina: fecha y duración |
| **Registro de ejercicio** | Un ejercicio realizado dentro de una sesión |
| **Serie realizada** | Peso y repeticiones de cada serie real. De aquí salen los récords |
| **Registro de peso** | Peso corporal del usuario en una fecha |
| **Token de acceso** | La sesión iniciada de un usuario en un dispositivo |

El diagrama entidad-relación, el diccionario de datos y la regla exacta de récords están en [MODELO-DATOS.md](MODELO-DATOS.md).

## 9. Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| Servicio de cuentas y rutinas | **Spring Boot 4.1.1** (Java 21) con API REST | Temario §7 |
| Persistencia | **JPA / Hibernate** sobre **MySQL 8.4 LTS** | MySQL (§6.2) y JPA (§7.6) están en el temario |
| Construcción | **Maven** (con Maven Wrapper) | Temario §7.5 |
| Servicio de entrenamiento | **Node.js 24 + Express 5 + Mongoose** sobre **MongoDB 8.0** | Temario §8 y §9 (MERN) |
| Pruebas de la API | **Postman** | Temario §7.7 |
| Frontend | **React 19** con Vite, consumiendo la API | El curso pide construir el cliente en JavaScript, y React está en el temario (§10). Decisión D10 |
| Control de versiones | **Git + GitHub** | Repositorio compartido entre los tres |

**Dos piezas que no se ven en clase**, cada una con su justificación (decisiones DEC-07 y DEC-08 de la [arquitectura](ARQUITECTURA.md)):

- **Chart.js 4.5.1** para las gráficas. Solo visualiza y no tiene lógica de negocio. Dibujar gráficas a mano no es evaluable.
- **spring-security-crypto**, solo para cifrar contraseñas con BCrypt. Guardarlas en texto es inaceptable, y programar el cifrado a mano es propenso a errores. No activa Spring Security.

Quedan por confirmar con el profesor, junto con React Router (decisión D8).

### Un solo proyecto para todo el curso

El programa separaba un corte de Spring Boot con JavaScript y otro FullStack MERN. Como el curso ya dio todas las clases, **GymRutine los une**: lo que se planea (cuentas, catálogo y rutinas) vive en Spring Boot con MySQL, y lo que se ejecuta (sesiones, récords, progreso y peso) vive en Node.js con MongoDB. El frontend en React habla con los dos. Así cada tecnología del curso tiene un papel real en la aplicación (decisión D11).

## 10. Metodología de trabajo

**Scrum adaptado a 3 personas**, que es la metodología del curso. El detalle está en el [plan de trabajo](../PLAN-DE-TRABAJO.md).

- **Roles:** Rances es Product Owner; el rol de Scrum Master rota entre Javier (sprints 2 y 4) y Santiago (sprint 3); los tres forman el equipo de desarrollo.
- **Eventos cortos:** planeación al inicio de cada sprint, daily por escrito, revisión antes de cada entrega y retrospectiva de 15 minutos.
- **Artefactos:** el Product Backlog es [HISTORIAS.md](HISTORIAS.md), cargado en **Jira**, como pide el curso; el Sprint Backlog es el sprint activo de Jira; el incremento es `main` al cierre del sprint, marcado con una etiqueta de git.

### Prácticas que adoptamos

1. **Historias de usuario con criterios Dado / Cuando / Entonces**, que definen qué significa "terminado" y evitan discusiones el día antes de entregar.
2. **Contrato de API escrito antes de programar**, para que frontend y backend avancen en paralelo sin esperarse.
3. **Decisiones con sus alternativas y su porqué**, en la arquitectura y en el modelo de datos. Son la base de la sustentación.
4. **Decisiones pendientes anotadas desde el día 1 y cerradas con fecha** (§13). Nada se asume.
5. **Tarea base primero:** una persona arma el esqueleto y las piezas compartidas (entidades, errores, configuración) antes de que los demás empiecen. Sin esto aparecen tres versiones del mismo archivo.
6. **Plan con dependencias y definición de terminado:** cada tarea dice quién la hace, de qué depende y cómo se verifica.
7. **Ramas, pull requests y `main` protegida.** Nadie sube directo a `main`, y todo PR lo revisa otra persona.
8. **Pasos pequeños** que terminan en algo verificable y un commit.
9. **Versiones fijadas y verificadas en la documentación oficial**, no en tutoriales.
10. **Mockup en HTML con las reglas anotadas en cada pantalla**, porque GymRutine es sobre todo interfaz.

### Lo que explícitamente no hacemos

- **API gateway, registro de servicios ni colas de mensajes.** Dos servicios que se hablan por REST muestran la arquitectura de microservicios; esa infraestructura se comería los 19 días.
- **Scrum con toda su ceremonia.** Con 3 personas, los roles se combinan y los eventos son cortos.

## 11. Plan de entregas

El curso ya dio todas las clases, así que el proyecto **deja de ir por cortes**: se entrega una sola aplicación, completa, el **viernes 9 de octubre de 2026**, con la sustentación del login y de un CRUD por integrante, y las evidencias de participación y de la trazabilidad en Jira. Antes está la entrega del **sprint 2, el miércoles 23 de septiembre:** cuenta en Jira, diseño de la base de datos y repositorio. El calendario día a día y el reparto están en el [plan de trabajo](../PLAN-DE-TRABAJO.md).

| Sprint | Fechas | Objetivo | Entregable verificable |
|---|---|---|---|
| **2** | 21 – 23 sep | Bases, login y Jira | **Entrega del sprint 2:** Jira con el backlog, diseño de la base de datos y repositorio. Como avance: registro e inicio de sesión desde React, las dos bases de datos y los dos servicios conectados |
| **3** | 24 – 29 sep | Las APIs | Catálogo y perfil de punta a punta; peso corporal (CRUD de Rances); APIs de rutinas y de sesiones; algoritmo de récords con pruebas |
| **4** | 30 sep – 9 oct | Pantallas, evidencias y entrega | Rutinas (CRUD de Javier), sesiones (CRUD de Santiago), récords, progreso, inicio, datos de demostración, evidencias y **entrega final** |

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| Solo 19 días para todo | Prioridades explícitas en el plan, con lo que pide el curso (login y un CRUD por integrante) como imprescindible, y congelamiento el 6 de octubre |
| Llegar a la sustentación sin evidencias de quién hizo qué | Jira al día desde el sprint 2, la clave de Jira en cada pull request y capturas al cerrar cada sprint en [EVIDENCIAS.md](../EVIDENCIAS.md) |
| Los dos servicios no se entienden entre sí | La validación del token entre servicios se prueba desde la entrega del sprint 2 (T3); el contrato dice qué servicio atiende cada endpoint |
| Los tres tocan los mismos archivos y se pisan | Cada proyecto vive en su carpeta; T1, T2 y T3 crean las piezas compartidas; una rama por tarea y PR con revisión |
| El frontend se queda esperando al backend | Contrato escrito desde el primer día y una API falsa del servicio de cuentas; las pantallas se construyen antes y se conectan cuando el endpoint está en `main` |
| La base del backend y la autenticación se atrasan (cuello de botella del sprint 2) | Son lo primero del sprint; mientras tanto, Javier y Santiago avanzan en la base del frontend y el algoritmo de récords |
| La autenticación consume más tiempo del previsto | Diseño mínimo: token en una tabla más un interceptor, sin Spring Security |
| La regla de récords tiene errores sutiles (fechas pasadas, correcciones, eliminaciones) | Se programa como una función separada con pruebas unitarias de 8 casos, antes que la API de sesiones |
| Mala señal en el gimnasio | Borrador del entrenamiento en el navegador y reintento de guardado |
| Chart.js se vuelve un hueco de tiempo | Cada gráfica tiene primero su tabla: si la gráfica falla, la pantalla sigue siendo útil |
| MongoDB en local no tiene transacciones entre documentos | El recálculo de récords es idempotente: la siguiente escritura corrige cualquier falla a mitad (ARQUITECTURA DEC-18) |
| Tres tecnologías de backend y frontend a la vez | El equipo ya trabajó con Vite, componentes y microservicios en teambsoft; las bases (T1, T2 y T3) dejan listas las piezas compartidas y el mockup HTML define los estilos |
| Diferencias entre Windows y macOS | Guía de inicio para los dos sistemas, finales de línea normalizados y versiones fijadas |
| La demostración se ve vacía | Datos de demostración con 6 semanas de sesiones, cargados con Postman (T11) |

## 13. Decisiones

### Cerradas

| ID | Decisión | Resultado | Fecha |
|---|---|---|---|
| D1 | ¿La app debe funcionar sin conexión? | **No.** Las PWA no están en el temario y cambiarían la arquitectura. Mitigación: borrador en el navegador y reintento de guardado | 2026-09-14 |
| D2 | ¿Cómo se registra lo hecho y cuándo hay récord? | **Por serie** (peso y repeticiones de cada una). **Récord = superar el peso máximo** del ejercicio; empatar no cuenta | 2026-09-14 |
| D3 | ¿Se incluyen métricas corporales? | **Sí, solo el peso corporal**, con registro y gráfica | 2026-09-14 |
| D4 | ¿Login real o usuario fijo? | **Login con email y contraseña:** contraseñas con BCrypt y token guardado en MySQL | 2026-09-14 |
| D5 | ¿Cómo se reparte el trabajo? | **Por funcionalidad, de punta a punta:** Rances, cuenta y peso corporal; Javier, catálogo, rutinas y progreso; Santiago, sesiones y récords | 2026-09-14 |
| D10 | ¿Frontend con React o con JavaScript sin framework? | **React con Vite.** Está en el temario (§10) y es JavaScript | 2026-09-15 |
| D7 | Fechas de entrega | Las del curso. **23 de septiembre, sprint 2:** cuenta en Jira, diseño de la base de datos y repositorio. **9 de octubre, sprints 3 y 4:** sustentación del login y de un CRUD por integrante, con un archivo de evidencias de participación y de la trazabilidad en Jira | 2026-09-21 |
| D11 | ¿Cómo se usan todas las tecnologías del curso? | **Dos servicios:** cuentas y rutinas en Spring Boot + MySQL; entrenamiento (sesiones, récords, progreso y peso) en Node.js + Express + MongoDB | 2026-09-21 |
| D12 | ¿Cómo nos repartimos para terminar el 9 de octubre? | **Rances:** servicio de cuentas, peso corporal, perfil, inicio e integración. **Javier:** frontend, catálogo y rutinas, progreso. **Santiago:** servicio de entrenamiento con sus pantallas | 2026-09-21 |
| D13 | ¿Qué CRUD presenta cada integrante? | **Javier:** rutinas. **Rances:** peso corporal. **Santiago:** sesiones de entrenamiento. A peso corporal y a sesiones se les agrega editar (H24 y H23) para que los tres sean completos | 2026-09-21 |
| D14 | ¿Dónde se lleva el tablero Scrum? | **Jira**, porque lo pide el curso. Reemplaza a GitHub Projects; GitHub queda para el código y los pull requests | 2026-09-21 |

### Pendientes — no asumir

| ID | Decisión | Por qué importa | Fecha límite |
|---|---|---|---|
| D6 | Identidad visual: aprobar la propuesta del [mockup HTML](mockup/mockup.html) (colores, tipografía y logo) o usar el template que se vea en clase (§10.2) | Define los estilos de la base del frontend | Antes de cerrar T2 (sprint 2) |
| D8 | Confirmar con el profesor las tres piezas que no están en el temario: React Router, Chart.js y spring-security-crypto | Si no se aprueba alguna, cambian la navegación, las gráficas o el cifrado de contraseñas | Entrega del 23 de septiembre |
| D9 | Confirmar los roles de Scrum (Product Owner y rotación de Scrum Master) | Queda registrado en el plan | En la planeación del sprint 2 |

## 14. Documentos del proyecto

| Documento | Contenido |
|---|---|
| [README.md](../README.md) | Presentación, estado por sprint y equipo |
| [PLAN-DE-TRABAJO.md](../PLAN-DE-TRABAJO.md) | Scrum adaptado, tareas, dependencias, definición de terminado y cómo verificar cada tarea |
| [GUIA-INICIO.md](../GUIA-INICIO.md) | Instalación y primer arranque en Windows y macOS |
| [GUIA-GIT.md](../GUIA-GIT.md) | Ramas, pull requests, conflictos y protección de `main` |
| [guias/JIRA.md](guias/JIRA.md) | Crear el proyecto en Jira, importar el backlog y llevar los sprints |
| [EVIDENCIAS.md](../EVIDENCIAS.md) | Participación de cada integrante y trazabilidad en Jira (entrega final) |
| [HISTORIAS.md](HISTORIAS.md) | Product Backlog con criterios de aceptación y diagrama de casos de uso |
| [MODELO-DATOS.md](MODELO-DATOS.md) | Diagrama entidad-relación, diccionario de datos, reglas de negocio y catálogo base |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Stack, capas, autenticación, diagramas de secuencia y decisiones |
| [CONTRATO-API.md](CONTRATO-API.md) | Contrato entre frontend y backend |
| [mockup/mockup.html](mockup/mockup.html) | Cómo se ven las 14 pantallas (propuesta visual), con sus reglas anotadas |
| [mockup/README.md](mockup/README.md) | Ruta, datos y reglas de cada pantalla |

## 15. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-09-11 | v1.0: idea inicial, benchmark con la ficha de GymTracker y decisiones pendientes D1 a D6 |
| 2026-09-14 | v2.0: cierre de D1 a D5; se agregan el peso corporal (F7) y la cuenta con login (F1); benchmark con las capturas de GymTracker; metodología Scrum adaptada; nuevas decisiones pendientes D7 a D9 |
| 2026-09-15 | v2.1: frontend con React (D10); mockup en HTML con una propuesta visual para D6; D8 incluye confirmar React en este corte; MySQL referenciado al temario (§6) |
| 2026-09-21 | v3.0: el proyecto une los cortes y se entrega completo el 3 de octubre (D7). Arquitectura de dos servicios con Node.js y MongoDB para el entrenamiento (D11) y nuevo reparto (D12) |
| 2026-09-21 | v3.1: fechas del curso: sprint 2 el 23 de septiembre (Jira, diseño de la base de datos y repositorio) y final el 9 de octubre (D7). Un CRUD por integrante (D13): editar sesiones y registros de peso. Jira como tablero en lugar de GitHub Projects (D14) |
