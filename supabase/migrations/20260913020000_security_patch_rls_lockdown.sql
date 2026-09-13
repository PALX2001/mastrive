-- ==============================================================================
-- MASTRIVE: CRITICAL SECURITY PATCH & RLS LOCKDOWN
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Fixes Privilege Escalation, locks down is_admin(), protects user roles
-- ==============================================================================

-- 1. Drop insecure broad update policy if it was applied
drop policy if exists "Users can update own avatar_url" on public.profiles;

-- 2. Harden is_admin() function so it relies exclusively on server-side JWT claims or verified founder email
-- NEVER trust a user-mutable database column for admin authorization
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') in (
      '2001palash@gmail.com'
    ),
    false
  );
$$;

-- 3. Ensure profiles update policy strictly prevents role changes by regular users
drop policy if exists "Users can update own profile without elevating role" on public.profiles;

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

-- 4. Demote any accidental or unauthorized 'admin' role rows in profiles back to 'user'
update public.profiles
set role = 'user'
where role = 'admin'
  and lower(email) <> '2001palash@gmail.com';

-- Ensure founder profile maintains admin
update public.profiles
set role = 'admin'
where lower(email) = '2001palash@gmail.com';

