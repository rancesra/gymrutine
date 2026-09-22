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

**El sitio del equipo:** https://gymrutine-uis.atlassian.net · espacio **GymRutine**, clave `GR` · tablero **GR board**. Cualquier tarjeta se abre con `https://gymrutine-uis.atlassian.net/browse/` y su clave; por ejemplo, [https://gymrutine-uis.atlassian.net/browse/GR-8](https://gymrutine-uis.atlassian.net/browse/GR-8).

> Jira cambió algunos nombres: a los proyectos ahora los llama **espacios** (*spaces*) y a los *issues*, **elementos de trabajo** (*work items*). Si un menú no coincide exactamente con esta guía, busca la palabra en inglés que va entre paréntesis.

## 1. Crear la cuenta y el sitio (Rances, una vez)

1. Entra a https://www.atlassian.com/software/jira/free y regístrate con tu correo. El plan **Free** sirve hasta para 10 personas, no vence y no pide tarjeta.
2. Cuando te pida el nombre del sitio, usa uno como `gymrutine-uis`. La dirección queda, por ejemplo, `https://gymrutine-uis.atlassian.net`.
3. Al terminar el registro, Jira puede crear solo un espacio de ejemplo, con tarjetas `SCRUM-1` y `SCRUM-2`. Ese queda *team-managed*: mándalo a la papelera (**··· → Configuración del espacio → ··· → Mover a la papelera**) y crea el bueno en el paso 2.

## 2. Crear el espacio del proyecto (Rances, una vez)

1. En la barra lateral, **+** junto a **Espacio** → plantilla **Scrum** → **Usar plantilla**.
2. Tipo: **gestionado por la empresa** (*company-managed*). **Esto es importante:** solo así la importación del paso 4 mete cada historia dentro de su épica. En los *team-managed*, Jira no lo permite.
3. Nombre: `GymRutine`. Clave: `GR`. Con esa clave, las tarjetas se llaman `GR-1`, `GR-2`, etc.
4. En **Vamos a configurar tu espacio**, deja apagado *Empezar con actividades de ejemplo*. En **Estados**, agrega **En revisión** justo **después** de *En curso*: el primer estado de la lista es en el que empieza toda actividad nueva.

## 3. Invitar a Javier y a Santiago (Rances, una vez)

1. Al crear el espacio, Jira muestra **Tu espacio está listo** con un campo para invitar: escribe el correo completo de cada uno y elige el rol **Administrators**. También se puede hacer después desde **Invitar personas** (*Invite people*).
2. En el espacio, **Configuración del espacio → Personas** (*Space settings → People*), agrégalos con el rol **Administrador** (*Administrator*), para que puedan mover, editar y crear tarjetas.
3. Ellos aceptan la invitación desde el correo.

## 4. Importar el backlog (Rances, una vez)

El archivo es [`docs/guias/jira-backlog.csv`](jira-backlog.csv):

- **7 épicas:** A a F, las del [backlog](../HISTORIAS.md), más G, base técnica y entregas.
- **24 historias**, cada una con su texto, sus criterios de aceptación y sus endpoints.
- **22 tareas técnicas**, las T del plan, cada una con el enlace a su sección.

Cada elemento lleva tres etiquetas: su sprint (`sprint-2`, `sprint-3` o `sprint-4`), su responsable (`rances`, `javier` o `santiago`) y su épica (`epica-a` a `epica-g`).

Pasos:

1. **Configuración (⚙) → Sistema** (*Settings → System*) → **Importación de sistema externo** (*External system import*) → **CSV**. Se abre un asistente de seis pasos.
2. **Configurar espacio:** en *Use settings from an existing project* elige **GymRutine**. El nombre y la plantilla se llenan solos; en *Mostrar más sobre el espacio* revisa que la clave sea `GR`.
3. **Subir CSV:** `jira-backlog.csv` (en Finder, `Cmd + Shift + G` y `~/Desktop/proyecto-entornos/docs/guias/jira-backlog.csv`), codificación **UTF-8** y delimitador **coma**. No hace falta archivo de configuración.
4. **Asociar campos:**

   | Columna del CSV | Campo de Jira |
   |---|---|
   | `Issue ID` | *Work item id* |
   | `Issue Type` | *Work Type* |
   | `Summary` | *Resumen* |
   | `Parent` | **Principal** (así se llama en español el campo *Parent*) |
   | `Priority` | *Prioridad* |
   | `Labels` (una fila por las tres columnas) | *Etiquetas* |
   | `Epic Name` | **No se incluye:** quita el visto de *Incluir en la importación*. Jira ya no tiene ese campo; el nombre de la épica es su *Resumen* |
   | `Description` | *Descripción* |

5. **Asociar valores:** `Epic` → *Epic*, `Story` → *Story*, `Task` → *Task*.
6. **Mover usuarios:** dice que no hay usuarios en el CSV. Es lo esperado: se asignan en el paso 5.
7. **Revisar detalles:** 1 espacio (GymRutine, gestionado por la empresa), 7/8 campos, 3 tipos de actividad y **53 actividades**. Importa.

Al terminar aparece un aviso amarillo: Jira reindexa las actividades hasta por 12 horas y, mientras tanto, las búsquedas con JQL, los filtros y los informes pueden no mostrar todo. Es normal; en ese tiempo trabaja desde el **Backlog**.

**Claves que quedan:** épicas `GR-1` a `GR-7`; historias H1 a H24 = `GR-8` a `GR-31` (H*n* = GR-*n+7*); tareas `GR-32` a `GR-53`:

| Clave | Tarea | Clave | Tarea |
|---|---|---|---|
| `GR-32` | T4 API de cuenta | `GR-43` | Jira |
| `GR-33` | T5 API de catálogo | `GR-44` | T1 Base del servicio de cuentas |
| `GR-34` | T6 API de rutinas | `GR-45` | T2 Base del frontend |
| `GR-35` | T7 API de sesiones | `GR-46` | T3 Base del servicio de entrenamiento |
| `GR-36` | T8 Algoritmo de récords | `GR-47` | Colección de Postman |
| `GR-37` | T8 API de récords | `GR-48` | P3 Inicio |
| `GR-38` | T9 API de progreso | `GR-49` | Datos de demostración |
| `GR-39` | T10 API de peso corporal | `GR-50` | Pulido en celular |
| `GR-40` | `GraficaLinea` | `GR-51` | Pruebas de punta a punta |
| `GR-41` | T0 Documentación y arquitectura | `GR-52` | Evidencias |
| `GR-42` | Diseño de la base de datos | `GR-53` | Ensayo de la sustentación |

**Para comprobarlo:** en el backlog, la columna de épica de `GR-21 H14 — Registrar una sesión de entrenamiento` debe decir `D. Entrenamiento (CRUD de Santiago)`.

**Si algo sale mal:**

- Si las actividades importadas quedan en otro estado (por ejemplo, *En revisión*), en el Backlog usa **Select all** y **Cambiar estado → Por hacer**. Para confirmar que el flujo está bien, crea una tarjeta de prueba: debe nacer en *Por hacer*.
- Si Jira no te deja eliminar una tarjeta, agrégate tú también al rol **Administrators** del espacio (**Configuración del espacio → Personas**): ser dueño del sitio no da ese permiso dentro del espacio.
- Si la importación falla por el campo *Parent*, borra lo importado y vuelve a importar sin relacionar `Parent`.
- Después pon cada elemento en su épica en bloque: filtra por su etiqueta `epica-a` a `epica-g` y usa el cambio masivo del paso 5, pero con el campo *Parent*.
- Si no logras resolverlo, avísame con una captura del error.

## 5. Crear los sprints y repartir las tarjetas (Rances, una vez)

**Los sprints.** Jira ya creó uno vacío, *GR Sprint 1*: en su menú **•••** elige **Editar sprint** y conviértelo en el *Sprint 2*. Crea los otros dos con **Crear sprint** (*Create sprint*). Quedan así:

| Nombre | Fechas | Objetivo |
|---|---|---|
| Sprint 2 | 21 al 23 de septiembre | Bases de los tres proyectos, login y Jira: entrega del 23 |
| Sprint 3 | 24 al 29 de septiembre | Las APIs de catálogo, rutinas, sesiones, récords y peso corporal |
| Sprint 4 | 30 de septiembre al 9 de octubre | Las pantallas de punta a punta, evidencias y entrega final |

**Llevar cada tarjeta a su sprint,** desde el **Backlog:**

1. En el filtro **Etiqueta** elige `sprint-2`: quedan solo esas tarjetas.
2. Haz clic en la primera y **Shift + clic** en la última para seleccionarlas todas.
3. Arrástralas al *Sprint 2*.
4. Repite con `sprint-3` y `sprint-4`, y quita el filtro.

Cuando pase el aviso de reindexación, también sirve el cambio masivo: **Filtros → Buscar elementos de trabajo**, JQL `project = GR AND labels = sprint-2`, **••• → Cambio masivo → Editar → Sprint**.

Las épicas no van en ningún sprint.

**Asignar cada tarjeta a su responsable,** cuando Javier y Santiago ya hayan aceptado la invitación:

1. Cuando pase el aviso de reindexación, haz el cambio masivo con `labels = rances`, `labels = javier` y `labels = santiago`.
2. Esta vez cambia la **Persona asignada** (*Assignee*).

En las historias que hacen dos personas, la tarjeta es de quien hace la pantalla. La API es una tarea aparte con su propio responsable: por ejemplo, H1 es de Javier y "T4 API de cuenta" es tuya.

## 6. Ajustar el tablero y empezar el sprint 2 (Rances, una vez)

1. **Configuración del tablero → Columnas** (*Board settings → Columns*): el tablero debe quedar **Por hacer → En curso → En revisión → Listo**. Si *En revisión* no existe, agrégala entre *En curso* y *Listo*.
2. En el backlog, **Iniciar sprint** (*Start sprint*) en el *Sprint 2*, con sus fechas y su objetivo.
3. Mueve a **Listo** lo que ya está hecho: *T0 Documentación y arquitectura* y *Diseño de la base de datos (MySQL y MongoDB)*.

## 7. Cómo se usa cada día (los tres)

| Cuándo | Qué haces en Jira |
|---|---|
| Empiezas una tarjeta | La pasas a **En curso**. Debe estar asignada a ti |
| Abres el pull request | La pasas a **En revisión**. El **título del PR empieza con su clave**: `GR-34 T6: API de rutinas`. Así se ve qué PR resolvió qué tarjeta |
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

**Para que el profesor vea el tablero:** el plan Free no permite acceso público. Si lo pide, invítalo con su correo (paso 3) con el rol **Viewer** (*Observador*): el plan admite hasta 10 personas.

## 9. Opcional: ver los PR dentro de Jira

La app gratuita **GitHub for Atlassian** muestra en cada tarjeta los pull requests y commits que llevan su clave. Es la mejor evidencia de trazabilidad.

Para instalarla: en Jira, **Aplicaciones → Explorar más aplicaciones** (*Apps → Explore more apps*) → *GitHub for Atlassian*. Después conectas la cuenta de GitHub `rancesra` y eliges el repositorio `gymrutine`. Hace falta ser administrador en los dos lados, así que la instala Rances.

---

_Última actualización: 2026-09-21_
