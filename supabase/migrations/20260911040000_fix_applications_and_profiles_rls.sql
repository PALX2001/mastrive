-- ====================================================================
-- MASTRIVE: Fix RLS Policies for instructor_applications and profiles
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Policies for instructor_applications
alter table public.instructor_applications enable row level security;

drop policy if exists " Anyone can submit instructor application\ on public.instructor_applications;
create policy \Anyone can submit instructor application\
 on public.instructor_applications for insert
 to anon, authenticated
 with check (true);

drop policy if exists \Anyone can read applications\ on public.instructor_applications;
create policy \Anyone can read applications\
 on public.instructor_applications for select
 to anon, authenticated
 using (true);

drop policy if exists \Anyone can update application\ on public.instructor_applications;
create policy \Anyone can update application\
 on public.instructor_applications for update
 to anon, authenticated
 using (true)
 with check (true);

-- 2. Policies for profiles
alter table public.profiles enable row level security;

drop policy if exists \Anyone can read profiles\ on public.profiles;
create policy \Anyone can read profiles\
 on public.profiles for select
 to anon, authenticated
 using (true);

drop policy if exists \Anyone can insert profile\ on public.profiles;
create policy \Anyone can insert profile\
 on public.profiles for insert
 to anon, authenticated
 with check (true);

drop policy if exists \Anyone can update profile\ on public.profiles;
create policy \Anyone can update profile\
 on public.profiles for update
 to anon, authenticated
 using (true)
 with check (true);

-- 3. Enable realtime on instructor_applications
do $$
begin
 alter publication supabase_realtime add table public.instructor_applications;
exception when duplicate_object then null;
end $$;

alter table public.instructor_applications replica identity full;
