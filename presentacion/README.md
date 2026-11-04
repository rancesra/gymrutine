# Presentación — GymRutine

Lo que se necesita para sustentar: los datos de demostración y las capturas de respaldo.

| Archivo | Qué es |
|---|---|
| `cargar-datos-demo.mjs` | Deja la aplicación con datos realistas para la demostración |
| `capturas/` | Capturas de cada pantalla con esos datos, por si un servicio no arranca en el salón |

## Cargar los datos de demostración

Con los dos servicios encendidos ([guía de inicio](../GUIA-INICIO.md) §5), desde la raíz del repositorio:

```bash
node presentacion/cargar-datos-demo.mjs
```

Usa la API, igual que lo haría una persona desde la aplicación: no toca las bases de datos directamente, así que funciona en cualquier computador del equipo y respeta todas las reglas del contrato.

**Qué deja en la cuenta `ana@correo.com` / `clave-segura-1`:**

- Un **ejercicio propio**, para mostrar la diferencia con los 40 del catálogo base.
- **Cuatro rutinas:** Pecho y tríceps, Espalda y bíceps, Pierna y Full body express.
- **Quince sesiones** repartidas en las últimas cinco semanas, tres por semana, con las cargas subiendo poco a poco. Así hay historial, progreso y **nueve récords detectados por el sistema**.
- **Seis registros de peso corporal**, uno por semana, para que la gráfica tenga línea.

Las fechas se calculan desde el día en que se corre, así que la demostración siempre se ve reciente.

**Es idempotente:** si la cuenta ya tiene sesiones, no crea nada y lo avisa. Para volver a empezar hay que borrar sus datos primero:

```bash
mongosh --quiet gymrutine --eval "db.sesiones.deleteMany({}); db.registrosPeso.deleteMany({})"
```

Las rutinas y el ejercicio propio se eliminan desde la aplicación, o con `DELETE` desde [Postman](../postman/README.md).

## Capturas

Antes de la sustentación, con los datos cargados, se guarda una captura de cada pantalla en `capturas/`. Si en el salón falla un servicio, se presenta con ellas; el guion las tiene como plan B ([guion de la demostración](../docs/GUION-DEMO.md)).
