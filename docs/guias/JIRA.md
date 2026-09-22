# Guía de Jira — GymRutine

**Para:** Rances, que crea el sitio y el proyecto, y los tres para el uso diario · **Hace falta para:** la entrega del sprint 2, el miércoles 23 de septiembre

El curso pide llevar el proyecto en **Jira**:

1. Crear la cuenta del grupo.
2. Desde esta semana, mantener ahí el avance.
3. En la entrega final, mostrar la trazabilidad en las [evidencias](../../EVIDENCIAS.md).

Jira reemplaza al tablero de GitHub Projects. GitHub queda para el código y los pull requests.

Esta guía deja listo, en unos 30 minutos:

- el proyecto con las **24 historias** en sus **6 épicas**, más una épica de base técnica y entregas;
- las **22 tareas técnicas** del plan;
- los **tres sprints** del curso, con cada tarjeta en su sprint y asignada a su responsable.

Todo sale de [`jira-backlog.csv`](jira-backlog.csv), que se importa de una vez.

> Jira cambió algunos nombres: a los proyectos ahora los llama **espacios** (*spaces*) y a los *issues*, **elementos de trabajo** (*work items*). Si un menú no coincide exactamente con esta guía, busca la palabra en inglés que va entre paréntesis.

## 1. Crear la cuenta y el sitio (Rances, una vez)

1. Entra a https://www.atlassian.com/software/jira/free y regístrate con tu correo. El plan **Free** sirve hasta para 10 personas, no vence y no pide tarjeta.
2. Cuando te pida el nombre del sitio, usa uno como `gymrutine-uis`. La dirección queda, por ejemplo, `https://gymrutine-uis.atlassian.net`.
3. Si al registrarte te ofrece crear el primer espacio, créalo con los datos del paso 2.

## 2. Crear el espacio del proyecto (Rances, una vez)

1. **Crear espacio** (*Create space*) → plantilla **Scrum**.
2. Tipo: **gestionado por la empresa** (*company-managed*). **Esto es importante:** solo así la importación del paso 4 mete cada historia dentro de su épica. En los *team-managed*, Jira no lo permite.
3. Nombre: `GymRutine`. Clave: `GR`. Con esa clave, las tarjetas se llaman `GR-1`, `GR-2`, etc.

## 3. Invitar a Javier y a Santiago (Rances, una vez)

1. Invítalos con su correo desde **Invitar personas** (*Invite people*), en la barra superior o en **Configuración (⚙) → Gestión de usuarios** (*User management*). Deben tener acceso a **Jira**.
2. En el espacio, **Configuración del espacio → Personas** (*Space settings → People*), agrégalos con el rol **Administrador** (*Administrator*), para que puedan mover, editar y crear tarjetas.
3. Ellos aceptan la invitación desde el correo.

## 4. Importar el backlog (Rances, una vez)

El archivo es [`docs/guias/jira-backlog.csv`](jira-backlog.csv):

- **7 épicas:** A a F, las del [backlog](../HISTORIAS.md), más G, base técnica y entregas.
- **24 historias**, cada una con su texto, sus criterios de aceptación y sus endpoints.
- **22 tareas técnicas**, las T del plan, cada una con el enlace a su sección.

Cada elemento lleva tres etiquetas: su sprint (`sprint-2`, `sprint-3` o `sprint-4`), su responsable (`rances`, `javier` o `santiago`) y su épica (`epica-a` a `epica-g`).

Pasos:

1. **Configuración (⚙) → Sistema** (*Settings → System*).
2. En *Import and export*: **Importación de sistema externo** (*External system import*) → **CSV**. Si aparece *Switch to the old experience*, úsalo.
3. Elige `jira-backlog.csv`. Codificación **UTF-8** y delimitador **coma**, como vienen por defecto.
4. Espacio de destino: **GymRutine (GR)**.
5. Relaciona las columnas así:

   | Columna del CSV | Campo de Jira |
   |---|---|
   | `Issue ID` | *Issue Id* (o *Work item ID*) |
   | `Issue Type` | *Issue Type* (o *Work type*) |
   | `Summary` | *Summary* |
   | `Parent` | *Parent* |
   | `Priority` | *Priority* |
   | `Labels` (las tres) | *Labels* |
   | `Epic Name` | *Epic Name*. Si ese campo no aparece, no la importes |
   | `Description` | *Description* |

6. Si Jira te pide relacionar valores, empareja `Epic` con Épica, `Story` con Historia, `Task` con Tarea, y `High`/`Medium`/`Low` con Alta/Media/Baja.
7. **Comenzar la importación** (*Begin Import*). Debe terminar con **53 elementos creados** y sin errores.

**Para comprobarlo:** en el backlog, abre `H14 — Registrar una sesión de entrenamiento`. Su padre debe ser la épica `D. Entrenamiento (CRUD de Santiago)`.

**Si algo sale mal:**

- Si la importación falla por el campo *Parent*, borra lo importado y vuelve a importar sin relacionar `Parent`.
- Después pon cada elemento en su épica en bloque: filtra por su etiqueta `epica-a` a `epica-g` y usa el cambio masivo del paso 5, pero con el campo *Parent*.
- Si no logras resolverlo, avísame con una captura del error.

## 5. Crear los sprints y repartir las tarjetas (Rances, una vez)

**Crear los sprints.** En el **Backlog**, crea tres con **Crear sprint** (*Create sprint*). En el menú **•••** de cada uno, elige **Editar sprint** y ponle esto:

| Nombre | Fechas | Objetivo |
|---|---|---|
| Sprint 2 | 21 al 23 de septiembre | Bases de los tres proyectos, login y Jira: entrega del 23 |
| Sprint 3 | 24 al 29 de septiembre | Las APIs de catálogo, rutinas, sesiones, récords y peso corporal |
| Sprint 4 | 30 de septiembre al 9 de octubre | Las pantallas de punta a punta, evidencias y entrega final |

**Llevar cada tarjeta a su sprint** con un cambio masivo:

1. **Filtros → Buscar elementos de trabajo** (*Filters → Search work items*). Cambia a **JQL** y escribe:

   ```
   project = GR AND labels = sprint-2
   ```

2. En **•••** (*More actions*), elige **Cambio masivo** (*Bulk change*) y selecciona todos.
3. Elige **Editar** (*Edit*), cambia **Sprint** a *Sprint 2* y confirma.
4. Repite con `sprint-3` y `sprint-4`.

Las épicas no van en ningún sprint.

**Asignar cada tarjeta a su responsable,** cuando Javier y Santiago ya hayan aceptado la invitación:

1. Haz el mismo cambio masivo con `labels = rances`, `labels = javier` y `labels = santiago`.
2. Esta vez cambia el **Responsable** (*Assignee*).

En las historias que hacen dos personas, la tarjeta es de quien hace la pantalla. La API es una tarea aparte con su propio responsable: por ejemplo, H1 es de Javier y "T4 API de cuenta" es tuya.

## 6. Ajustar el tablero y empezar el sprint 2 (Rances, una vez)

1. **Configuración del tablero → Columnas** (*Board settings → Columns*). Agrega la columna **En revisión** entre *En curso* y *Listo*. Así el tablero queda: **Por hacer → En curso → En revisión → Listo**.
2. En el backlog, **Iniciar sprint** (*Start sprint*) en el *Sprint 2*, con sus fechas y su objetivo.
3. Mueve a **Listo** lo que ya está hecho: *T0 Documentación y arquitectura* y *Diseño de la base de datos (MySQL y MongoDB)*.

## 7. Cómo se usa cada día (los tres)

| Cuándo | Qué haces en Jira |
|---|---|
| Empiezas una tarjeta | La pasas a **En curso**. Debe estar asignada a ti |
| Abres el pull request | La pasas a **En revisión**. El **título del PR empieza con su clave**: `GR-35 T6 API de rutinas`. Así se ve qué PR resolvió qué tarjeta |
| Se une el PR a `main` | La pasas a **Listo** |
| Encuentras un error | Creas un elemento de tipo **Error** (*Bug*) en el sprint actual |
| Termina el sprint (23 sep, 29 sep y 8 oct) | Rances toma las capturas del paso 8 y usa **Completar sprint** (*Complete sprint*): lo que quede abierto pasa al siguiente |

El daily sigue siendo por escrito en el grupo, y el tablero debe mostrar lo mismo que se dice ahí.

## 8. Evidencias que hay que guardar

Para la entrega final, el curso pide **la trazabilidad del avance en Jira**. Al cerrar cada sprint, guarda estas capturas en `docs/evidencias/` y enlázalas en [EVIDENCIAS.md](../../EVIDENCIAS.md):

| Archivo | Qué captura | Dónde está en Jira |
|---|---|---|
| `sprint-N-tablero.png` | El tablero antes de completar el sprint | **Tablero** |
| `sprint-N-informe.png` | El informe del sprint, con la gráfica de avance (*burndown*) | **Informes → Informe del sprint** (*Reports → Sprint report*) |
| `backlog.png` | El backlog con las épicas (una vez, al inicio) | **Backlog** |

## 9. Opcional: ver los PR dentro de Jira

La app gratuita **GitHub for Atlassian** muestra en cada tarjeta los pull requests y commits que llevan su clave. Es la mejor evidencia de trazabilidad.

Para instalarla: en Jira, **Aplicaciones → Explorar más aplicaciones** (*Apps → Explore more apps*) → *GitHub for Atlassian*. Después conectas la cuenta de GitHub `rancesra` y eliges el repositorio `gymrutine`. Hace falta ser administrador en los dos lados, así que la instala Rances.

---

_Última actualización: 2026-09-21_
