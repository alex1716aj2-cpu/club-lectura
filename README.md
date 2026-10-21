# Club de Lectura — Catálogo de libros

Aplicación web para que un club de lectura administre su catálogo de libros. Solo los usuarios registrados pueden consultarlo y modificarlo.

## 1. Descripción y stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript | Requisito de la prueba. Rutas protegidas con `middleware.ts`. |
| Backend | Node.js + Express 4 + TypeScript | Servicio independiente y fácil de leer. Mismo lenguaje que el frontend. |
| Base de datos | PostgreSQL 16 en Docker | Requisito de la prueba. |
| ORM y migraciones | Prisma 6 | Esquema declarativo, migraciones versionadas y cliente tipado. |
| Validación | Zod | Esquemas reutilizables y mensajes de error claros. |
| Contraseñas | bcryptjs (10 rondas) | Hash con sal; nunca se guarda texto plano. |
| Autenticación | JWT en cookie `httpOnly` | Ver [decisiones técnicas](#6-decisiones-técnicas-pendientes-y-mejoras). |
| Contenedores | Docker + Docker Compose | Un solo comando levanta todo. |

Arquitectura:

```
Navegador ──► Frontend (Next.js :3000) ──► Backend (Express :4000) ──► PostgreSQL (:5432, volumen pgdata)
     └───────────── fetch con cookie ─────────────┘
```

Estructura del backend (separación de responsabilidades):

```
backend/src/
├── app.ts / server.ts / config.ts
├── middleware/        requireAuth, validate, errorHandler
├── lib/               cliente de Prisma, HttpError
└── modules/
    ├── auth/          routes → controller → service → repository
    └── books/         routes → controller → service → repository
```

## 2. Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose v2.
- Git.
- Los puertos `3000` (frontend), `4000` (backend) y `5432` libres (este último solo se usa dentro de la red de Docker).

No necesitas instalar Node ni PostgreSQL.

## 3. Cómo levantar el proyecto

```bash
git clone <URL-DEL-REPOSITORIO>
cd club-lectura
cp .env.example .env
docker compose up --build
```

Cuando termine de construir:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000 (prueba con `GET /health`)

Al arrancar, el contenedor del backend ejecuta automáticamente las migraciones (`prisma migrate deploy`) y el seed (`prisma db seed`). No hay pasos manuales adicionales.

Los datos persisten en el volumen `pgdata`. Para borrarlos y empezar de cero:

```bash
docker compose down -v
```

> El archivo `.env` no se versiona. `.env.example` trae valores que funcionan en local; cambia `POSTGRES_PASSWORD` y `JWT_SECRET` si lo usas fuera de tu máquina.

## 4. Credenciales del usuario de prueba

| Correo | Contraseña |
|---|---|
| `prueba@club.com` | `Prueba123!` |

El seed también crea 5 libros de ejemplo. Es idempotente: se puede ejecutar varias veces sin duplicar datos.

## 5. Endpoints del backend

Base: `http://localhost:4000`. Los endpoints de `/books` requieren la cookie de sesión y responden `401` si no existe o es inválida.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Estado del servicio. |
| POST | `/auth/register` | No | Registra un usuario (`nombre`, `email`, `password`) e inicia sesión. |
| POST | `/auth/login` | No | Inicia sesión (`email`, `password`) y establece la cookie. |
| POST | `/auth/logout` | No | Cierra sesión borrando la cookie. |
| GET | `/auth/me` | Sí | Devuelve el usuario de la sesión actual. |
| GET | `/books` | Sí | Lista los libros. |
| GET | `/books/:id` | Sí | Detalle de un libro. |
| POST | `/books` | Sí | Crea un libro. |
| PUT | `/books/:id` | Sí | Edita un libro (reemplazo completo). |
| DELETE | `/books/:id` | Sí | Elimina un libro. |

Códigos de respuesta: `200/201/204` éxito, `400` datos inválidos, `401` no autenticado o credenciales incorrectas, `404` no encontrado, `409` ISBN o correo duplicado, `500` error interno.

Todos los errores tienen el mismo formato:

```json
{ "error": "Datos inválidos", "details": [{ "campo": "paginas", "mensaje": "Las páginas deben ser mayores a 0" }] }
```

Campos del libro: `isbn` (único), `titulo`, `autor`, `genero`, `anio_publicacion` (≤ año actual), `paginas` (> 0), `sinopsis` (opcional), `created_at`, `updated_at`.

## 6. Decisiones técnicas, pendientes y mejoras

### Decisiones

- **JWT en cookie `httpOnly` (en lugar de sesiones o `localStorage`).** El backend es stateless: no necesita guardar sesiones. La cookie `httpOnly` no es accesible desde JavaScript, lo que reduce el robo del token por XSS; `SameSite=Lax` mitiga CSRF. El token va firmado con `JWT_SECRET` y expira (24 h por defecto). Alternativa considerada: sesiones en servidor, que permiten revocar al instante pero requieren almacenamiento extra.
- **Seguridad de contraseñas.** bcrypt con sal. El login responde el mismo mensaje y compara contra un hash de relleno cuando el correo no existe, para no revelar qué correos están registrados.
- **Rutas protegidas en ambos lados.** El `middleware.ts` de Next consulta `/auth/me` al backend antes de servir `/libros/*` y redirige a `/login` si la sesión no es válida. Es solo comodidad de interfaz: la seguridad real es el `401` del backend.
- **Frontend con componentes de cliente.** Las pantallas del catálogo hacen `fetch` desde el navegador con `credentials: "include"`. Se evita reenviar cookies desde el servidor de Next y el código es más simple de seguir.
- **Prisma y migraciones.** El esquema se crea con `prisma migrate deploy` al arrancar el contenedor; nada se crea a mano.
- **Capas en el backend.** Rutas → controlador → servicio → repositorio. Los errores de dominio se lanzan como `HttpError` y un manejador central los convierte en respuestas JSON consistentes. Los errores de unicidad de Prisma (`P2002`) se traducen a `409`.
- **Nombres de campos de la API** en `snake_case` tal como aparecen en el enunciado (`anio_publicacion`, `created_at`).
- **Supuestos razonables.** El ISBN es un texto único sin validar su formato. `PUT` reemplaza el recurso completo. Una sinopsis vacía se guarda como `null`. El registro inicia sesión automáticamente. Cualquier usuario autenticado puede modificar cualquier libro (no hay roles).
- **Cookie compartida entre puertos.** El frontend (`:3000`) y el backend (`:4000`) comparten el host `localhost`, por eso la cookie viaja a ambos. En producción deben estar bajo el mismo sitio (por ejemplo `app.midominio.com` y `api.midominio.com`) y con `COOKIE_SECURE=true` sobre HTTPS.

### Pendientes

- No hay pruebas automatizadas.
- No hay límite de intentos de login (rate limiting).
- Los `package-lock.json` no están versionados; los Dockerfiles usan `npm install`.
- Ninguno de los puntos extra (búsqueda, paginación, roles, estado de lectura, despliegue) está implementado.

### Qué mejoraría con más tiempo

- Pruebas de integración del backend y pruebas end-to-end del flujo de login y CRUD.
- Rate limiting y bloqueo temporal en el login; expiración corta con refresh token para poder revocar sesiones.
- Paginación y búsqueda en el listado, y roles (`admin` / `consulta`).
- Versionar los lockfiles y usar `npm ci` en los Dockerfiles; ejecutar el contenedor del backend con un usuario sin privilegios.
- Pipeline de CI que corra el build y las pruebas en cada Pull Request.

## Flujo de trabajo en Git

El proyecto sigue GitHub Flow: `main` siempre funcional, una rama por funcionalidad (`chore/docker`, `feature/auth-backend`, `feature/crud-backend`, `feature/frontend-auth`, `feature/frontend-libros`, `docs/readme`), Pull Request hacia `main` y commits con [Conventional Commits](https://www.conventionalcommits.org/).
