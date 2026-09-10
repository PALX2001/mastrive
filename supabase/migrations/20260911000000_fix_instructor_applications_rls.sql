-- Fix Row Level Security (RLS) policies on instructor_applications
-- Allows any visitor (anon) or logged-in user (authenticated) to submit an instructor application

alter table public.instructor_applications enable row level security;

-- 1. Policy: Allow anyone (anon + authenticated) to insert an application
drop policy if exists "Anyone can submit an instructor application" on public.instructor_applications;
create policy "Anyone can submit an instructor application"
  on public.instructor_applications for insert
  to anon, authenticated
  with check (true);

-- 2. Policy: Allow reading applications for verification and dashboard loading
drop policy if exists "Anyone can read instructor applications" on public.instructor_applications;
create policy "Anyone can read instructor applications"
  on public.instructor_applications for select
  to anon, authenticated
  using (true);

-- 3. Policy: Allow updating applications (e.g. attaching uploaded image URLs or user updates)
drop policy if exists "Users can update own application" on public.instructor_applications;
drop policy if exists "Anyone can update application" on public.instructor_applications;
create policy "Anyone can update application"
  on public.instructor_applications for update
  to anon, authenticated
  using (true)
  with check (true);

-- 4. Storage Bucket permissions for instructor image uploads
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
  to anon, authenticated
  with check (bucket_id = 'instructor-images');

drop policy if exists "Anyone can view instructor images" on storage.objects;
create policy "Anyone can view instructor images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'instructor-images');
