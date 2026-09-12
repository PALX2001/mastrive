-- ==============================================================================
-- MASTRIVE: Tournament Registrations Table & RLS
-- Run this in Supabase Dashboard: SQL Editor -> New Query -> Run
-- Persists tournament registrations and payments.
-- ==============================================================================

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  tournament_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  participant_name text not null,
  participant_email text not null,
  participant_phone text,
  xp_handle text,
  entry_fee numeric not null,
  payment_method text not null default 'razorpay',
  payment_reference text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index if not exists tournament_reg_user_idx on public.tournament_registrations(user_id);
create index if not exists tournament_reg_tourn_idx on public.tournament_registrations(tournament_id);
create index if not exists tournament_reg_email_idx on public.tournament_registrations(participant_email);

-- Enable RLS
alter table public.tournament_registrations enable row level security;

-- Policies:
drop policy if exists "Users can view own tournament registrations or admin all" on public.tournament_registrations;
drop policy if exists "Anyone can register for tournaments" on public.tournament_registrations;
drop policy if exists "Only admin can update tournament registrations" on public.tournament_registrations;
drop policy if exists "Only admin can delete tournament registrations" on public.tournament_registrations;

create policy "Users can view own tournament registrations or admin all"
  on public.tournament_registrations for select
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() ->> 'email') = participant_email
    or public.is_admin()
  );

create policy "Anyone can register for tournaments"
  on public.tournament_registrations for insert
  to anon, authenticated
  with check (
    auth.uid() = user_id
    or user_id is null
    or public.is_admin()
  );

create policy "Only admin can update tournament registrations"
  on public.tournament_registrations for update
  to authenticated
  using (public.is_admin());

create policy "Only admin can delete tournament registrations"
  on public.tournament_registrations for delete
  to authenticated
  using (public.is_admin());
