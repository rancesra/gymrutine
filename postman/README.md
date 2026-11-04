# Colección de Postman — GymRutine

Los **29 endpoints** del [contrato](../docs/CONTRATO-API.md), más los casos de error que vale la pena mostrar: **39 peticiones** en siete carpetas.

| Archivo | Qué es |
|---|---|
| `GymRutine.postman_collection.json` | La colección, con una carpeta por servicio |
| `GymRutine-local.postman_environment.json` | El entorno **GymRutine local**: las dos direcciones, la cuenta de prueba y las variables que la colección va llenando |

## Cómo usarla

1. Enciende los dos servicios ([guía de inicio](../GUIA-INICIO.md) §5).
2. En Postman: **Import** → arrastra los dos archivos de esta carpeta.
3. Arriba a la derecha, selecciona el entorno **GymRutine local**.
4. Ejecuta `1. Cuentas · Autenticación y perfil → POST /auth/login`. El token queda guardado en el entorno y **todas las demás peticiones lo mandan solas**.

Para correrla entera: **Collection Runner → Run GymRutine**. Las peticiones están en orden, así que cada una deja lista a la siguiente: el login guarda el token, `POST /rutinas` guarda `rutinaId`, `POST /sesiones` guarda `sesionId`, y así. Al final, la carpeta *Cierre* elimina lo que creó y cierra la sesión, de modo que se puede correr las veces que haga falta.

## Qué comprueba

Cada petición trae una prueba con el código de estado que promete el contrato, y varias muestran los errores a propósito:

| Caso | Respuesta |
|---|---|
| Iniciar sesión con la contraseña incorrecta | 401 `CREDENCIALES_INVALIDAS` |
| Cualquier endpoint sin token | 401 `NO_AUTENTICADO` |
| `?grupoMuscular=VOLAR` | 400 `VALIDACION_FALLIDA` |
| Crear un ejercicio con el nombre de uno del catálogo base | 409 `EJERCICIO_DUPLICADO` |
| Editar un ejercicio del catálogo base | 403 `EJERCICIO_NO_EDITABLE` |
| Una rutina con el mismo ejercicio dos veces | 400 con el campo señalado |
| Dos registros de peso el mismo día | 409 `PESO_YA_REGISTRADO` |
| Un peso con fecha futura | 400 con el error en `fecha` |
| Usar el token después de cerrar sesión | 401 |

## Detalles que conviene saber

- **Las fechas se calculan solas.** Un script de la colección define `{{hoy}}` y `{{ahora}}` en hora de Colombia, para que ninguna fecha salga futura y la colección sirva cualquier día.
- **Los nombres de los ejercicios propios llevan una marca** (`{{marca}}`), para que al correrla otra vez no choque con el 409 de nombre duplicado.
- **La cuenta de prueba** es `ana@correo.com` / `clave-segura-1`, definida en el entorno. Si tu base está vacía, la primera petición (`POST /auth/registro`) la crea; si ya existe, responde 409 y la colección sigue igual.
- **Cuando se agregue un endpoint nuevo**, entra a la colección en el mismo pull request, con su prueba del código de estado ([plan de trabajo](../PLAN-DE-TRABAJO.md), convenciones).
