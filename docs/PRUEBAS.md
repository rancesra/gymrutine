# Pruebas de punta a punta — GymRutine

**Tarjeta de Jira:** [GR-51](https://gymrutine-uis.atlassian.net/browse/GR-51) · **Responsable:** Santiago · **Fecha:** miércoles 4 de noviembre de 2026

Recorrido completo de la aplicación con los tres servicios encendidos (Spring Boot, Node.js y React), como lo haría un usuario, más los casos del servicio de entrenamiento contra el servicio de cuentas real. Cada fila dice qué se hizo y qué pasó.

## 1. Entorno

| Pieza | Versión o detalle |
|---|---|
| Código | `main` en el commit `95ee1fb` (PR #17), más la corrección de la sección 5 |
| Servicio de cuentas | Spring Boot 4.1.1 con Java 25, sobre MySQL 8.4 |
| Servicio de entrenamiento | Node.js 24 con Express 5, sobre MongoDB 8.0 |
| Frontend | React con Vite, abierto en Chrome 156 sin ventana, a **360 px** de ancho (celular) |
| Datos | Bases aparte, `gymrutine_prueba` en MySQL y en MongoDB, creadas vacías para estas pruebas y borradas al terminar. Las bases `gymrutine` de trabajo no se tocaron |

Las pantallas de Récords (P12) y de Progreso (P11) todavía no estaban en `main`, así que las API de récords y de progreso se comprobaron con las peticiones que harán esas pantallas (sección 3, R8).

## 2. Pruebas automáticas

| Proyecto | Comando | Resultado |
|---|---|---|
| Servicio de entrenamiento | `npm test` en `backend-node/` | **47 de 47** pruebas pasan: regla de récords, validación y resumen de sesiones, récords vigentes, progreso y peso corporal |
| Servicio de cuentas | `./mvnw test` en `backend-spring/` | **27 de 27** pruebas pasan: catálogo (12), rutinas (10), manejo de errores (4) y arranque (1) |
| Frontend | `npm run lint` y `npm run build` en `frontend/` | Sin avisos y compila |

## 3. Recorrido completo en la aplicación

El recorrido del plan de trabajo (T11): cuenta → rutina → entrenar → récord → progreso → peso. En todas las pantallas se revisó la consola del navegador: **no hubo ningún error ni aviso**.

| # | Qué se hizo | Resultado | ¿Pasa? |
|---|---|---|---|
| R1 | Crear una cuenta en P2 (nombre, email, contraseña y objetivo Fuerza) | Entra a la aplicación con la sesión iniciada | Sí |
| R2 | Crear la rutina "Pecho y tríceps" en P6 con press de banca y extensión de tríceps | Se guarda: `GET /api/rutinas` la devuelve con 2 ejercicios. El selector muestra por defecto solo los ejercicios recomendados para el objetivo; para agregar el de tríceps hay que desactivar "Solo recomendados" | Sí |
| R3 | En Mis rutinas (P5), botón **Entrenar** | Abre P7 sin la barra de navegación; como es la primera vez, los pesos salen vacíos | Sí |
| R4 | Llenar y marcar las 8 series, **Terminar y guardar** | P8: "¡Sesión guardada!", 1.487,5 kg, 2 ejercicios, 8 series, 40 repeticiones y "¡Nuevos récords!" (la primera vez de cada ejercicio) | Sí |
| R5 | Entrenar otra vez subiendo el press a 60 kg | Las filas salen con lo de la vez anterior (50, 50, 55, 55) y "Tu récord: 55 kg"; 3 filas se marcan como posible récord. P8: "¡Nuevo récord! Press de banca con barra 60 kg × 5 · Tu marca anterior era 55 kg" | Sí |
| R6 | Historial (P9) | Las 2 sesiones, de la más reciente a la más antigua, con su volumen y la etiqueta de récords | Sí |
| R7 | Detalle (P10) → **Editar sesión**: bajar a 50 kg las series 3 y 4 del press | Se guarda y se recalculan los récords: la marca pasa a la serie 2 (57,5 kg) y el volumen del press baja de 1.162,5 a 1.062,5 kg | Sí |
| R8 | API de récords y de progreso con esas sesiones | `GET /api/records` → press 57,5 × 5 y tríceps 22,5 × 5. `GET /api/progreso/ejercicios` → los dos ejercicios con 2 sesiones. Los puntos de progreso del press salieron en orden equivocado: así se encontró el error de la sección 5 | Sí, tras la corrección |
| R9 | Detalle → **Eliminar sesión** | Pide "¿Eliminar esta sesión? Se recalcularán tus récords.", vuelve al historial con 1 sesión y el récord del press vuelve a 55 × 5 | Sí |
| R10 | Peso corporal (P13): registrar 78,4 kg | `GET /api/peso-corporal` lo devuelve con la fecha de hoy | Sí |
| R11 | Inicio, Rutinas, Catálogo, Historial, Peso, Perfil y Entrenar a 360 px | Ninguna de las 7 pantallas tiene scroll horizontal | Sí |

## 4. Servicio de entrenamiento contra el servicio de cuentas real

Casos del contrato (§7, §8 y §10) con dos cuentas, A y B, y rutinas creadas con la API de rutinas de Spring.

| # | Caso | Resultado | ¿Pasa? |
|---|---|---|---|
| A1 | `GET /api/sesiones` sin token | 401 `NO_AUTENTICADO` | Sí |
| A2 | Con un token inventado | 401 "La sesión no es válida o ya venció" | Sí |
| A3 | `POST /api/sesiones` válido con la rutina de A | 201 con el nombre de la rutina copiado y el `resumen` | Sí |
| A4 | A registra una sesión con la rutina de B | 400 con `campos.rutinaId` | Sí |
| A5 | B pide la sesión de A | 404 `SESION_NO_ENCONTRADA` | Sí |
| A6 | B intenta eliminar la sesión de A | 404 | Sí |
| A7 | Fecha futura, 0 minutos y 500,5 kg | 400 con `fechaInicio`, `duracionMinutos` y `registros[0].series[0].pesoKg` | Sí |
| A8 | `ultimos-registros` de la rutina de A | Un elemento por ejercicio de la rutina, con su récord y sus series | Sí |
| A9 | `ultimos-registros` de la rutina de B pedido por A | 404 `RUTINA_NO_ENCONTRADA` | Sí |
| A10 | Renombrar la rutina después de registrar una sesión | La sesión conserva el nombre que tenía al registrarse | Sí |
| A11 | Eliminar la rutina en Spring y registrar una sesión con ella | 400 con `campos.rutinaId` | Sí |
| A12 | Historial después de eliminar la rutina | La sesión sigue, con el nombre de la rutina | Sí |
| A13 | `PUT` de A sobre su sesión | 200 con la duración y el volumen nuevos | Sí |
| A14 | `DELETE` de A sobre su sesión, dos veces | 204 y después 404 | Sí |
| A15 | Récords y progreso de B | Solo ve sus propios datos, no los de A | Sí |
| A16 | `PUT` agregando un ejercicio, o quitando todos | 400 en los dos casos | Sí |
| A17 | Con el servicio de cuentas apagado | 503 `SERVICIO_NO_DISPONIBLE` | Sí |

## 5. Errores encontrados

| # | Error | Dónde | Estado |
|---|---|---|---|
| 1 | **Editar una sesión le borraba los segundos a su hora de inicio.** El campo de fecha de P10 solo maneja minutos y al guardar se enviaba `:00`. Si había otra sesión en el mismo minuto, la editada quedaba antes que ella, y cambiaban el orden del historial, del progreso y del cálculo de récords | `frontend/src/paginas/PaginaSesion.jsx` | **Corregido** en el mismo pull request que este documento: si la fecha no se cambia, se conserva la original con sus segundos. Se comprobó con dos sesiones a las 18:00:10 y 18:00:40: al editar solo un peso, la segunda conserva 18:00:40 y el progreso queda en orden. Cambiar la fecha de verdad sigue funcionando |

## 6. Cómo repetir las pruebas

1. Las pruebas automáticas: `npm test` en `backend-node/`, `./mvnw test` en `backend-spring/`, y `npm run lint` y `npm run build` en `frontend/`.
2. Encender los tres servicios ([guía de inicio](../GUIA-INICIO.md)) y seguir las filas R1 a R11 desde http://localhost:5173.
3. Las API de récords y de progreso, mientras no estén sus pantallas, se consultan desde la consola del navegador (F12), con la sesión iniciada:

   ```js
   const api = (ruta) => fetch(ruta, { headers: { Authorization: 'Bearer ' + localStorage.getItem('gymrutine.token') } }).then((r) => r.json())
   console.table(await api('/api/records'))
   console.table(await api('/api/progreso/ejercicios'))
   ```

4. Los casos de la sección 4 se pueden repetir con la colección de Postman (`postman/`), cuando la rama de Rances (`t11-inicio-records-perfil`) esté en `main`: ya trae los nueve endpoints de sesiones, récords y progreso.

---

_Última actualización: 2026-11-04_
