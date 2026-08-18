-- Esquema de base de datos para Finanzas Personales
-- Pegar en el SQL Editor de Supabase (Project → SQL Editor → New query) y ejecutar.

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
