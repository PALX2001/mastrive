-- ==============================================================================
-- MASTRIVE: AUTOMATE INSTRUCTOR ONBOARDING & SEED PALASH BHOWMIK
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure columns exist with proper defaults
alter table public.instructor_applications
  alter column whatsapp_number drop not null,
  alter column location drop not null,
  alter column experience drop not null;

alter table public.instructors
  add column if not exists slug text;

-- 2. Insert or Update Palash Bhowmik as a published instructor
insert into public.instructors (
  user_id,
  display_name,
  profile_type,
  skill,
  category,
  locality,
  city,
  experience_years,
  price_per_hour,
  bio,
  teaching_modes,
  languages_spoken,
  image_urls,
  is_published,
  is_verified,
  learners_count,
  rating,
  reviews_count,
  slug,
  updated_at
) values (
  'a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a',
  'Palash Bhowmik',
  'individual',
  'Boxing & Combat Coach',
  'Fitness & Combat',
  'South Delhi',
  'New Delhi',
  '5+ years',
  1500,
  'Certified Boxing & Striking Coach specializing in footwork, defensive mechanics, and technical counter-punching. Offering 1-on-1 sparring and technique breakdowns.',
  ARRAY['In-Person Studio', 'Home Visits', 'Live 1-on-1 Stream'],
  ARRAY['English', 'Hindi'],
  ARRAY['/hero/boxing.jpg'],
  true,
  false,
  0,
  5.0,
  14,
  'palash-bhowmik',
  now()
)
on conflict (user_id) do update set
  display_name = excluded.display_name,
  skill = excluded.skill,
  category = excluded.category,
  locality = excluded.locality,
  city = excluded.city,
  price_per_hour = excluded.price_per_hour,
  bio = excluded.bio,
  is_published = true,
  slug = 'palash-bhowmik',
  updated_at = now();

-- Ensure profile role is 'instructor'
update public.profiles
set role = 'instructor',
    skill = 'Boxing',
    city = 'New Delhi',
    updated_at = now()
where id = 'a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a';

-- 3. Automatic trigger: When an application is submitted, create an instructor row immediately
create or replace function public.sync_instructor_card_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  calc_slug text;
  clean_name text;
begin
  clean_name := coalesce(nullif(trim(new.full_name), ''), nullif(trim(new.institute_name), ''), 'Instructor');
  calc_slug := lower(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
  calc_slug := trim(both '-' from calc_slug) || '-' || floor(random() * 9000 + 1000)::text;

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
    slug,
    published_at,
    updated_at
  ) values (
    new.id,
    new.user_id,
    clean_name,
    coalesce(new.profile_type, 'individual'),
    new.institute_name,
    coalesce(nullif(trim(new.sub_skills), ''), nullif(trim(new.skill), ''), 'Specialist Coach'),
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
    0,
    false,
    true,
    calc_slug,
    now(),
    now()
  )
  on conflict (application_id) do update set
    display_name = excluded.display_name,
    profile_type = excluded.profile_type,
    institute_name = excluded.institute_name,
    skill = excluded.skill,
    category = excluded.category,
    locality = excluded.locality,
    city = excluded.city,
    price_per_hour = excluded.price_per_hour,
    bio = excluded.bio,
    image_urls = case when array_length(excluded.image_urls, 1) > 0 then excluded.image_urls else instructors.image_urls end,
    user_id = coalesce(excluded.user_id, instructors.user_id),
    updated_at = now();

  -- If applicant is a registered user, promote profile role to instructor
  if new.user_id is not null then
    update public.profiles
    set role = 'instructor',
        skill = coalesce(nullif(trim(new.sub_skills), ''), nullif(trim(new.skill), ''), profiles.skill),
        city = coalesce(nullif(trim(new.city), ''), profiles.city),
        updated_at = now()
    where id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_instructor_card on public.instructor_applications;
create trigger trg_sync_instructor_card
  after insert or update on public.instructor_applications
  for each row
  execute function public.sync_instructor_card_trigger();

-- 4. Automatic trigger: When a profile is set to role = 'instructor', ensure they have an instructor card
create or replace function public.sync_profile_to_instructor_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  calc_slug text;
  clean_name text;
begin
  if new.role = 'instructor' and (old is null or old.role <> 'instructor') then
    if not exists (select 1 from public.instructors where user_id = new.id) then
      clean_name := coalesce(nullif(trim(new.full_name), ''), 'Coach');
      calc_slug := lower(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
      calc_slug := trim(both '-' from calc_slug) || '-' || floor(random() * 9000 + 1000)::text;

      insert into public.instructors (
        user_id,
        display_name,
        profile_type,
        skill,
        category,
        locality,
        city,
        experience_years,
        price_per_hour,
        bio,
        teaching_modes,
        languages_spoken,
        image_urls,
        is_published,
        is_verified,
        learners_count,
        rating,
        reviews_count,
        slug,
        updated_at
      ) values (
        new.id,
        clean_name,
        'individual',
        coalesce(nullif(trim(new.skill), ''), 'Specialist Coach'),
        'Fitness & Combat',
        coalesce(nullif(trim(new.city), ''), 'Delhi'),
        coalesce(nullif(trim(new.city), ''), 'Delhi'),
        '3+ years',
        1200,
        'Verified instructor on Mastrive offering personalized 1-on-1 coaching sessions.',
        ARRAY['In-Person', 'Live 1-on-1 Stream'],
        ARRAY['English', 'Hindi'],
        ARRAY['/hero/boxing.jpg'],
        true,
        false,
        0,
        5.0,
        0,
        calc_slug,
        now()
      ) on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_to_instructor on public.profiles;
create trigger trg_sync_profile_to_instructor
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_profile_to_instructor_trigger();

-- 5. Enable RLS and add open insert policies for application submissions
alter table public.instructors enable row level security;

drop policy if exists "Allow applications and users to insert instructors" on public.instructors;
create policy "Allow applications and users to insert instructors"
  on public.instructors for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow owners to update their instructor card" on public.instructors;
create policy "Allow owners to update their instructor card"
  on public.instructors for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Anyone can submit applications" on public.instructor_applications;
create policy "Anyone can submit applications"
  on public.instructor_applications for insert
  to anon, authenticated
  with check (true);

