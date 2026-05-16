-- Run in Supabase SQL Editor if admin_users does not exist yet.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text,
  role text default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Authenticated users can read their own admin row
create policy "Users can read own admin_users row"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

-- After signing up, insert your admin row (replace UUID/email):
-- insert into public.admin_users (user_id, email, role)
-- select id, email, 'admin' from auth.users where email = 'adminemail@gmail.com';
