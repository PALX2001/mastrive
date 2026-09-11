-- COMPLETE INSTRUCTOR AUTOMATION & VERIFICATION RULE (MASTRIVE)

-- 1. Ensure instructor_applications columns exist
alter table public.instructor_applications
  add column if not exists profile_type text default 'individual',
  add column if not exists institute_name text,
  add column if not exists email text,
  add column if not exists country_code text default '+91',
  add column if not exists gender text,
  add column if not exists category text,
  add column if not exists sub_skills text,
  add column if not exists pincode text,
  add column if not exists locality text,
  add column if not exists city text default 'Delhi',
  add column if not exists experience_years text,
  add column if not exists certifications text,
  add column if not exists education text,
  add column if not exists teaching_modes text[] default '{}',
  add column if not exists demo_class_offered text default 'yes',
  add column if not exists languages_spoken text[] default '{}',
  add column if not exists price_per_hour numeric,
  add column if not exists age_groups_taught text[] default '{}',
  add column if not exists bio text,
  add column if not exists image_urls text[] default '{}',
  add column if not exists verified_at timestamptz;

-- 2. Ensure instructors table exists and has proper schema
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.instructor_applications(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- In case instructors table was created with NOT NULL on user_id, make it nullable
alter table public.instructors alter column user_id drop not null;
alter table public.instructors add column if not exists learners_count integer not null default 0;
alter table public.instructors add column if not exists is_verified boolean not null default false;
alter table public.instructors add column if not exists image_urls text[] not null default '{}';
alter table public.instructors add column if not exists is_published boolean not null default true;

-- 3. Automatic Card Creation & Sync Trigger
-- Whenever someone applies in instructor_applications, AUTOMATICALLY insert into instructors
create or replace function public.sync_instructor_card_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.instructors (
    application_id,
    user_id,
    display_name,
    profile_type,
    institute_name,
    skill,
    category,
    locality,
    city,
    experience_years,
    education,
    certifications,
    teaching_modes,
    languages_spoken,
    age_groups_taught,
    price_per_hour,
    bio,
    image_urls,
    learners_count,
    is_verified,
    is_published,
    published_at,
    updated_at
  ) values (
    new.id,
    new.user_id,
    coalesce(nullif(trim(new.full_name), ''), nullif(trim(new.institute_name), ''), 'Instructor'),
    coalesce(new.profile_type, 'individual'),
    new.institute_name,
    coalesce(nullif(trim(new.sub_skills), ''), nullif(trim(new.skill), ''), 'Specialist'),
    coalesce(new.category, 'Fitness & Combat'),
    coalesce(new.locality, new.location, 'Delhi'),
    coalesce(new.city, 'Delhi'),
    coalesce(new.experience_years, new.experience, '1-3 years'),
    new.education,
    new.certifications,
    coalesce(new.teaching_modes, '{}'),
    coalesce(new.languages_spoken, '{}'),
    coalesce(new.age_groups_taught, '{}'),
    coalesce(new.price_per_hour, 1000),
    new.bio,
    coalesce(new.image_urls, '{}'),
    0, -- learners_count starts at 0
    false, -- verified badge is false (unlocked only after 10 learners)
    true, -- automatically published so card shows up immediately
    now(),
    now()
  )
  on conflict (application_id) do update set
    display_name = coalesce(nullif(trim(excluded.display_name), ''), instructors.display_name),
    profile_type = excluded.profile_type,
    institute_name = excluded.institute_name,
    skill = coalesce(nullif(trim(excluded.skill), ''), instructors.skill),
    category = excluded.category,
    locality = excluded.locality,
    city = excluded.city,
    experience_years = excluded.experience_years,
    education = excluded.education,
    certifications = excluded.certifications,
    teaching_modes = excluded.teaching_modes,
    languages_spoken = excluded.languages_spoken,
    age_groups_taught = excluded.age_groups_taught,
    price_per_hour = excluded.price_per_hour,
    bio = excluded.bio,
    image_urls = case 
      when array_length(excluded.image_urls, 1) > 0 then excluded.image_urls 
      else instructors.image_urls 
    end,
    user_id = coalesce(excluded.user_id, instructors.user_id),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_instructor_card on public.instructor_applications;
create trigger trg_sync_instructor_card
  after insert or update on public.instructor_applications
  for each row
  execute function public.sync_instructor_card_trigger();

-- 4. 10-Learners Rule Trigger
-- Automatically unlocks verified badge when learners_count >= 10
create or replace function public.check_instructor_verified_status()
returns trigger
language plpgsql
as $$
begin
  if new.learners_count >= 10 then
    new.is_verified := true;
  else
    new.is_verified := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_instructor_verified on public.instructors;
create trigger trg_check_instructor_verified
  before insert or update of learners_count on public.instructors
  for each row
  execute function public.check_instructor_verified_status();

-- 5. Row Level Security Policies
alter table public.instructor_applications enable row level security;
alter table public.instructors enable row level security;

-- Drop old policies to avoid conflicts
drop policy if exists "Anyone can submit an instructor application" on public.instructor_applications;
drop policy if exists "Anyone can read instructor applications" on public.instructor_applications;
drop policy if exists "Users can update own application" on public.instructor_applications;
drop policy if exists "Anyone can update application" on public.instructor_applications;

create policy "Anyone can submit an instructor application"
  on public.instructor_applications for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can read instructor applications"
  on public.instructor_applications for select
  to anon, authenticated
  using (true);

create policy "Anyone can update application"
  on public.instructor_applications for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Anyone can read published instructors" on public.instructors;
drop policy if exists "Anyone can insert instructors" on public.instructors;
drop policy if exists "Anyone can update instructors" on public.instructors;

create policy "Anyone can read published instructors"
  on public.instructors for select
  to anon, authenticated
  using (is_published = true);

create policy "Anyone can insert instructors"
  on public.instructors for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update instructors"
  on public.instructors for update
  to anon, authenticated
  using (true)
  with check (true);

-- 6. Storage Bucket setup for photo uploads
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

drop policy if exists "Anyone can upload instructor application images" on storage.objects;
drop policy if exists "Anyone can view instructor images" on storage.objects;
drop policy if exists "Anyone can update instructor images" on storage.objects;

create policy "Anyone can upload instructor application images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'instructor-images');

create policy "Anyone can view instructor images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'instructor-images');

create policy "Anyone can update instructor images"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'instructor-images');

-- 7. Backfill any existing instructor applications into instructors table
insert into public.instructors (
  application_id,
  user_id,
  display_name,
  profile_type,
  institute_name,
  skill,
  category,
  locality,
  city,
  experience_years,
  education,
  certifications,
  teaching_modes,
  languages_spoken,
  age_groups_taught,
  price_per_hour,
  bio,
  image_urls,
  learners_count,
  is_verified,
  is_published,
  published_at,
  updated_at
)
select
  app.id,
  app.user_id,
  coalesce(nullif(trim(app.full_name), ''), nullif(trim(app.institute_name), ''), 'Instructor'),
  coalesce(app.profile_type, 'individual'),
  app.institute_name,
  coalesce(nullif(trim(app.sub_skills), ''), nullif(trim(app.skill), ''), 'Specialist'),
  coalesce(app.category, 'Fitness & Combat'),
  coalesce(app.locality, app.location, 'Delhi'),
  coalesce(app.city, 'Delhi'),
  coalesce(app.experience_years, app.experience, '1-3 years'),
  app.education,
  app.certifications,
  coalesce(app.teaching_modes, '{}'),
  coalesce(app.languages_spoken, '{}'),
  coalesce(app.age_groups_taught, '{}'),
  coalesce(app.price_per_hour, 1000),
  app.bio,
  coalesce(app.image_urls, '{}'),
  0,
  false,
  true,
  coalesce(app.created_at, now()),
  now()
from public.instructor_applications app
on conflict (application_id) do nothing;

