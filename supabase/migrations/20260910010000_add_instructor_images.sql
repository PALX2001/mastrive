-- Public card image URLs; private application data remains in instructor_applications.
alter table public.instructor_applications
  add column if not exists image_urls text[] not null default '{}';

alter table public.instructors
  add column if not exists image_urls text[] not null default '{}';

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
create policy "Anyone can upload instructor application images"
  on storage.objects for insert
  with check (bucket_id = 'instructor-images');

drop policy if exists "Anyone can view instructor images" on storage.objects;
create policy "Anyone can view instructor images"
  on storage.objects for select
  using (bucket_id = 'instructor-images');

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
      image_urls, is_published, published_at, updated_at
    ) values (
      new.id, new.user_id, coalesce(new.institute_name, new.full_name),
      coalesce(new.profile_type, 'individual'), new.institute_name,
      coalesce(new.sub_skills, new.skill, 'Instructor'),
      coalesce(new.category, 'Professional Skills'), coalesce(new.locality, new.location), new.city,
      coalesce(new.experience_years, new.experience), new.education,
      new.certifications, coalesce(new.teaching_modes, '{}'),
      coalesce(new.languages_spoken, '{}'), coalesce(new.age_groups_taught, '{}'),
      new.price_per_hour, new.bio, coalesce(new.image_urls, '{}'), true, now(), now()
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
      image_urls = excluded.image_urls,
      is_published = true,
      published_at = now(),
      updated_at = now();
  end if;
  return new;
end;
$$;
