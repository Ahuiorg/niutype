-- Phase 2 core modules: exercise, game, points, gift, achievement

-- exercise_records
create table if not exists public.exercise_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day integer not null,
  date date not null,
  total_chars integer not null default 0,
  correct_chars integer not null default 0,
  total_time_ms integer not null default 0,
  earned_points integer not null default 0,
  accuracy numeric(5,4) not null default 0,
  avg_response_time_ms numeric(10,2) not null default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);
create index if not exists idx_exercise_records_user_date on public.exercise_records(user_id, date desc);

-- letter_stats
create table if not exists public.letter_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  letter text not null,
  total_attempts integer not null default 0,
  correct_attempts integer not null default 0,
  total_response_time_ms bigint not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, letter)
);
create index if not exists idx_letter_stats_user on public.letter_stats(user_id);

-- game_types
create table if not exists public.game_types (
  id text primary key,
  name text not null,
  description text,
  required_membership text not null default 'free' check (required_membership in ('free','premium')),
  required_level integer not null default 1,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_game_types_active on public.game_types(is_active, sort_order);
create index if not exists idx_game_types_membership on public.game_types(required_membership);
create index if not exists idx_game_types_level on public.game_types(required_level);

-- game_records
create table if not exists public.game_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null,
  date date not null,
  total_time_ms integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, game_type, date)
);
create index if not exists idx_game_records_user_date on public.game_records(user_id, date desc);

-- points_transactions
create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text,
  created_at timestamptz default now()
);
create index if not exists idx_points_tx_user_date on public.points_transactions(user_id, created_at desc);

-- gifts
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null,
  image_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_gifts_active on public.gifts(is_active);

-- redeemed_gifts
create table if not exists public.redeemed_gifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  points integer not null,
  redeemed_at timestamptz default now(),
  claimed_at timestamptz
);
create index if not exists idx_redeemed_gifts_user on public.redeemed_gifts(user_id);

-- achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);
create index if not exists idx_achievements_user on public.achievements(user_id);

-- RLS
alter table public.exercise_records enable row level security;
alter table public.letter_stats enable row level security;
alter table public.game_records enable row level security;
alter table public.points_transactions enable row level security;
alter table public.gifts enable row level security;
alter table public.redeemed_gifts enable row level security;
alter table public.achievements enable row level security;

-- exercise_records policies
drop policy if exists "Users manage own exercise records" on public.exercise_records;
create policy "Users manage own exercise records"
  on public.exercise_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- letter_stats policies
drop policy if exists "Users manage own letter stats" on public.letter_stats;
create policy "Users manage own letter stats"
  on public.letter_stats for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- game_records policies
drop policy if exists "Users manage own game records" on public.game_records;
create policy "Users manage own game records"
  on public.game_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- points_transactions policies (read-only to owner)
drop policy if exists "Users read own points tx" on public.points_transactions;
create policy "Users read own points tx"
  on public.points_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own points tx" on public.points_transactions;
create policy "Users insert own points tx"
  on public.points_transactions for insert
  with check (auth.uid() = user_id);

-- gifts: authenticated read active
drop policy if exists "Authenticated view active gifts" on public.gifts;
create policy "Authenticated view active gifts"
  on public.gifts for select
  to authenticated
  using (is_active = true);

-- redeemed_gifts policies
drop policy if exists "Users manage own redeemed gifts" on public.redeemed_gifts;
create policy "Users manage own redeemed gifts"
  on public.redeemed_gifts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- achievements policies
drop policy if exists "Users manage own achievements" on public.achievements;
create policy "Users manage own achievements"
  on public.achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

