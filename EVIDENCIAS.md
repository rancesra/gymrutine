# Evidencias de participación y trazabilidad — GymRutine

**Entornos de Programación (24542)** · Universidad Industrial de Santander · **Entrega final: viernes 9 de octubre de 2026**
**Repositorio:** https://github.com/rancesra/gymrutine · **Jira:** [gymrutine-uis.atlassian.net](https://gymrutine-uis.atlassian.net/browse/GR), espacio `GymRutine`, clave `GR`

El curso pide adjuntar en el repositorio las **evidencias de participación de cada integrante en el software** y la **trazabilidad del avance del proyecto en Jira**. Este documento las reúne.

**Cómo se llena:**

- Rances lo completa al cerrar cada sprint: el 23 de septiembre, el 29 de septiembre y el 8 de octubre.
- Cada integrante revisa su fila y le agrega sus pull requests.
- Las capturas van en `docs/evidencias/`, con los nombres de la [guía de Jira](docs/guias/JIRA.md) §8.

## 1. Qué sustenta cada integrante

El curso pide mostrar el login y **un CRUD por integrante** ([plan de trabajo](PLAN-DE-TRABAJO.md#un-crud-por-integrante)):

| Integrante | Rol Scrum | En el login | CRUD que presenta | Historias del CRUD | Pantallas | Endpoints |
|---|---|---|---|---|---|---|
| Rances Ramírez | Product Owner | La API: registro, inicio y cierre de sesión, `GET /usuarios/me` e interceptor | **Peso corporal** | H21, H22, H24 | P13 | `GET`, `POST`, `PUT` y `DELETE /peso-corporal` |
| Javier | Scrum Master (sprints 2 y 4) | Las pantallas de iniciar sesión y crear cuenta, y cerrar sesión | **Rutinas** | H10, H11, H12, H13 | P5 y P6 | `GET`, `POST`, `PUT` y `DELETE /rutinas` |
| Santiago | Scrum Master (sprint 3) | La validación del token en el servicio de entrenamiento | **Sesiones de entrenamiento** | H14, H15, H16, H17, H23 | P7 a P10 | `POST`, `GET`, `PUT` y `DELETE /sesiones` |

## 2. Participación en el software

### 2.1 Qué hizo cada uno

| Integrante | Tareas del plan | Pull requests |
|---|---|---|
| Rances | T0 documentación y Jira · T1 base del servicio de cuentas · T4 API de cuenta y perfil · T10 peso corporal y `GraficaLinea` · T8 pantalla de récords · T11 inicio, Postman, datos de demostración y evidencias | *(al cerrar cada sprint)* |
| Javier | T2 base del frontend · T4 pantallas de login y registro · T5 catálogo · T6 rutinas · T9 pantalla de progreso | *(al cerrar cada sprint)* |
| Santiago | T3 base del servicio de entrenamiento · T7 sesiones · T8 algoritmo y API de récords · T9 API de progreso | *(al cerrar cada sprint)* |

### 2.2 Commits y pull requests

Los números salen de git y de GitHub. Se actualizan antes de entregar:

```bash
git shortlog -sn --no-merges
```

| Integrante | Commits | Pull requests unidos | Dónde verlos |
|---|---|---|---|
| Rances | | | https://github.com/rancesra/gymrutine/pulls?q=is%3Apr+author%3Arancesra |
| Javier | | | *(su enlace, con su usuario de GitHub)* |
| Santiago | | | *(su enlace, con su usuario de GitHub)* |

## 3. Trazabilidad en Jira

### 3.1 Sprints

| Sprint | Fechas | Objetivo | Historias terminadas | Capturas en `docs/evidencias/` |
|---|---|---|---|---|
| 2 | 21 al 23 sep | Bases de los tres proyectos, login y Jira | | `sprint-2-tablero.png` · `sprint-2-informe.png` |
| 3 | 24 al 29 sep | Las APIs de catálogo, rutinas, sesiones, récords y peso corporal | | `sprint-3-tablero.png` · `sprint-3-informe.png` |
| 4 | 30 sep al 9 oct | Las pantallas de punta a punta, evidencias y entrega final | | `sprint-4-tablero.png` · `sprint-4-informe.png` |

Además, `backlog.png`: el backlog con las épicas, al inicio del proyecto.

### 3.2 De la historia al código

Cada historia tiene su tarjeta en Jira; la clave abre la tarjeta (hay que tener acceso al sitio). El título de cada pull request empieza con la clave de esa tarjeta ([guía de git](GUIA-GIT.md) §5), así que se puede seguir cualquier historia desde Jira hasta el código.

| Historia | Responsable | Tarjeta de Jira | Pull request | Terminada en el sprint |
|---|---|---|---|---|
| H1 — Crear cuenta | Rances (API) y Javier (pantalla) | [GR-8](https://gymrutine-uis.atlassian.net/browse/GR-8) | | |
| H2 — Iniciar sesión | Rances (API) y Javier (pantalla) | [GR-9](https://gymrutine-uis.atlassian.net/browse/GR-9) | | |
| H3 — Cerrar sesión | Rances (API) y Javier (pantalla) | [GR-10](https://gymrutine-uis.atlassian.net/browse/GR-10) | | |
| H4 — Ver y editar mi perfil | Rances | [GR-11](https://gymrutine-uis.atlassian.net/browse/GR-11) | | |
| H5 — Explorar el catálogo de ejercicios | Javier | [GR-12](https://gymrutine-uis.atlassian.net/browse/GR-12) | | |
| H6 — Ver el detalle de un ejercicio | Javier | [GR-13](https://gymrutine-uis.atlassian.net/browse/GR-13) | | |
| H7 — Crear un ejercicio propio | Javier | [GR-14](https://gymrutine-uis.atlassian.net/browse/GR-14) | | |
| H8 — Editar un ejercicio propio | Javier | [GR-15](https://gymrutine-uis.atlassian.net/browse/GR-15) | | |
| H9 — Eliminar un ejercicio propio | Javier | [GR-16](https://gymrutine-uis.atlassian.net/browse/GR-16) | | |
| H10 — Crear una rutina | Javier | [GR-17](https://gymrutine-uis.atlassian.net/browse/GR-17) | | |
| H11 — Ver mis rutinas | Javier | [GR-18](https://gymrutine-uis.atlassian.net/browse/GR-18) | | |
| H12 — Editar una rutina | Javier | [GR-19](https://gymrutine-uis.atlassian.net/browse/GR-19) | | |
| H13 — Eliminar una rutina | Javier | [GR-20](https://gymrutine-uis.atlassian.net/browse/GR-20) | | |
| H14 — Registrar una sesión de entrenamiento | Santiago | [GR-21](https://gymrutine-uis.atlassian.net/browse/GR-21) | | |
| H15 — Ver el historial de sesiones | Santiago | [GR-22](https://gymrutine-uis.atlassian.net/browse/GR-22) | | |
| H16 — Ver el detalle de una sesión | Santiago | [GR-23](https://gymrutine-uis.atlassian.net/browse/GR-23) | | |
| H17 — Eliminar una sesión | Santiago | [GR-24](https://gymrutine-uis.atlassian.net/browse/GR-24) | | |
| H18 — Detección automática de récords personales | Santiago | [GR-25](https://gymrutine-uis.atlassian.net/browse/GR-25) | | |
| H19 — Ver mis récords personales | Santiago (API) y Rances (pantalla) | [GR-26](https://gymrutine-uis.atlassian.net/browse/GR-26) | | |
| H20 — Ver el progreso de un ejercicio | Santiago (API) y Javier (pantalla) | [GR-27](https://gymrutine-uis.atlassian.net/browse/GR-27) | | |
| H21 — Registrar mi peso corporal | Rances | [GR-28](https://gymrutine-uis.atlassian.net/browse/GR-28) | | |
| H22 — Ver la evolución de mi peso corporal | Rances | [GR-29](https://gymrutine-uis.atlassian.net/browse/GR-29) | | |
| H23 — Editar una sesión | Santiago | [GR-30](https://gymrutine-uis.atlassian.net/browse/GR-30) | | |
| H24 — Corregir un registro de peso | Rances | [GR-31](https://gymrutine-uis.atlassian.net/browse/GR-31) | | |

## 4. Capturas de la aplicación

Una por CRUD, tomada antes de la sustentación, en `docs/evidencias/`:

- `crud-rutinas.png`: una rutina creada, editada y en la lista (Javier).
- `crud-peso.png`: la gráfica y la lista de peso corporal, con un registro corregido (Rances).
- `crud-sesiones.png`: el detalle de una sesión en modo edición (Santiago).
- `login.png`: la pantalla de iniciar sesión.

## 5. Retrospectivas

Lo que funcionó, lo que no y el cambio acordado para el siguiente sprint están en el [plan de trabajo](PLAN-DE-TRABAJO.md#retrospectivas).

---

_Última actualización: 2026-09-21_
