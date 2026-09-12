-- ============================================================
-- MASTRIVE: Auto-create profile row on every new signup
-- Run in Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Ensure profiles.email column exists
alter table public.profiles
  add column if not exists email text;

-- 2. Function: called by trigger on auth.users INSERT
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _full_name text;
  _role      text;
begin
  _full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    null
  );

  _role := coalesce(
    nullif(trim(new.raw_user_meta_data->>'role'), ''),
    'user'
  );

  insert into public.profiles (id, email, full_name, role, created_at, updated_at)
  values (new.id, new.email, _full_name, _role, now(), now())
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 3. Trigger: fires after every INSERT on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Back-fill existing auth users who have no profile row
insert into public.profiles (id, email, full_name, role, created_at, updated_at)
select
  u.id,
  u.email,
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), nullif(trim(u.raw_user_meta_data->>'name'), ''), null),
  coalesce(nullif(trim(u.raw_user_meta_data->>'role'), ''), 'user'),
  u.created_at,
  now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
