# Club de Lectura — Catálogo de libros

Es una página web para que un club de lectura guarde y administre su lista de libros. Para entrar hay que tener una cuenta: solo las personas registradas pueden ver, agregar, editar o eliminar libros.

## 1. Qué es y con qué está hecho

La aplicación tiene tres partes que trabajan juntas, como un restaurante:

- **Lo que ves (frontend):** las pantallas del navegador. Es el comedor.
- **El cerebro (backend):** recibe lo que pides, revisa que tengas permiso y que los datos estén bien. Es la cocina.
- **La bodega (base de datos):** donde se guardan para siempre los usuarios y los libros.

| Parte | Tecnología | Para qué sirve y por qué la elegí |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Es lo que pidió la prueba. Construye las pantallas y protege las páginas privadas. |
| Backend | Node.js + Express + TypeScript | Es sencillo de leer y usa el mismo lenguaje que el frontend. Es un programa aparte, no está mezclado con las pantallas. |
| Base de datos | PostgreSQL | Es lo que pidió la prueba. Guarda la información de forma segura y ordenada. |
| Conexión a la base | Prisma | Permite hablar con la base de datos sin escribir SQL a mano y crea las tablas de forma automática. |
| Revisión de datos | Zod | Comprueba que lo que se envía sea correcto (por ejemplo, que las páginas sean mayores a 0) y devuelve mensajes claros. |
| Contraseñas | bcryptjs | Guarda las contraseñas "revueltas" para que nadie pueda leerlas. |
| Inicio de sesión | JWT en una cookie | Explicado en la sección 6. |
| Programas empaquetados | Docker y Docker Compose | Permiten encender todo con un solo comando, en cualquier computadora. |

Cómo se comunican las partes:

```
Navegador  ──►  Frontend (puerto 3000)  ──►  Backend (puerto 4000)  ──►  Base de datos
```

Organización de las carpetas:

```
club-lectura/
├── docker-compose.yml   ← instrucciones para encender las 3 partes juntas
├── .env.example         ← plantilla de configuración
├── backend/             ← el cerebro
│   ├── prisma/          ← la definición de las tablas de la base de datos
│   └── src/
│       ├── modules/auth/    ← registro e inicio de sesión
│       ├── modules/books/   ← lo relacionado con los libros
│       └── middleware/      ← revisiones previas (¿hay sesión? ¿los datos son válidos?)
└── frontend/            ← lo que ves
    └── src/
        ├── app/             ← las pantallas
        ├── components/      ← piezas reutilizables (formulario, tabla, etc.)
        └── lib/             ← la comunicación con el backend
```

En el backend cada tema se divide en capas, cada una con una sola tarea: la **ruta** recibe la petición, el **controlador** responde, el **servicio** aplica las reglas y el **repositorio** habla con la base de datos.

## 2. Qué necesitas antes de empezar

- **Docker Desktop** (https://docs.docker.com/get-docker/). Es el programa que enciende todo.
- **Git**, para descargar el proyecto.
- Los puertos `3000` y `4000` de tu computadora deben estar libres (no tener otros programas usándolos).

No necesitas instalar Node ni PostgreSQL: Docker ya los trae adentro.

## 3. Cómo ponerlo a funcionar (paso a paso)

1. Abre **Docker Desktop** y espera a que diga que está corriendo.
2. Abre una terminal y descarga el proyecto:
   ```bash
   git clone <URL-DEL-REPOSITORIO>
   ```
3. Entra a la carpeta del proyecto:
   ```bash
   cd club-lectura
   ```
4. Crea el archivo de configuración copiando la plantilla:
   ```bash
   cp .env.example .env
   ```
   El archivo `.env` guarda datos como la contraseña de la base de datos. No se sube a Git por seguridad; por eso se crea a partir de la plantilla `.env.example`, que ya trae valores listos para probar en tu computadora.
5. Enciende todo:
   ```bash
   docker compose up --build
   ```
   La primera vez tarda varios minutos porque descarga e instala lo necesario. Es normal.
6. Cuando termine, abre en tu navegador:
   - La aplicación: http://localhost:3000
   - Comprobar que el backend está vivo: http://localhost:4000/health (debe mostrar `{"status":"ok"}`)

Al encenderse, el backend crea solo las tablas de la base de datos (a esto se le llama *migraciones*) y carga un usuario y algunos libros de ejemplo (a esto se le llama *seed*). No tienes que hacer nada más.

**Para apagarlo:** presiona `Ctrl + C` en la terminal y luego ejecuta `docker compose down`. Tus datos se conservan.

**Para volver a encenderlo:** `docker compose up`.

**Para borrar todo y empezar de cero** (incluidos los libros que hayas creado):
```bash
docker compose down -v
```

## 4. Usuario de prueba

Para entrar sin crear una cuenta:

| Correo | Contraseña |
|---|---|
| `prueba@club.com` | `Prueba123!` |

También se cargan 5 libros de ejemplo. Si el proceso se repite, no se duplican.

## 5. Lista de endpoints del backend

Un *endpoint* es una dirección a la que el frontend le pide algo al backend. Todas empiezan con `http://localhost:4000`. Las marcadas con "Sí" solo funcionan si ya iniciaste sesión; si no, el backend responde `401` (no autenticado).

| Método | Dirección | ¿Requiere sesión? | Qué hace |
|---|---|---|---|
| GET | `/health` | No | Dice si el backend está funcionando. |
| POST | `/auth/register` | No | Crea una cuenta nueva (nombre, correo y contraseña) e inicia sesión. |
| POST | `/auth/login` | No | Inicia sesión con correo y contraseña. |
| POST | `/auth/logout` | No | Cierra la sesión. |
| GET | `/auth/me` | Sí | Dice quién es el usuario que tiene la sesión abierta. |
| GET | `/books` | Sí | Devuelve la lista de libros. |
| GET | `/books/:id` | Sí | Devuelve un libro en particular. |
| POST | `/books` | Sí | Crea un libro. |
| PUT | `/books/:id` | Sí | Modifica un libro existente. |
| DELETE | `/books/:id` | Sí | Elimina un libro. |

(`:id` se reemplaza por el identificador del libro.)

**Qué significan las respuestas del backend:**

| Código | Significado |
|---|---|
| `200`, `201`, `204` | Todo salió bien. |
| `400` | Los datos enviados no son válidos (por ejemplo, páginas en 0). |
| `401` | No has iniciado sesión, o la contraseña es incorrecta. |
| `404` | Lo que buscas no existe. |
| `409` | Ya existe: un libro con ese ISBN o una cuenta con ese correo. |
| `500` | Falló algo interno del servidor. |

Cuando hay un error, siempre llega con la misma forma, para que el frontend pueda mostrarlo en pantalla:

```json
{ "error": "Datos inválidos", "details": [{ "campo": "paginas", "mensaje": "Las páginas deben ser mayores a 0" }] }
```

**Qué datos tiene cada libro:**

| Campo | Qué es | Regla |
|---|---|---|
| `isbn` | Código único del libro | Obligatorio y no se puede repetir |
| `titulo` | Título | Obligatorio |
| `autor` | Autor | Obligatorio |
| `genero` | Género (Novela, Historia…) | Obligatorio |
| `anio_publicacion` | Año de publicación | Obligatorio, no mayor al año actual |
| `paginas` | Número de páginas | Obligatorio, mayor a 0 |
| `sinopsis` | Resumen | Opcional |
| `created_at` / `updated_at` | Fecha de creación y de última modificación | Los genera el sistema |

## 6. Decisiones técnicas, pendientes y mejoras

### Decisiones y por qué

- **Cómo funciona el inicio de sesión.** Al entrar con tu correo y contraseña, el servidor te da un "pase" (un *token JWT*). Ese pase se guarda en una *cookie* especial (`httpOnly`) que el código de la página no puede leer, lo que protege contra el robo del pase si alguien logra meter código malicioso. El pase está firmado con una clave secreta del servidor, así que no se puede falsificar, y caduca a las 24 horas. En cada petición, el navegador envía el pase y el backend lo revisa. Alternativa que consideré: *sesiones* guardadas en el servidor; se pueden cancelar al instante, pero obligan a guardar más información en la base de datos.
- **Contraseñas.** Nunca se guardan tal cual: se transforman con bcrypt en un texto revuelto que no se puede deshacer, así que ni quien administre el sistema puede leerlas. Además, si alguien se equivoca de correo o de contraseña, el mensaje es el mismo, para no revelar qué correos están registrados.
- **La protección está en dos lugares.** El frontend manda a `/login` a quien no tiene sesión (es una comodidad), pero quien realmente impide el acceso es el backend, que responde `401`. Así, aunque alguien se saltara las pantallas, no podría ver ni cambiar datos.
- **Pantallas que piden los datos desde el navegador.** Las pantallas del catálogo le piden los datos al backend directamente desde el navegador. Es más simple de entender que hacer que el servidor de Next.js los pida.
- **La base de datos se crea sola.** Las tablas se crean con *migraciones* (instrucciones guardadas en el proyecto), no a mano, así cualquier persona obtiene exactamente la misma base.
- **Errores ordenados.** Todos los errores pasan por un solo lugar que los convierte en una respuesta con el mismo formato. Un ISBN repetido se traduce a `409`.
- **Nombres de campos** iguales a los del enunciado de la prueba (`anio_publicacion`, `created_at`).
- **Cosas que supuse** donde el enunciado no decía:
  - El ISBN es un texto único cualquiera; no se valida su formato oficial.
  - Al editar un libro se envían todos sus datos de nuevo (`PUT`).
  - Una sinopsis vacía se guarda como "sin sinopsis".
  - Al registrarte, la sesión se inicia automáticamente.
  - Cualquier persona con sesión puede modificar cualquier libro (no hay roles).
- **Las cookies entre el frontend y el backend.** En tu computadora ambos están en `localhost` (puertos 3000 y 4000), por eso la cookie funciona en los dos. Si se publicara en internet, tendrían que estar en el mismo dominio (por ejemplo `app.midominio.com` y `api.midominio.com`) y usar HTTPS con `COOKIE_SECURE=true`.

### Lo que falta

- No hay pruebas automáticas.
- No hay un límite de intentos para iniciar sesión (alguien podría probar contraseñas sin parar).
- No hice los puntos extra: búsqueda, paginación, roles, estado de lectura ni publicación en internet.

### Qué mejoraría con más tiempo

- Agregar pruebas automáticas del backend y del flujo completo (registrarse, entrar, crear un libro).
- Limitar los intentos de inicio de sesión y hacer que el pase dure menos tiempo, con uno de renovación, para poder cancelar sesiones.
- Agregar búsqueda y paginación en la tabla, y dos tipos de usuario: `admin` (puede todo) y `consulta` (solo lee).
- Usar npm ci en los Dockerfiles y hacer que el backend no corra con permisos de administrador dentro del contenedor.
- Revisar automáticamente cada cambio antes de aceptarlo (CI).

## Cómo se organizó el trabajo en Git

Se siguió *GitHub Flow*: la rama `main` siempre funciona, cada tarea se hizo en su propia rama (por ejemplo `feature/auth-backend` o `feature/crud-backend`), y al terminar se unió a `main` mediante un Pull Request (una solicitud de revisión). Los commits tienen mensajes cortos y descriptivos, como `feat:` (algo nuevo), `fix:` (una corrección), `chore:` (mantenimiento) y `docs:` (documentación), según [Conventional Commits](https://www.conventionalcommits.org/).