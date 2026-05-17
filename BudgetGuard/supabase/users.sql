-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
