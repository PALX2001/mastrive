-- Store sensitive application details separately from public instructor cards.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists skill text,
  add column if not exists updated_at timestamptz default now();

-- The original application table only contained the small legacy form. Keep
-- those columns for backwards compatibility and add every field submitted by
-- the current instructor application form.
alter table public.instructor_applications
  add column if not exists profile_type text,
  add column if not exists institute_name text,
  add column if not exists email text,
  add column if not exists country_code text,
  add column if not exists gender text,
  add column if not exists category text,
  add column if not exists sub_skills text,
  add column if not exists pincode text,
  add column if not exists locality text,
  add column if not exists city text,
  add column if not exists experience_years text,
  add column if not exists certifications text,
  add column if not exists education text,
  add column if not exists teaching_modes text[] not null default '{}',
  add column if not exists demo_class_offered text,
  add column if not exists languages_spoken text[] not null default '{}',
  add column if not exists price_per_hour numeric,
  add column if not exists age_groups_taught text[] not null default '{}',
  add column if not exists bio text,
  add column if not exists verified_at timestamptz;

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.instructor_applications(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  profile_type text not null default 'individual',
  institute_name text,
  skill text not null,
  category text not null,
  locality text,
  city text,
  experience_years text,
  education text,
  certifications text,
  teaching_modes text[] not null default '{}',
  languages_spoken text[] not null default '{}',
  age_groups_taught text[] not null default '{}',
  price_per_hour numeric,
  bio text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.instructors enable row level security;

drop policy if exists "Anyone can read published instructors" on public.instructors;
create policy "Anyone can read published instructors"
  on public.instructors for select
  using (is_published = true);

create or replace function public.publish_verified_instructor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null and new.status in ('verified', 'approved') then
    insert into public.instructors (
      application_id, user_id, display_name, profile_type, institute_name, skill,
      category, locality, city, experience_years, education, certifications,
      teaching_modes, languages_spoken, age_groups_taught, price_per_hour, bio,
      is_published, published_at, updated_at
    ) values (
      new.id, new.user_id, coalesce(new.institute_name, new.full_name),
      coalesce(new.profile_type, 'individual'), new.institute_name,
      coalesce(new.sub_skills, new.skill, 'Instructor'),
      coalesce(new.category, 'Professional Skills'), coalesce(new.locality, new.location), new.city,
      coalesce(new.experience_years, new.experience), new.education,
      new.certifications, coalesce(new.teaching_modes, '{}'),
      coalesce(new.languages_spoken, '{}'), coalesce(new.age_groups_taught, '{}'),
      new.price_per_hour, new.bio, true, now(), now()
    )
    on conflict (application_id) do update set
      display_name = excluded.display_name,
      profile_type = excluded.profile_type,
      institute_name = excluded.institute_name,
      skill = excluded.skill,
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
      is_published = true,
      published_at = now(),
      updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists publish_verified_instructor_on_application on public.instructor_applications;
create trigger publish_verified_instructor_on_application
  after insert or update of user_id, status on public.instructor_applications
  for each row execute function public.publish_verified_instructor();

-- Publish any instructor applications that were verified before this migration.
update public.instructor_applications
set status = status
where user_id is not null and status in ('verified', 'approved');
