-- ==============================================================================
-- MASTRIVE: Instructor Services, Calendar Slots & Slug Indexing
-- Run this in Supabase Dashboard: SQL Editor -> New Query -> Run
-- Replaces browser localStorage with persistent database tables.
-- ==============================================================================

-- 1. Add slug column and index to instructors table for O(1) profile lookups
alter table public.instructors add column if not exists slug text;
create index if not exists instructors_slug_idx on public.instructors(slug);

-- Auto-generate slug from display_name for existing instructors
update public.instructors
set slug = lower(regexp_replace(trim(display_name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

-- 2. Create instructor_services table
create table if not exists public.instructor_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  instructor_id text not null,
  name text not null,
  duration text not null default '60 min',
  mode text not null default 'in-person',
  price numeric not null default 1000,
  bookings_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instructor_services_user_idx on public.instructor_services(user_id);
create index if not exists instructor_services_inst_idx on public.instructor_services(instructor_id);

-- 3. Create instructor_slots table
create table if not exists public.instructor_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  instructor_id text not null,
  day text not null,
  time text not null,
  title text not null default '1-on-1 Coaching',
  type text not null default 'in-person',
  status text not null default 'open',
  student text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instructor_slots_user_idx on public.instructor_slots(user_id);
create index if not exists instructor_slots_inst_idx on public.instructor_slots(instructor_id);
create index if not exists instructor_slots_status_idx on public.instructor_slots(status);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.instructor_services enable row level security;
alter table public.instructor_slots enable row level security;

-- Policies for instructor_services
drop policy if exists "Public view active services or owner/admin all" on public.instructor_services;
drop policy if exists "Instructors manage own services" on public.instructor_services;
drop policy if exists "Instructors update own services" on public.instructor_services;
drop policy if exists "Instructors delete own services" on public.instructor_services;

create policy "Public view active services or owner/admin all"
  on public.instructor_services for select
  to anon, authenticated
  using (
    active = true
    or auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors manage own services"
  on public.instructor_services for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors update own services"
  on public.instructor_services for update
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  )
  with check (
    auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors delete own services"
  on public.instructor_services for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- Policies for instructor_slots
drop policy if exists "Public view open slots or owner/admin all" on public.instructor_slots;
drop policy if exists "Instructors manage own slots" on public.instructor_slots;
drop policy if exists "Instructors update own slots" on public.instructor_slots;
drop policy if exists "Instructors delete own slots" on public.instructor_slots;

create policy "Public view open slots or owner/admin all"
  on public.instructor_slots for select
  to anon, authenticated
  using (
    status = 'open'
    or auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors manage own slots"
  on public.instructor_slots for insert
  to authenticated
  with check (
    auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors update own slots"
  on public.instructor_slots for update
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  )
  with check (
    auth.uid() = user_id
    or public.is_admin()
  );

create policy "Instructors delete own slots"
  on public.instructor_slots for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );
