-- Parent-student relations (baseline, full parent capabilities to be added later)

create table if not exists public.parent_student_relations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  practice_per_slot_minutes integer not null default 30,
  play_per_slot_minutes integer not null default 30,
  max_daily_play_minutes integer,
  created_at timestamptz default now(),
  unique(parent_id, student_id)
);

create index if not exists idx_parent_student_parent on public.parent_student_relations(parent_id);
create index if not exists idx_parent_student_student on public.parent_student_relations(student_id);

alter table public.parent_student_relations enable row level security;

drop policy if exists "Parents manage own relations" on public.parent_student_relations;
create policy "Parents manage own relations"
  on public.parent_student_relations for all
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);
