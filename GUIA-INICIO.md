# Guía de inicio — GymRutine

Pasos para dejar tu computador listo: instalar las herramientas, crear la base de datos y clonar el proyecto. Sirve para **Windows** y para **macOS**; cuando un paso cambia entre los dos, se indica.

- En **Windows**, los comandos se escriben en **PowerShell**, la terminal de VS Code.
- En **macOS**, en la app **Terminal** o en la terminal de VS Code.

> **¿Ya instalaste Git, el JDK 21 y VS Code para el proyecto teambsoft?** Salta al paso 1.4 (MySQL). Solo te faltan MySQL, MySQL Workbench, Postman y la extensión Live Server.

## 0. Acceso al repositorio

1. Necesitas una cuenta de GitHub.
2. Acepta la invitación de colaborador que te llegó por correo, o entra a https://github.com/rancesra/gymrutine/invitations. Sin aceptarla puedes descargar el repositorio, pero no subir cambios.

## 1. Instalar las herramientas

| Herramienta | Para qué |
|---|---|
| Git | Control de versiones |
| JDK 21 (Temurin) | Compilar y ejecutar el backend |
| VS Code, con sus extensiones | Editor, y servidor del frontend con Live Server |
| MySQL Community Server 8.4 LTS | Base de datos |
| MySQL Workbench | Ver las tablas y los datos |
| Postman | Probar la API |

**No hace falta instalar Maven:** el proyecto trae el Maven Wrapper (`mvnw`), que lo descarga solo. **Tampoco hace falta Docker ni Node.js.**

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
- **Live Server** (de Ritwick Dey)

### 1.4 MySQL Community Server 8.4 LTS

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

### 1.5 MySQL Workbench

Descárgalo de https://dev.mysql.com/downloads/workbench/ (la versión que aparezca) e instálalo con las opciones por defecto.

### 1.6 Postman

Descarga la aplicación de escritorio de https://www.postman.com/downloads/ e instálala.

### Verificar

Cierra VS Code y las terminales, y vuelve a abrirlos para que reconozcan lo que instalaste. Luego:

```bash
git --version
java -version
```

`java -version` debe mostrar la versión **21**.

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

## 3. Crear la base de datos (una sola vez)

La base de datos y su usuario se crean a mano **una vez**. Las tablas no: las crea el backend al arrancar.

1. Abre **MySQL Workbench**.
2. En *MySQL Connections*, abre la conexión **Local instance** (o crea una: host `localhost`, puerto `3306`, usuario `root`) y escribe la contraseña de `root` del paso 1.4.
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

## 5. Arrancar el backend

> **Disponible cuando la tarea T1 esté en `main`.** Hasta entonces, la carpeta `backend/` no existe.

Con MySQL encendido, en la terminal de VS Code:

- **Windows:**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- **macOS:**

```bash
cd backend
./mvnw spring-boot:run
```

El `.\` de Windows es obligatorio en PowerShell: significa "el archivo que está en esta carpeta". La primera vez tarda unos minutos, porque descarga Maven y las librerías.

**Para comprobar que funciona:**

1. Abre http://localhost:8080/api/referencias en el navegador: deben aparecer los objetivos, los grupos musculares y los equipos.
2. En MySQL Workbench, actualiza el esquema `gymrutine`: deben aparecer las 10 tablas.

Para detener el backend, presiona `Ctrl + C` en la terminal.

## 6. Abrir el frontend

> **Disponible cuando la tarea T2 esté en `main`.**

1. Deja el backend corriendo (paso 5).
2. En VS Code, en el explorador de archivos, haz clic derecho sobre `frontend/index.html` → **Open with Live Server**.
3. Se abre el navegador en `http://127.0.0.1:5500/frontend/index.html`.

Live Server recarga la página sola cada vez que guardas un archivo del frontend.

## 7. Probar la API con Postman

> **Disponible cuando exista la colección en `postman/`.**

1. En Postman: **Import** → elige los archivos de la carpeta `postman/` (la colección y el entorno).
2. Arriba a la derecha, selecciona el entorno **GymRutine local**.
3. Ejecuta primero *Autenticación → Iniciar sesión*: el token queda guardado en el entorno y las demás peticiones lo usan solas.

## 8. Si cambió el modelo de datos

El backend crea y actualiza las tablas solo, pero **no borra ni renombra columnas**. Cuando alguien avise en el grupo que cambió [MODELO-DATOS.md](docs/MODELO-DATOS.md) de una forma que lo requiera, recrea tu base local.

**Esto borra todos tus datos de prueba.** Detén el backend y ejecuta en MySQL Workbench, conectado como `root`:

```sql
DROP DATABASE gymrutine;
CREATE DATABASE gymrutine CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

El usuario `gymrutine` y sus permisos se conservan. Al arrancar de nuevo el backend, las tablas se crean con la estructura nueva.

## 9. Antes de programar

1. Lee el [contrato de API](docs/CONTRATO-API.md) y el [modelo de datos](docs/MODELO-DATOS.md). Son el acuerdo entre los tres y no se cambian sin consultarlo.
2. Busca tu tarea en el [plan de trabajo](PLAN-DE-TRABAJO.md).
3. Lee la [guía de git](GUIA-GIT.md): cómo crear tu rama, qué hacer cada día y cómo entregar tu tarea con un pull request.

---

_Última actualización: 2026-09-14_
