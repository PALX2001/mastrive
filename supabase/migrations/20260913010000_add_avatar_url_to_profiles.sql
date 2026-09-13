-- ==============================================================================
-- MASTRIVE: PERSIST USER AVATARS ACROSS SIGN-OUT & SIGN-IN
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure profiles table has avatar_url column
alter table public.profiles
  add column if not exists avatar_url text;

-- 2. Link Palash Bhowmik's existing uploaded avatar in Storage to his profile & instructor card
update public.profiles
set avatar_url = 'https://pwxhtxqvlsmspwazkaik.supabase.co/storage/v1/object/public/instructor-images/avatars/a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a-1789269167303.jpg'
where id = 'a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a';

update public.instructors
set image_urls = array['https://pwxhtxqvlsmspwazkaik.supabase.co/storage/v1/object/public/instructor-images/avatars/a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a-1789269167303.jpg']
where user_id = 'a2b4e2c7-02bb-4c48-ba4b-e741ad2e6f7a';

-- 3. Ensure role elevation is blocked while allowing avatar_url updates
drop policy if exists "Users can update own avatar_url" on public.profiles;


