# CanchaYa — Backend (API REST)

API REST del **Sistema de Reservas de Canchas Deportivas**. Node.js + Express + Prisma + PostgreSQL, con autenticación JWT, contraseñas con bcrypt y control de acceso por roles.

> Evaluación Final — Desarrollo de Aplicaciones Web Avanzado (Tecsup). Autor: **David Carhuaz**.

## 🧱 Stack

- **Node.js** + **Express 4** (API REST)
- **Prisma 6** (ORM) + **PostgreSQL**
- **jsonwebtoken** (JWT) + **bcryptjs** (hash de contraseñas)
- **Zod** (validación de entrada)

## 📦 Entidades (3 con CRUD)

| Entidad | Descripción |
|---------|-------------|
| **Usuario** | Cuentas con rol `CLIENTE` / `OPERADOR` / `ADMIN` |
| **Servicio** | Cancha deportiva (fútbol, vóley, básquet, tenis) |
| **Reserva** | Reserva de una cancha en una fecha y rango horario |

## 🔐 Roles y permisos

| Acción | CLIENTE | OPERADOR | ADMIN |
|--------|:------:|:--------:|:-----:|
| Ver catálogo de canchas | ✅ (público) | ✅ | ✅ |
| Crear reserva | ✅ | — | ✅ |
| Ver sus propias reservas | ✅ | ✅ (todas) | ✅ (todas) |
| Confirmar / cancelar reservas | solo cancelar la suya | ✅ | ✅ |
| CRUD de canchas | — | — | ✅ |
| CRUD de usuarios | — | — | ✅ |

## 🚀 Correr en local

```bash
npm install
cp .env.example .env        # y edita DATABASE_URL + JWT_SECRET
npx prisma migrate dev      # crea las tablas
npm run seed                # datos de prueba (canchas + usuarios)
npm run dev                 # http://localhost:4000
```

### Credenciales de prueba (tras el seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMIN | admin@reservas.com | admin123 |
| OPERADOR | operador@reservas.com | operador123 |
| CLIENTE | cliente@reservas.com | cliente123 |

## 📚 Endpoints

### Auth
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/register` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |

### Servicios (canchas)
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/servicios` | público |
| GET | `/api/servicios/:id` | público |
| POST | `/api/servicios` | ADMIN |
| PUT | `/api/servicios/:id` | ADMIN |
| DELETE | `/api/servicios/:id` | ADMIN |

### Reservas
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/reservas` | autenticado (cliente ve solo las suyas) |
| GET | `/api/reservas/:id` | dueño o staff |
| POST | `/api/reservas` | CLIENTE / ADMIN |
| PATCH | `/api/reservas/:id/estado` | OPERADOR / ADMIN |
| PATCH | `/api/reservas/:id/cancelar` | dueño o staff |
| DELETE | `/api/reservas/:id` | ADMIN |

### Usuarios
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/usuarios` | ADMIN |
| POST | `/api/usuarios` | ADMIN |
| PUT | `/api/usuarios/:id` | ADMIN |
| DELETE | `/api/usuarios/:id` | ADMIN |

## ☁️ Deploy en Railway

1. Crea un proyecto en [Railway](https://railway.app) → **New Project** → *Deploy from GitHub repo* (este backend).
2. Agrega un **PostgreSQL** al proyecto (*New → Database → PostgreSQL*).
3. En el servicio del backend, pestaña **Variables**, define:
   - `DATABASE_URL` → referencia la del Postgres (`${{Postgres.DATABASE_URL}}`)
   - `JWT_SECRET` → un texto largo y aleatorio
   - `JWT_EXPIRES_IN` → `7d`
   - `CORS_ORIGIN` → la URL de tu frontend en Vercel (ej. `https://canchaya.vercel.app`)
   - `NODE_ENV` → `production`
4. El `railway.json` ya ejecuta `prisma migrate deploy` en cada despliegue.
5. (Opcional, una sola vez) corre el seed desde el shell de Railway: `npm run seed`.

## 🗂️ Estructura

```
src/
├─ config/prisma.js        # instancia única de Prisma
├─ middleware/             # auth (JWT), roles, validación (Zod), errores
├─ controllers/            # lógica de auth, servicios, reservas, usuarios
├─ routes/                 # definición de rutas REST
├─ utils/                  # JWT, HttpError, asyncHandler
├─ app.js                  # montaje de Express
└─ server.js               # arranque
prisma/
├─ schema.prisma           # modelos + enums
└─ seed.js                 # datos de prueba
```
