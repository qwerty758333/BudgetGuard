-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  name text not null,
  emoji text not null,
  description text not null,
  unlocked boolean not null default false,
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists badges_user_id_idx on public.badges (user_id);

alter table public.badges enable row level security;

drop policy if exists "Users can read own badges" on public.badges;
drop policy if exists "Users can insert own badges" on public.badges;
drop policy if exists "Users can update own badges" on public.badges;

create policy "Users can read own badges"
  on public.badges
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own badges"
  on public.badges
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own badges"
  on public.badges
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
