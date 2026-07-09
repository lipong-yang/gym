-- Gym Tracker — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Every table is scoped to the signed-in user via RLS (user_id = auth.uid()).

-- ---------------------------------------------------------------------------
-- Helper: shared RLS policy applied per-table below.
-- ---------------------------------------------------------------------------

-- Checklist -----------------------------------------------------------------
create table if not exists checklist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  category    text not null default 'other',   -- cardio | weight | other
  icon        text not null default '✅',
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists checklist_logs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null default auth.uid() references auth.users on delete cascade,
  item_id  uuid not null references checklist_items on delete cascade,
  date     date not null,
  done     boolean not null default true,
  unique (item_id, date)
);

-- Timer presets -------------------------------------------------------------
create table if not exists timer_presets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  work_sec    integer not null default 30,
  rest_sec    integer not null default 15,
  rounds      integer not null default 8,
  warmup_sec  integer not null default 10,
  created_at  timestamptz not null default now()
);

-- Weights: exercise -> session (log) -> sets --------------------------------
create table if not exists weight_exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  name         text not null,
  goal_weight  numeric,
  goal_reps    integer,
  goal_sets    integer,
  created_at   timestamptz not null default now()
);

create table if not exists weight_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  exercise_id  uuid not null references weight_exercises on delete cascade,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

create table if not exists weight_sets (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null default auth.uid() references auth.users on delete cascade,
  log_id   uuid not null references weight_logs on delete cascade,
  set_no   integer not null,
  reps     integer not null default 0,
  kg       numeric not null default 0
);

-- Goals ---------------------------------------------------------------------
create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  type        text not null default 'custom',  -- custom | consistency | strength
  target      numeric not null default 0,
  unit        text not null default '',
  created_at  timestamptz not null default now()
);

-- Running -------------------------------------------------------------------
create table if not exists runs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  name           text not null default 'Run',
  notes          text not null default '',
  date           timestamptz not null default now(),
  distance_m     numeric not null default 0,
  duration_sec   integer not null default 0,
  elev_gain_m    numeric not null default 0,
  calories_kcal  numeric not null default 0,
  splits         jsonb not null default '[]'::jsonb,
  points         jsonb not null default '[]'::jsonb,   -- [{lat,lng,alt,ts}]
  source         text not null default 'live',         -- live | gpx-import
  created_at     timestamptz not null default now()
);

create table if not exists run_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  run_id        uuid not null references runs on delete cascade,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);

-- Rope jumping / tennis / misc sport sessions -------------------------------
create table if not exists sport_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  type          text not null,                 -- rope_jump | tennis | other
  date          timestamptz not null default now(),
  duration_sec  integer not null default 0,
  metrics       jsonb not null default '{}'::jsonb,
  notes         text not null default '',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-Level Security: owner-only access on every table.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'checklist_items','checklist_logs','timer_presets','weight_exercises',
    'weight_logs','weight_sets','goals','runs','run_photos','sport_sessions'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists owner_all on %I;', t);
    execute format(
      'create policy owner_all on %I for all
         using (user_id = auth.uid())
         with check (user_id = auth.uid());', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket for run photos (private, owner-scoped).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('run-photos', 'run-photos', false)
on conflict (id) do nothing;

-- Objects are keyed as `<uid>/<run_id>/<file>`; scope access by the first path
-- segment (robust and future-proof vs. the deprecated `owner` column).
drop policy if exists "run photos owner" on storage.objects;
create policy "run photos owner" on storage.objects for all
  to authenticated
  using (
    bucket_id = 'run-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'run-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
