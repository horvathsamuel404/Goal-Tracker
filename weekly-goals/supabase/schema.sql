-- Weekly Goals database setup.
-- Paste this whole file into Supabase: SQL Editor > New query > Run.
-- Safe to run more than once.

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'open' check (status in ('open', 'done', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists goals_user_day_idx on public.goals (user_id, day);

-- Row level security: each person can only see and change their own goals.
alter table public.goals enable row level security;

drop policy if exists "Read own goals" on public.goals;
create policy "Read own goals" on public.goals
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Add own goals" on public.goals;
create policy "Add own goals" on public.goals
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Update own goals" on public.goals;
create policy "Update own goals" on public.goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own goals" on public.goals;
create policy "Delete own goals" on public.goals
  for delete to authenticated using ((select auth.uid()) = user_id);
