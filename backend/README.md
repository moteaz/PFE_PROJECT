# AR-Bati — Backend

Express + TypeScript + Prisma (SQLite) REST API.

---

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middlewares/     # Auth middleware (requireAuth, requireAdmin)
├── routes/          # Route definitions
├── services/        # Business logic (auth.service, jwt.service)
├── validators/      # Zod schemas for request validation
├── db.ts            # Prisma client instance
└── index.ts         # App entry point

prisma/
├── schema.prisma    # Database schema
├── migrations/      # Auto-generated migrations
└── seed.ts          # DB seed (creates first admin)
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run database migrations & install dependency
```bash
cd backend 
npm install
npm run db:migrate
```

### 4. Seed the database (creates the first admin user)
this for running scripte that create user admin make it once 
```bash
npm run db:seed
```

### 5. Start the dev server
```bash
npm run dev
```
Server runs on `http://localhost:4000`

---

## Auth Flow

| Method | Endpoint          | Access  | Description                        |
|--------|-------------------|---------|------------------------------------|
| POST   | /api/auth/login   | Public  | Returns accessToken + refreshToken as httpOnly cookies |
| POST   | /api/auth/logout  | Public  | Clears both cookies                |
| POST   | /api/auth/refresh | Public  | Issues new accessToken from cookie |
| GET    | /api/auth/me      | Auth    | Returns current user profile       |
| POST   | /api/auth/register| Admin   | Admin registers a new user         |

- `accessToken` expires in **15 minutes**
- `refreshToken` expires in **7 days**
- Both tokens are stored as **httpOnly cookies** (not in localStorage)
- On logout, both cookies are cleared server-side

---

## Useful Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:reset     # Reset the database (WARNING: deletes all data)
```
