# Guion de la demostración — GymRutine

**Entornos de Programación (24542)** · Universidad Industrial de Santander
**Sprint 2: miércoles 23 de septiembre de 2026** · 20 minutos · Todo corre en el Mac de Rances

Lo que pide el curso son los puntos 1 a 3 (Jira, diseño de la base de datos y repositorio con Git). Los puntos 4 a 6 muestran el avance: si algo no está listo, se presenta lo que funcione y se dice qué falta.

## 1. Antes de clase (15 minutos)

**Servicios de fondo.** Los dos deben aparecer como `started`:

```bash
brew services list
```

**Tres pestañas de terminal, una por servicio.** Cada una queda ocupada; no se cierran durante la presentación.

| Pestaña | Comando | Señal de que arrancó |
|---|---|---|
| 1 · Cuentas | `cd ~/Desktop/proyecto-entornos/backend-spring && ./mvnw spring-boot:run` | `Started GymrutineApplication` |
| 2 · Entrenamiento | `cd ~/Desktop/proyecto-entornos/backend-node && npm run dev` | `Servicio de entrenamiento en http://localhost:3000` |
| 3 · Frontend | `cd ~/Desktop/proyecto-entornos/frontend && npm run dev` | `Local: http://localhost:5173/` |

Deja una **cuarta pestaña libre** para los comandos del punto 6. Cada servicio ocupa su pestaña mientras corre: si se reutiliza una, ese servicio se apaga.

**Comprobar que los tres están arriba.** Debe imprimir 200 tres veces:

```bash
curl -s -o /dev/null -w 'cuentas %{http_code}\n' http://127.0.0.1:8080/api/referencias; curl -s -o /dev/null -w 'entrenamiento %{http_code}\n' http://127.0.0.1:3000/salud; curl -s -o /dev/null -w 'frontend %{http_code}\n' http://localhost:5173
```

**Pestañas del navegador, en este orden:**

1. Jira: el tablero del sprint 2.
2. GitHub: la página principal del repositorio.
3. GitHub: la lista de pull requests.
4. La aplicación: http://localhost:5173.

**También:** MySQL Workbench abierto en la base `gymrutine`, la letra de la terminal grande (`Cmd` y `+`), el modo concentración encendido y una prueba completa del guion, cronometrada.

## 2. El guion

| # | Min | Quién | Qué muestra | Qué dice |
|---|---|---|---|---|
| 0 | 0:30 | Rances | — | Qué es GymRutine en una frase: una aplicación para quien entrena solo, que arma rutinas, registra cada serie y muestra el progreso |
| 1 | 3:00 | Rances | **Jira** | El backlog con las 7 épicas y las 24 historias; el sprint 2 en curso con cada tarjeta asignada; los sprints 3 y 4 planeados con sus fechas. Abre `GR-32` y muestra la descripción, la etiqueta del responsable y el estado *Listo* |
| 2 | 4:00 | Rances y Santiago | **Diseño de la base de datos** | Rances: el diagrama entidad-relación de [MODELO-DATOS.md](MODELO-DATOS.md) y, en Workbench, las 6 tablas reales, los 40 ejercicios del catálogo base y que la contraseña se guarda como hash de 60 caracteres, nunca en texto. Santiago: el modelo de documentos de MongoDB y las dos colecciones, `sesiones` y `registrosPeso` |
| 3 | 3:00 | Javier | **Repositorio con Git** | La estructura del repositorio y los documentos; los 5 pull requests unidos, con el título que empieza por la clave de Jira; uno abierto por dentro, con sus commits y su aprobación; y el flujo que siguen los tres, en [GUIA-GIT.md](../GUIA-GIT.md). La protección de `main` se activa al cerrar esta entrega |
| 4 | 2:00 | Rances | **Arquitectura** | El diagrama de [ARQUITECTURA.md](ARQUITECTURA.md) §1: React, dos servicios y dos bases de datos. Por qué: lo relacional (usuarios, catálogo y rutinas) va en MySQL, y las sesiones de entrenamiento, que cambian de forma, en MongoDB |
| 5 | 3:00 | Javier | **El login funcionando** | Crea una cuenta desde la aplicación, entra, cierra sesión y vuelve a entrar. En Workbench, la fila nueva en `usuario` con su hash |
| 6 | 2:00 | Santiago | **Los dos servicios conectados** | En la terminal: `GET /api/sesiones` sin token responde 401 y con token responde `[]`. Explica que el servicio de entrenamiento le pregunta al de cuentas si el token es válido, y que por eso hay un solo login para los dos |
| 7 | 1:30 | Rances | **Qué sigue** | El sprint 3 (24 al 29 de septiembre) trae las APIs de catálogo, rutinas, sesiones, récords y peso corporal; el sprint 4, las pantallas. La entrega final es el 9 de octubre, con el login y un CRUD por integrante |

Quedan unos 2 minutos de reserva para preguntas.

## 3. Comandos del punto 6

Se pegan en la cuarta pestaña, en este orden:

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"ana@correo.com","contrasena":"clave-segura-1"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
```

```bash
curl -s -w '\nHTTP %{http_code}\n' http://127.0.0.1:3000/api/sesiones
```

```bash
curl -s -w '\nHTTP %{http_code}\n' http://127.0.0.1:3000/api/sesiones -H "Authorization: Bearer $TOKEN"
```

Para el punto 2, en Workbench:

```sql
USE gymrutine;
SELECT COUNT(*) AS ejercicios_base FROM ejercicio WHERE usuario_id IS NULL;
SELECT id, nombre, email, objetivo FROM usuario;
SELECT email, LEFT(contrasena_hash, 7) AS empieza, LENGTH(contrasena_hash) AS largo FROM usuario;
```

Y las colecciones de MongoDB:

```bash
mongosh --quiet gymrutine --eval "db.getCollectionNames()"
```

## 4. Datos de prueba

| Para qué | Datos |
|---|---|
| Cuenta que ya existe | `ana@correo.com` · `clave-segura-1` |
| Cuenta nueva, en vivo | Un email distinto en cada ensayo: `demo1@correo.com`, `demo2@correo.com`… · `clave-demo-2026` |

Si al crear la cuenta sale un 409 porque el email ya existe, no es un problema: se aprovecha para mostrar que la aplicación valida y responde con un mensaje claro.

## 5. Plan B

| Si falla | Qué se hace |
|---|---|
| El frontend no arranca | Javier muestra las pantallas P1 y P2 en el [mockup](mockup/mockup.html), y el registro y el login contra la API real desde Postman |
| Un servicio no arranca | Se muestran las capturas del ensayo, guardadas en `docs/evidencias/` |
| No hay internet o Jira no abre | Se muestran las capturas del tablero: `backlog.png` y `sprint-2-tablero.png` |
| Se acaba el tiempo | Se recortan los puntos 4 y 7, que son los más cortos de explicar |

---

_Última actualización: 2026-09-22_
