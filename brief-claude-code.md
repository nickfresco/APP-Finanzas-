# Finanzas Personales — Brief para Claude Code

## Objetivo
Convertir el prototipo ya construido (`finance-app.jsx`, adjunto) en una app web real, propia y desplegada, con base de datos y login — para uso diario fuera de Claude.

## Stack recomendado
- **Next.js 14+ (App Router) + TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres + Auth) — plan gratuito alcanza de sobra para uso personal
- **Deploy en Vercel** (plan gratuito)

Es el mismo stack que planteaste originalmente: prioriza simplicidad, seguridad, costo operativo casi nulo y buena experiencia mobile.

## Qué reusar del prototipo
`finance-app.jsx` ya tiene la UI, los cálculos (disponible, ahorro estimado, salud financiera, presupuestos, cuotas, metas) y las 5 pantallas probadas y funcionando. Lo único que cambia es la capa de datos:

1. Reemplazar las llamadas a `window.storage.get/set` (una sola API disponible solo dentro de Claude) por llamadas a Supabase — una tabla por entidad en vez de un blob JSON único.
2. Agregar autenticación (Supabase Auth: magic link o Google) para poder desplegarla sin exponer tus datos a nadie más.
3. Activar Row Level Security para que cada fila solo sea visible para su dueño.

## Esquema de base de datos (SQL para pegar en el SQL Editor de Supabase)

```sql
create extension if not exists "uuid-ossp";

create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  initial_balance numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  date date not null,
  description text,
  method text,
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create table fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount > 0),
  category text not null,
  payment_day int not null default 1,
  method text,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now()
);

create table installments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_amount numeric not null check (total_amount > 0),
  num_installments int not null check (num_installments > 0),
  paid_installments int not null default 0,
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  amount numeric not null check (amount >= 0),
  primary key (user_id, category)
);

create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_amount numeric not null check (goal_amount > 0),
  saved numeric not null default 0,
  target_date date,
  created_at timestamptz not null default now()
);

alter table user_settings enable row level security;
alter table transactions enable row level security;
alter table fixed_expenses enable row level security;
alter table installments enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;

create policy "own rows" on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on fixed_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on installments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## Lo que necesitas hacer tú, fuera de Claude (Claude Code no puede hacerlo por ti)
1. Crear una cuenta gratuita en **supabase.com** y un proyecto nuevo.
2. Pegar el SQL de arriba en su **SQL Editor** y ejecutarlo.
3. Copiar la **Project URL** y la **anon public key** del proyecto Supabase (Settings → API).
4. Crear una cuenta gratuita en **vercel.com** (puedes entrar con tu GitHub) para el deploy, cuando llegue ese paso.

## Primer prompt sugerido para Claude Code
> "Te adjunto `finance-app.jsx`, un prototipo funcional de app de finanzas personales (React) con toda la UI, cálculos y pantallas ya resueltos, y `brief-claude-code.md` con el esquema de base de datos. Crea un proyecto Next.js + TypeScript + Tailwind que reproduzca esta misma UI y lógica, pero reemplazando el almacenamiento por Supabase (usando el esquema del brief) con autenticación por magic link. Estas son mis credenciales de Supabase: [URL] / [anon key]."

## Qué sigue igual
Dashboard, Movimientos, Compromisos (fijos + cuotas), Presupuesto y Metas — mismo diseño Apple-inspired, mismos cálculos. Lo que se agrega en esta etapa es login, persistencia real en base de datos, y poder desplegarla en tu propio dominio.
