-- ==============================================================================
-- MASTRIVE: INSTRUCTOR EMAIL VERIFICATION & CONDITIONAL PUBLISHING
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Enforces that instructor profiles are NOT published until email is verified
-- ==============================================================================

-- 1. Update sync_instructor_card_trigger to check verified_at & status
create or replace function public.sync_instructor_card_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  calc_slug text;
  clean_name text;
  should_publish boolean;
begin
  clean_name := coalesce(nullif(trim(new.full_name), ''), nullif(trim(new.institute_name), ''), 'Instructor');
  calc_slug := lower(regexp_replace(clean_name, '[^a-zA-Z0-9]+', '-', 'g'));
  calc_slug := trim(both '-' from calc_slug) || '-' || floor(random() * 9000 + 1000)::text;

  -- Profile is ONLY published if verified_at is set AND status is 'verified' or 'approved'
  should_publish := (new.status in ('verified', 'approved') and new.verified_at is not null);

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
    should_publish,
    calc_slug,
    case when should_publish then now() else null end,
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
    is_published = should_publish,
    published_at = case when should_publish and instructors.published_at is null then now() else instructors.published_at end,
    updated_at = now();

  -- If verified and user_id is set, promote profile role to instructor
  if should_publish and new.user_id is not null then
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

-- 2. Unpublish any pending/unverified instructors (except verified founder Palash)
update public.instructors
set is_published = false
where application_id in (
  select id from public.instructor_applications
  where (status not in ('verified', 'approved') or verified_at is null)
)
and user_id <> 'a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a';

-- 3. Ensure RLS only lets public view is_published = true
drop policy if exists "Public can read published instructors or owner/admin all" on public.instructors;
create policy "Public can read published instructors or owner/admin all"
  on public.instructors for select
  to anon, authenticated
  using (
    is_published = true
    or auth.uid() = user_id
    or public.is_admin()
  );

