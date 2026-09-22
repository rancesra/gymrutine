# Guía de inicio — GymRutine

Pasos para dejar tu computador listo: instalar las herramientas, crear la base de datos y clonar el proyecto. Sirve para **Windows** y para **macOS**; cuando un paso cambia entre los dos, se indica.

- En **Windows**, los comandos se escriben en **PowerShell**, la terminal de VS Code.
- En **macOS**, en la app **Terminal** o en la terminal de VS Code.

> **¿Ya instalaste Git, el JDK 21 y VS Code para el proyecto teambsoft?** Salta al paso 1.4. Te faltan Node.js 24 (si no lo tienes), MySQL con Workbench, MongoDB con Compass y Postman.

## 0. Acceso al repositorio y a Jira

1. Necesitas una cuenta de GitHub.
2. Acepta la invitación de colaborador que te llegó por correo, o entra a https://github.com/rancesra/gymrutine/invitations. Sin aceptarla puedes descargar el repositorio, pero no subir cambios.
3. Acepta también la invitación a **Jira** que te llega por correo. Jira es el tablero del equipo, y el curso lo revisa ([guía de Jira](docs/guias/JIRA.md)).

## 1. Instalar las herramientas

| Herramienta | Para qué |
|---|---|
| Git | Control de versiones |
| JDK 21 (Temurin) | Compilar y ejecutar el servicio de cuentas (Spring Boot) |
| VS Code, con sus extensiones | Editor |
| Node.js 24 LTS | Ejecutar el servicio de entrenamiento y el frontend de React |
| MySQL Community Server 8.4 LTS | Base de datos del servicio de cuentas |
| MySQL Workbench | Ver las tablas y los datos |
| MongoDB Community Server 8.0 y Compass | Base de datos del servicio de entrenamiento, y su visor |
| Postman | Probar la API |

**No hace falta instalar Maven:** el proyecto trae el Maven Wrapper (`mvnw`), que lo descarga solo. **Tampoco hace falta Docker.**

**Qué instalar primero.** Al final, los tres necesitan todo. Pero para empezar la primera tarea basta con esto:

| Quién | Para su primera tarea | Lo demás, cuando pueda |
|---|---|---|
| Rances (T1 y T4) | Git, JDK 21, VS Code, MySQL con Workbench y Postman | Node.js 24, MongoDB y Compass |
| Javier (T2) | Git, VS Code y Node.js 24 | JDK 21 y MySQL con Workbench (los necesita el 24 para la API de catálogo), MongoDB, Compass y Postman |
| Santiago (T3) | Git, VS Code, Node.js 24, MongoDB con Compass y Postman | JDK 21 y MySQL con Workbench |

El computador donde se presente la demostración del miércoles 23 necesita todo, porque ahí corren los dos servicios, las dos bases de datos y el frontend.

### 1.1 Git

- **Windows:** https://git-scm.com/downloads/win. Deja las opciones por defecto. Dos de ellas importan:
  - *Checkout Windows-style, commit Unix-style line endings*: evita problemas de finales de línea entre Windows y Mac.
  - *Git Credential Manager*: es lo que te pedirá iniciar sesión en GitHub la primera vez que subas cambios.
- **macOS:** abre Terminal y escribe `git --version`. Si no está instalado, macOS ofrece instalar las *Command Line Tools*: acepta.

### 1.2 JDK 21 (Temurin)

Descárgalo de https://adoptium.net/temurin/releases/?version=21

- **Windows:** el instalador `.msi` para x64. En la pantalla de componentes, **"Set JAVA_HOME variable"** viene desactivado: haz clic en su ícono y elige *Will be installed on local hard drive*.
- **macOS:** el instalador `.pkg`. Elige **aarch64** si tu Mac tiene chip Apple (M1, M2, M3…) o **x64** si tiene procesador Intel. Lo ves en el menú Apple → Acerca de esta Mac.

### 1.3 VS Code

Descárgalo de https://code.visualstudio.com/download. En Windows, deja marcada la opción **Add to PATH**.

Abre Extensiones (`Ctrl+Shift+X` en Windows, `Cmd+Shift+X` en macOS) e instala:

- **Extension Pack for Java**
- **Spring Boot Extension Pack**

### 1.4 Node.js 24 LTS

Descárgalo de https://nodejs.org/es/download: elige la versión **24 (LTS)** y el instalador de tu sistema (`.msi` en Windows, `.pkg` en macOS). Deja las opciones por defecto. Node.js trae `npm`, la herramienta que instala las librerías del frontend y del servicio de entrenamiento.

Si ya tenías Node.js, revisa la versión con `node --version`: sirve la 24 o una más nueva. Algunas librerías del proyecto exigen al menos la 22.

**Windows:** si al usar `npm` en PowerShell aparece que *la ejecución de scripts está deshabilitada en este sistema*, ejecuta esto una sola vez y confirma con `S` (o `Y` si tu Windows está en inglés). Permite que tu usuario ejecute los scripts de npm:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 1.5 MySQL Community Server 8.4 LTS

1. Entra a https://dev.mysql.com/downloads/mysql/
2. En **Select Version** elige **8.4.x LTS**. No elijas 9.x ni 26.x: el equipo usa la 8.4 (la razón está en [ARQUITECTURA.md](docs/ARQUITECTURA.md), decisión DEC-03).
3. En **Select Operating System** elige tu sistema y descarga:
   - **Windows:** el instalador **MSI**.
   - **macOS:** el **DMG** para tu procesador: *ARM* en Mac con chip Apple, *x86* en Mac con Intel.
4. Instálalo con las opciones por defecto, con estos cuidados:
   - **Puerto:** deja **3306**.
   - **Contraseña de `root`:** elige una y **anótala**. La necesitas en el paso 3.
   - **Windows:** deja marcado que MySQL se ejecute como servicio y arranque con Windows.
   - **macOS:** al terminar, MySQL aparece en **Configuración del Sistema → MySQL**, desde donde se enciende y se apaga.

Si la página pide iniciar sesión con una cuenta de Oracle, usa el enlace **"No thanks, just start my download"**.

### 1.6 MySQL Workbench

Descárgalo de https://dev.mysql.com/downloads/workbench/ (la versión que aparezca) e instálalo con las opciones por defecto.

### 1.7 MongoDB Community Server 8.0 y MongoDB Compass

- **Windows:** entra a https://www.mongodb.com/try/download/community y elige **Version 8.0.x**, **Platform Windows x64** y **Package msi**. Instala con la opción **Complete** y deja marcadas **Install MongoDB as a Service** (así arranca solo con Windows) e **Install MongoDB Compass**.
- **macOS:** con Homebrew (si no lo tienes, instálalo desde https://brew.sh):

```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

  Después descarga MongoDB Compass (DMG) de https://www.mongodb.com/try/download/compass.

**Comprobar:** abre Compass → **New connection** → deja `mongodb://localhost:27017` → **Connect**. Deben aparecer las bases `admin`, `config` y `local`. La base `gymrutine` la crea el servicio de entrenamiento la primera vez que arranca.

### 1.8 Postman

Descarga la aplicación de escritorio de https://www.postman.com/downloads/ e instálala.

### Verificar

Cierra VS Code y las terminales, y vuelve a abrirlos para que reconozcan lo que instalaste. Luego:

```bash
git --version
java -version
node --version
npm --version
```

`java -version` debe mostrar la versión **21**, y `node --version`, la 24 o una más nueva. Si `npm --version` da error en Windows, mira la nota del paso 1.4.

## 2. Configurar Git (una sola vez)

Usa el correo de tu cuenta de GitHub, para que tus commits aparezcan a tu nombre:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

Y dos ajustes que evitan problemas al trabajar en equipo (la [guía de git](GUIA-GIT.md) explica para qué sirve cada uno):

```bash
git config --global pull.rebase false
git config --global core.editor "code --wait"
```

No tienes que iniciar sesión en GitHub ahora. La primera vez que hagas `git push` se abrirá el navegador para que autorices tu cuenta.

## 3. Crear la base de datos de MySQL (una sola vez)

La base de MySQL y su usuario se crean a mano **una vez**. Las tablas no: las crea el servicio de cuentas al arrancar. **En MongoDB no hay que crear nada**: el servicio de entrenamiento crea la base `gymrutine`, sus colecciones y sus índices al arrancar.

1. Abre **MySQL Workbench**.
2. En *MySQL Connections*, abre la conexión **Local instance** (o crea una: host `localhost`, puerto `3306`, usuario `root`) y escribe la contraseña de `root` del paso 1.5.
3. En la pestaña de consultas, pega lo siguiente y ejecútalo con el ícono del rayo:

```sql
CREATE DATABASE gymrutine CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'gymrutine'@'localhost' IDENTIFIED BY 'gymrutine';
GRANT ALL PRIVILEGES ON gymrutine.* TO 'gymrutine'@'localhost';
```

4. **Comprueba el usuario nuevo:** crea otra conexión con usuario `gymrutine` y contraseña `gymrutine`, y ábrela. Debe aparecer el esquema `gymrutine`, todavía vacío.

**Los tres usamos el mismo usuario y la misma contraseña**, así la configuración del proyecto funciona igual en todos los computadores. Son credenciales **solo para desarrollo local**: nunca se usan en un servidor.

## 4. Clonar el repositorio

*Clonar* es descargar el repositorio con todo su historial.

- **Windows:** hazlo **fuera de OneDrive**. En muchos Windows, el Escritorio y Documentos se sincronizan con OneDrive, y eso bloquea archivos mientras Git o Maven trabajan. Por ejemplo, en `C:\dev`:

```powershell
mkdir C:\dev
cd C:\dev
git clone https://github.com/rancesra/gymrutine.git
cd gymrutine
code .
```

- **macOS:** por ejemplo, en una carpeta `dev` dentro de tu usuario:

```bash
mkdir -p ~/dev
cd ~/dev
git clone https://github.com/rancesra/gymrutine.git
cd gymrutine
code .
```

`code .` abre la carpeta del proyecto en VS Code. Si en macOS dice `command not found`, abre VS Code, presiona `Cmd+Shift+P` y ejecuta **Shell Command: Install 'code' command in PATH**.

## 5. Arrancar los servicios

> **Disponibles cuando T1 (servicio de cuentas) y T3 (servicio de entrenamiento) estén en `main`.**

Con MySQL y MongoDB encendidos, abre **dos** terminales en VS Code (menú **Terminal → New Terminal**), una por servicio.

### 5.1 Servicio de cuentas (Spring Boot)

- **Windows:**

```powershell
cd backend-spring
.\mvnw.cmd spring-boot:run
```

- **macOS:**

```bash
cd backend-spring
./mvnw spring-boot:run
```

El `.\` de Windows es obligatorio en PowerShell: significa "el archivo que está en esta carpeta". La primera vez tarda unos minutos, porque descarga Maven y las librerías.

**Para comprobar que funciona:** abre http://localhost:8080/api/referencias (deben aparecer los objetivos, los grupos musculares y los equipos) y, en MySQL Workbench, actualiza el esquema `gymrutine`: deben aparecer las 6 tablas.

### 5.2 Servicio de entrenamiento (Node.js)

La primera vez hay que crear tu archivo `.env` a partir del ejemplo e instalar las librerías:

- **Windows:**

```powershell
cd backend-node
Copy-Item .env.ejemplo .env
npm install
npm run dev
```

- **macOS:**

```bash
cd backend-node
cp .env.ejemplo .env
npm install
npm run dev
```

Las siguientes veces basta con `npm run dev`. El `.env` no se sube al repositorio: cada uno tiene el suyo.

**Para comprobar que funciona:** abre http://localhost:3000/salud (debe decir `"estado": "ok"`) y, en MongoDB Compass, actualiza la conexión: debe aparecer la base `gymrutine` con las colecciones `sesiones` y `registrosPeso`.

Para detener cualquiera de los dos servicios, presiona `Ctrl + C` en su terminal.

## 6. Arrancar el frontend

> **Disponible cuando la tarea T2 esté en `main`.**

Deja los dos servicios corriendo (paso 5) y, en **otra** terminal de VS Code:

```bash
cd frontend
npm install
npm run dev
```

1. **`npm install`** descarga las librerías del frontend en la carpeta `frontend/node_modules/`. Se hace la primera vez y cada vez que cambie `package.json` (por ejemplo, después de un `git pull` que lo modifique).
2. **`npm run dev`** arranca Vite en http://localhost:5173. Ábrelo en el navegador: debe aparecer la pantalla de iniciar sesión.

Vite recarga la página sola cada vez que guardas un archivo. Las peticiones a `/api` llegan al backend gracias al proxy de `vite.config.js`. Si el backend está apagado, la app muestra "No se pudo conectar con el servidor".

Para detener el frontend, presiona `Ctrl + C` en su terminal.

## 7. Probar la API con Postman

> **Disponible cuando exista la colección en `postman/`.**

1. En Postman: **Import** → elige los archivos de la carpeta `postman/` (la colección y el entorno).
2. Arriba a la derecha, selecciona el entorno **GymRutine local**.
3. Ejecuta primero *Autenticación → Iniciar sesión*: el token queda guardado en el entorno y las demás peticiones lo usan solas.

## 8. Si cambió el modelo de datos

Los servicios crean y actualizan solos las tablas, las colecciones y los índices, pero **no borran ni renombran** columnas o campos viejos. Cuando alguien avise en el grupo que cambió [MODELO-DATOS.md](docs/MODELO-DATOS.md) de una forma que lo requiera, recrea tus bases locales. **Esto borra todos tus datos de prueba.**

- **MySQL:** detén el servicio de cuentas y ejecuta en MySQL Workbench, conectado como `root`:

```sql
DROP DATABASE gymrutine;
CREATE DATABASE gymrutine CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

  El usuario `gymrutine` y sus permisos se conservan.

- **MongoDB:** detén el servicio de entrenamiento y, en MongoDB Compass, pasa el mouse sobre la base `gymrutine` y elige **Drop database**.

Al arrancar de nuevo los servicios, todo se crea con la estructura nueva.

## 9. Antes de programar

1. Lee el [contrato de API](docs/CONTRATO-API.md) y el [modelo de datos](docs/MODELO-DATOS.md). Son el acuerdo entre los tres y no se cambian sin consultarlo.
2. Busca tu tarea en el [plan de trabajo](PLAN-DE-TRABAJO.md). En [¿Quién espera a quién?](PLAN-DE-TRABAJO.md#quién-espera-a-quién) ves con qué empiezas y de quién dependes.
3. Si tu primera tarea es T2 o T3, sigue su guía paso a paso, con el código ya probado: [T2, frontend](docs/guias/T2-FRONTEND.md) (Javier) o [T3, servicio de entrenamiento](docs/guias/T3-NODE.md) (Santiago).
4. Lee la [guía de git](GUIA-GIT.md): cómo crear tu rama, qué hacer cada día y cómo entregar tu tarea con un pull request.
5. Abre Jira y revisa tus tarjetas del sprint: cómo se mueven está en la [guía de Jira](docs/guias/JIRA.md) §7.

---

_Última actualización: 2026-09-21_
