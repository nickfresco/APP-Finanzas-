# Finanzas Personales

App de finanzas personales (Next.js 14 + TypeScript + Tailwind + Supabase), portada del prototipo `finance-app.jsx`. Mismo diseño, mismas pantallas (Inicio, Movimientos, Compromisos, Presupuesto, Metas) y mismos cálculos, pero con base de datos real y login por magic link.

## 1. Instalar Node.js

Si no tienes Node.js instalado: descarga la versión **LTS** desde [nodejs.org](https://nodejs.org) e instálala. Verifica con:

```bash
node --version
npm --version
```

## 2. Instalar dependencias

Desde esta carpeta:

```bash
npm install
```

## 3. Crear el proyecto Supabase

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. Ve a **SQL Editor** → *New query*, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Esto crea las tablas (`transactions`, `fixed_expenses`, `installments`, `budgets`, `goals`, `user_settings`) con Row Level Security activada, para que cada usuario solo vea sus propias filas.
3. Ve a **Settings → API** y copia la **Project URL** y la **anon public key**.

## 4. Variables de entorno

Copia `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Y completa con los valores del paso anterior:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-public-key
```

## 5. Configurar el magic link en Supabase

En **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (en producción, la URL de tu dominio en Vercel)
- **Redirect URLs**: agrega `http://localhost:3000/auth/callback` (y luego, cuando despliegues, `https://tu-dominio.vercel.app/auth/callback`)

El login por email (magic link) viene habilitado por defecto en Supabase Auth, no hace falta activar nada más.

## 6. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Deberías ver la pantalla de login: ingresa tu email, revisa tu correo y haz clic en el link para entrar.

## 7. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Crea una cuenta gratuita en [vercel.com](https://vercel.com) (puedes entrar con tu GitHub) e importa el repo.
3. En **Settings → Environment Variables** del proyecto en Vercel, agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Una vez desplegado, vuelve a Supabase → Authentication → URL Configuration y agrega la URL de producción (`https://tu-dominio.vercel.app/auth/callback`) a las Redirect URLs, y actualiza el Site URL.

## Estructura del proyecto

```
src/
  app/                  # Rutas (App Router): /, /login, /auth/callback
  components/           # AppShell, pantallas, formularios, UI primitiva
  hooks/useFinanceData.ts  # Estado + mutaciones contra Supabase
  lib/                  # constants, utils, theme, cálculos, mappers, clientes Supabase
  types/                # Tipos de dominio y de filas de base de datos
supabase/schema.sql     # Esquema SQL a correr en Supabase
```

`finance-app.jsx` y `brief-claude-code.md` (en la raíz) quedan como referencia del prototipo original; no forman parte del build.
