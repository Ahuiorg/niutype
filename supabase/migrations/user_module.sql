-- User module schema (user_profiles, user_progress) with RLS

-- helper: updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- user_profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_name text unique not null,
  nickname text not null,
  email text not null,
  role text not null default 'student' check (role in ('student','parent')),
  invite_code text unique,
  membership_tier text not null default 'free' check (membership_tier in ('free','premium')),
  membership_expires_at timestamptz,
  level integer not null default 1,
  avatar_url text,
  sound_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_user_profiles_account_name on public.user_profiles(account_name);
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create unique index if not exists idx_user_profiles_invite_code on public.user_profiles(invite_code);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_membership_tier on public.user_profiles(membership_tier);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure update_updated_at_column();

-- user_progress
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_day integer not null default 1,
  consecutive_days integer not null default 0,
  last_completed_date date,
  total_points integer not null default 0,
  used_points integer not null default 0,
  updated_at timestamptz default now(),
  constraint uq_user_progress_user unique (user_id)
);

create index if not exists idx_user_progress_user on public.user_progress(user_id);

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure update_updated_at_column();

-- RLS policies
alter table public.user_profiles enable row level security;
alter table public.user_progress enable row level security;

-- user_profiles: owner can select/update/insert
drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- user_progress: owner manage all
drop policy if exists "Users can manage own progress" on public.user_progress;
create policy "Users can manage own progress"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

