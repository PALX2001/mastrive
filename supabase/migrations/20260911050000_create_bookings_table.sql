-- ====================================================================
-- MASTRIVE: Bookings Table & Escrow Accounting
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ====================================================================

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  instructor_id text,
  instructor_name text not null,
  instructor_skill text,
  session_date text not null,
  session_time text not null,
  booking_type text not null default 'single',
  mode text not null default 'in-person',
  person_count integer not null default 1,
  total_amount numeric not null,
  platform_fee numeric not null default 0,
  instructor_payout numeric not null default 0,
  payment_method text not null default 'upi_qr',
  payment_reference text,
  status text not null default 'confirmed',
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for lightning fast lookups
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_customer_email_idx on public.bookings(customer_email);
create index if not exists bookings_created_at_idx on public.bookings(created_at desc);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- RLS Policies
drop policy if exists "Anyone can insert bookings" on public.bookings;
create policy "Anyone can insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Users can view their own bookings" on public.bookings;
create policy "Users can view their own bookings"
  on public.bookings for select
  to anon, authenticated
  using (
    auth.uid() = user_id 
    or user_id is null 
    or auth.jwt() ->> 'email' = customer_email
    or true -- allows transparent read in MVP dashboard
  );

drop policy if exists "Users can update their bookings" on public.bookings;
create policy "Users can update their bookings"
  on public.bookings for update
  to anon, authenticated
  using (true)
  with check (true);

-- Enable Realtime
do $$
begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null;
end $$;

alter table public.bookings replica identity full;

