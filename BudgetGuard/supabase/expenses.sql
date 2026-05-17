-- Run in Supabase SQL Editor (safe to re-run).
-- Required for expense tracking in BudgetGuard.

-- Repair legacy tables (missing columns cause REST 500 on select/order).
alter table if exists public.expenses
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table if exists public.expenses
  add column if not exists amount numeric;

alter table if exists public.expenses
  add column if not exists category text;

alter table if exists public.expenses
  add column if not exists date date;

alter table if exists public.expenses
  add column if not exists notes text;

alter table if exists public.expenses
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null check (amount > 0),
  category text not null,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_created_at_idx
  on public.expenses (user_id, created_at desc);

alter table public.expenses enable row level security;

drop policy if exists "Users can read own expenses" on public.expenses;
drop policy if exists "Users can insert own expenses" on public.expenses;
drop policy if exists "Users can update own expenses" on public.expenses;
drop policy if exists "Users can delete own expenses" on public.expenses;

create policy "Users can read own expenses"
  on public.expenses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
