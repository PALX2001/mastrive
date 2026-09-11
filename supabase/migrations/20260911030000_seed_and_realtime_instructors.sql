-- REALTIME INSTRUCTOR DIRECTORY SETUP & SEED (MASTRIVE)
-- Enables live Supabase Table Editor edits, deletions, and real-time frontend updates

-- 1. Ensure columns on public.instructors are flexible and complete
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.instructor_applications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  profile_type text not null default 'individual',
  institute_name text,
  skill text not null,
  category text not null default 'Fitness & Combat',
  locality text,
  city text default 'Delhi',
  experience_years text,
  education text,
  certifications text,
  teaching_modes text[] not null default '{}',
  languages_spoken text[] not null default '{}',
  age_groups_taught text[] not null default '{}',
  price_per_hour numeric default 1000,
  rating numeric default 4.9,
  reviews_count integer default 10,
  bio text,
  image_urls text[] not null default '{}',
  learners_count integer not null default 0,
  is_verified boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Make sure application_id and user_id are nullable so custom rows can be created directly in Supabase
alter table public.instructors alter column application_id drop not null;
alter table public.instructors alter column user_id drop not null;
alter table public.instructors add column if not exists rating numeric default 4.9;
alter table public.instructors add column if not exists reviews_count integer default 10;
alter table public.instructors add column if not exists learners_count integer not null default 0;
alter table public.instructors add column if not exists is_verified boolean not null default false;
alter table public.instructors add column if not exists image_urls text[] not null default '{}';
alter table public.instructors add column if not exists is_published boolean not null default true;

-- 2. Enable Realtime on instructors table
do $$
begin
  alter publication supabase_realtime add table public.instructors;
exception
  when duplicate_object then null;
end $$;

alter table public.instructors replica identity full;

-- 3. RLS Policies allowing full read and dashboard updates
alter table public.instructors enable row level security;

drop policy if exists "Anyone can read published instructors" on public.instructors;
create policy "Anyone can read published instructors"
  on public.instructors for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Anyone can insert instructors" on public.instructors;
create policy "Anyone can insert instructors"
  on public.instructors for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can update instructors" on public.instructors;
create policy "Anyone can update instructors"
  on public.instructors for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Anyone can delete instructors" on public.instructors;
create policy "Anyone can delete instructors"
  on public.instructors for delete
  to anon, authenticated
  using (true);

-- 4. Seed initial instructors directly into the table
-- Using fixed UUIDs so rerunning won't duplicate them
insert into public.instructors (
  id,
  display_name,
  skill,
  category,
  locality,
  city,
  price_per_hour,
  rating,
  reviews_count,
  experience_years,
  image_urls,
  teaching_modes,
  languages_spoken,
  bio,
  learners_count,
  is_verified,
  is_published
) values
(
  '00000000-0000-0000-0000-000000000001',
  'Ikjot Singh',
  'Fitness Coach',
  'Fitness & Combat',
  'Safdarjung',
  'Delhi',
  1200,
  4.9,
  128,
  '7 years',
  array['/instructors/ikjot-1.jpeg', '/instructors/ikjot-2.jpeg', '/instructors/ikjot-3.jpeg'],
  array['Studio Sessions', 'Home Visit', 'Live 1-on-1 Stream'],
  array['English', 'Hindi', 'Punjabi'],
  'Results-driven personal fitness coach specialising in strength training, progressive overload, muscle hypertrophy, and fat loss conditioning. I design structured, science-backed programmes that build real strength, correct posture, and create lasting lifestyle change.',
  340,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Aisha Rahman',
  'Muay Thai Conditioning',
  'Fitness & Combat',
  'Gurgaon',
  'Gurgaon',
  1500,
  4.8,
  94,
  '6 years',
  array['https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800'],
  array['Academy Training', 'Online Technical Breakdown'],
  array['English', 'Hindi'],
  'Pro combat athlete offering high-intensity striking drills, clinch technique, and core endurance conditioning. Focused on authentic Thai boxing mechanics, power generation from hips, and active self-defense.',
  210,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Vikram Singh',
  'Kickboxing for Beginners',
  'Fitness & Combat',
  'Live Stream',
  'Delhi',
  800,
  4.7,
  52,
  '4 years',
  array['https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&q=80&w=800'],
  array['Live Online Stream', 'Group Virtual Streams'],
  array['English', 'Hindi'],
  'Interactive beginner-friendly kickboxing sessions focusing on form, rhythm, cardio, and basic striking combos. Zero equipment needed—just your living room, passion, and determination.',
  8,
  false, -- Unverified (under 10 learners)
  true
),
(
  '00000000-0000-0000-0000-000000000004',
  'Meera Nair',
  'Fingerstyle Guitar',
  'Music & Arts',
  'Live Stream',
  'Mumbai',
  1000,
  5.0,
  210,
  '8 years',
  array['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800'],
  array['Live Online Stream', 'In-Person Studio'],
  array['English', 'Hindi', 'Malayalam'],
  'Acoustic fingerstyle guitar teacher covering percussive techniques, solo arrangements, slap harmonics, and practical music theory. Tailored guidance whether you are a beginner or looking to master complex polyphonic solos.',
  490,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000005',
  'Arjun Mehta',
  'Watercolour Landscapes',
  'Music & Arts',
  'Hauz Khas',
  'Delhi',
  900,
  4.9,
  76,
  '9 years',
  array['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'],
  array['Hauz Khas Village Studio', 'Plein Air Workshops'],
  array['English', 'Hindi'],
  'Traditional watercolour artist teaching wet-on-wet gradients, color blending, landscape perspective, and expressive brushwork. Learn to capture light, mist, and atmospheric textures on paper with confidence.',
  165,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000006',
  'Kabir Chawla',
  'Tournament Chess Strategy',
  'Strategy & Tech',
  'Live Stream',
  'Delhi',
  1100,
  4.9,
  143,
  '6 years',
  array['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800'],
  array['Interactive Online Analysis Board', 'Deep Game Review'],
  array['English', 'Hindi'],
  'FIDE rated tournament player analyzing opening repertoires, tactical calculations, middle-game pawn structures, and endgame masterclasses. Proven track record of boosting student ratings by 300+ points on Chess.com and FIDE.',
  310,
  true,
  true
)
on conflict (id) do update set
  display_name = excluded.display_name,
  skill = excluded.skill,
  category = excluded.category,
  locality = excluded.locality,
  city = excluded.city,
  price_per_hour = excluded.price_per_hour,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  experience_years = excluded.experience_years,
  image_urls = excluded.image_urls,
  teaching_modes = excluded.teaching_modes,
  languages_spoken = excluded.languages_spoken,
  bio = excluded.bio,
  learners_count = excluded.learners_count,
  is_verified = excluded.is_verified,
  is_published = excluded.is_published,
  updated_at = now();
