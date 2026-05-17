-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  email text,
  role text default 'admin',
  created_at timestamptz not null default now()
);

-- Legacy tables may only have `id`; add `user_id` when missing.
alter table public.admin_users
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- If table existed with id-only rows (legacy), backfill user_id from id when possible.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_users'
      and column_name = 'user_id'
  ) then
    update public.admin_users
    set user_id = id
    where user_id is null
      and exists (select 1 from auth.users u where u.id = admin_users.id);
  end if;
end $$;

alter table public.admin_users enable row level security;

drop policy if exists "Users can read own admin_users row" on public.admin_users;
drop policy if exists "Users can insert own admin_users row" on public.admin_users;
drop policy if exists "Users can update own admin_users row" on public.admin_users;

create policy "Users can read own admin_users row"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own admin_users row"
  on public.admin_users
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own admin_users row"
  on public.admin_users
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed admin (replace with your auth user id + email)
insert into public.admin_users (user_id, email, role)
values (
  'ce48d27a-3ba1-48ba-9fcb-8f0ec91940b1',
  'irangapipi@gmail.com',
  'admin'
)
on conflict (user_id) do update
set
  email = excluded.email,
  role = excluded.role;
