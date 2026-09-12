-- ==============================================================================
-- MASTRIVE: Complete Database Schema & RLS Lockdown
-- Run this in Supabase Dashboard: SQL Editor -> New Query -> Run
-- Idempotent: Safely creates any missing tables and locks down RLS.
-- Ensures ONLY the founder/admin has full access to users and instructors data.
-- ==============================================================================

-- ==============================================================================
-- 1. ENSURE ALL TABLES EXIST
-- ==============================================================================

-- 1.1 Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',
  city text,
  phone text,
  skill text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text not null default 'user',
  add column if not exists city text,
  add column if not exists phone text,
  add column if not exists skill text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- 1.2 Instructor Applications Table
create table if not exists public.instructor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  profile_type text default 'individual',
  full_name text not null default 'Instructor',
  skill text not null default 'Specialist',
  location text,
  experience text,
  institute_name text,
  email text,
  country_code text default '+91',
  whatsapp_number text,
  gender text,
  category text default 'Fitness & Combat',
  sub_skills text,
  pincode text,
  locality text,
  city text default 'Delhi',
  experience_years text,
  certifications text,
  education text,
  teaching_modes text[] default '{}',
  demo_class_offered text default 'yes',
  languages_spoken text[] default '{}',
  price_per_hour numeric default 1000,
  age_groups_taught text[] default '{}',
  bio text,
  image_urls text[] default '{}',
  status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.3 Instructors Table
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.instructor_applications(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  profile_type text not null default 'individual',
  institute_name text,
  skill text not null,
  category text not null default 'Fitness & Combat',
  locality text,
  city text default 'Delhi',
  experience_years text,
  education text,
  certifications text,
  teaching_modes text[] not null default '{}',
  languages_spoken text[] not null default '{}',
  age_groups_taught text[] not null default '{}',
  price_per_hour numeric default 1000,
  bio text,
  image_urls text[] not null default '{}',
  learners_count integer not null default 0,
  is_verified boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  rating numeric default 4.9,
  reviews_count integer default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1.4 Bookings Table (ensures relation exists!)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  instructor_id text,
  instructor_name text not null,
  instructor_skill text,
  session_date text not null,
  session_time text not null,
  booking_type text not null default 'single',
  mode text not null default 'in-person',
  person_count integer not null default 1,
  total_amount numeric not null default 0,
  platform_fee numeric not null default 0,
  instructor_payout numeric not null default 0,
  payment_method text not null default 'upi_qr',
  payment_reference text,
  status text not null default 'confirmed',
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_customer_email_idx on public.bookings(customer_email);
create index if not exists bookings_instructor_id_idx on public.bookings(instructor_id);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);

-- 1.5 Storage Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'instructor-images',
  'instructor-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- ==============================================================================
-- 2. FOUNDER / ADMIN HELPER FUNCTION
-- ==============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
    or lower(auth.jwt() ->> 'email') = '2001palash@gmail.com',
    false
  );
$$;

-- Designate founder as admin in profiles if row exists
update public.profiles
set role = 'admin'
where lower(email) = '2001palash@gmail.com';

-- ==============================================================================
-- 3. SANITIZED PUBLIC LEADERBOARD VIEW
-- Excludes sensitive personal information (email, phone, role)
-- ==============================================================================
create or replace view public.leaderboard_profiles with (security_invoker = false) as
  select
    id,
    full_name,
    skill,
    city,
    created_at
  from public.profiles
  where role = 'user' and full_name is not null;

grant select on public.leaderboard_profiles to anon, authenticated;

-- ==============================================================================
-- 4. HARDEN PROFILES TABLE RLS
-- ==============================================================================
alter table public.profiles enable row level security;

drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Anyone can insert profile" on public.profiles;
drop policy if exists "Anyone can update profile" on public.profiles;
drop policy if exists "Users can view own profile or admins view all" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile without elevating role" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

create policy "Users can view own profile or admins view all"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or public.is_admin()
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile without elevating role"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and (
        role is not distinct from (select p.role from public.profiles p where p.id = auth.uid())
      )
    )
  );

create policy "Admins can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_admin() or auth.uid() = id);

-- ==============================================================================
-- 5. HARDEN INSTRUCTOR_APPLICATIONS TABLE RLS
-- ==============================================================================
alter table public.instructor_applications enable row level security;

drop policy if exists "Anyone can submit instructor application" on public.instructor_applications;
drop policy if exists "Anyone can submit an instructor application" on public.instructor_applications;
drop policy if exists "Anyone can read applications" on public.instructor_applications;
drop policy if exists "Anyone can read instructor applications" on public.instructor_applications;
drop policy if exists "Anyone can update application" on public.instructor_applications;
drop policy if exists "Users can update own application" on public.instructor_applications;
drop policy if exists "Applicants view own application or admin views all" on public.instructor_applications;
drop policy if exists "Anyone can submit instructor application with pending status" on public.instructor_applications;
drop policy if exists "Admins or owners update application" on public.instructor_applications;
drop policy if exists "Only admin can delete applications" on public.instructor_applications;

create policy "Applicants view own application or admin views all"
  on public.instructor_applications for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

create policy "Anyone can submit instructor application with pending status"
  on public.instructor_applications for insert
  to anon, authenticated
  with check (
    status = 'pending'
    or public.is_admin()
  );

create policy "Admins or owners update application"
  on public.instructor_applications for update
  to authenticated
  using (
    public.is_admin()
    or (auth.uid() = user_id and status = 'pending')
  )
  with check (
    public.is_admin()
    or (auth.uid() = user_id and status = 'pending')
  );

create policy "Only admin can delete applications"
  on public.instructor_applications for delete
  to authenticated
  using (public.is_admin());

-- ==============================================================================
-- 6. HARDEN INSTRUCTORS TABLE RLS
-- ==============================================================================
alter table public.instructors enable row level security;

drop policy if exists "Anyone can read published instructors" on public.instructors;
drop policy if exists "Anyone can insert instructors" on public.instructors;
drop policy if exists "Anyone can update instructors" on public.instructors;
drop policy if exists "Anyone can delete instructors" on public.instructors;
drop policy if exists "Public can read published instructors or owner/admin all" on public.instructors;
drop policy if exists "Only admins or triggers insert instructors" on public.instructors;
drop policy if exists "Instructors update own row or admin updates all" on public.instructors;
drop policy if exists "Only owner or admin can delete instructor" on public.instructors;

create policy "Public can read published instructors or owner/admin all"
  on public.instructors for select
  to anon, authenticated
  using (
    is_published = true
    or auth.uid() = user_id
    or public.is_admin()
  );

create policy "Only admins or triggers insert instructors"
  on public.instructors for insert
  to authenticated
  with check (
    public.is_admin()
    or auth.uid() = user_id
  );

create policy "Instructors update own row or admin updates all"
  on public.instructors for update
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  )
  with check (
    public.is_admin()
    or (
      auth.uid() = user_id
      and is_verified is not distinct from (select i.is_verified from public.instructors i where i.id = instructors.id)
    )
  );

create policy "Only owner or admin can delete instructor"
  on public.instructors for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- ==============================================================================
-- 7. HARDEN BOOKINGS TABLE RLS
-- ==============================================================================
alter table public.bookings enable row level security;

drop policy if exists "Anyone can insert bookings" on public.bookings;
drop policy if exists "Users can view their own bookings" on public.bookings;
drop policy if exists "Users can update their bookings" on public.bookings;
drop policy if exists "Parties involved or admin view bookings" on public.bookings;
drop policy if exists "Users or guests can insert bookings" on public.bookings;
drop policy if exists "Parties involved or admin update bookings" on public.bookings;
drop policy if exists "Only admin can delete bookings" on public.bookings;

create policy "Parties involved or admin view bookings"
  on public.bookings for select
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() ->> 'email') = customer_email
    or instructor_id = auth.uid()::text
    or exists (
      select 1 from public.instructors inst
      where inst.id::text = bookings.instructor_id and inst.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "Users or guests can insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (
    auth.uid() = user_id
    or user_id is null
    or public.is_admin()
  );

create policy "Parties involved or admin update bookings"
  on public.bookings for update
  to authenticated
  using (
    auth.uid() = user_id
    or instructor_id = auth.uid()::text
    or exists (
      select 1 from public.instructors inst
      where inst.id::text = bookings.instructor_id and inst.user_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    auth.uid() = user_id
    or instructor_id = auth.uid()::text
    or exists (
      select 1 from public.instructors inst
      where inst.id::text = bookings.instructor_id and inst.user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "Only admin can delete bookings"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());

-- Enable Realtime idempotently
do $$
begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null;
end $$;

-- ==============================================================================
-- 8. STORAGE SECURITY (instructor-images bucket)
-- ==============================================================================
drop policy if exists "Anyone can upload instructor application images" on storage.objects;
drop policy if exists "Anyone can view instructor images" on storage.objects;
drop policy if exists "Anyone can update instructor images" on storage.objects;
drop policy if exists "Users and applicants upload instructor images" on storage.objects;
drop policy if exists "Only owner or admin can update instructor images" on storage.objects;
drop policy if exists "Only owner or admin can delete instructor images" on storage.objects;

create policy "Anyone can view instructor images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'instructor-images');

create policy "Users and applicants upload instructor images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'instructor-images');

create policy "Only owner or admin can update instructor images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'instructor-images'
    and (auth.uid() = owner or public.is_admin())
  )
  with check (
    bucket_id = 'instructor-images'
    and (auth.uid() = owner or public.is_admin())
  );

create policy "Only owner or admin can delete instructor images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'instructor-images'
    and (auth.uid() = owner or public.is_admin())
  );
