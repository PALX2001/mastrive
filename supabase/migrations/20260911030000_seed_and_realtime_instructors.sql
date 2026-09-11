-- MASTRIVE: Full Instructor Seed + Realtime Setup
-- Run this in Supabase SQL Editor → New Query → Run
-- This seeds ALL instructor cards exactly as they appear on the website

-- 1. Schema: make sure all needed columns exist
alter table public.instructors alter column application_id drop not null;
alter table public.instructors alter column user_id drop not null;
alter table public.instructors add column if not exists rating numeric default 4.9;
alter table public.instructors add column if not exists reviews_count integer default 10;
alter table public.instructors add column if not exists learners_count integer not null default 0;
alter table public.instructors add column if not exists is_verified boolean not null default false;
alter table public.instructors add column if not exists image_urls text[] not null default '{}';
alter table public.instructors add column if not exists is_published boolean not null default true;

-- 2. Enable Supabase Realtime (idempotent)
do $$
begin
  alter publication supabase_realtime add table public.instructors;
exception when duplicate_object then null;
end $$;

-- replica identity full is needed so DELETE events carry the old row data
alter table public.instructors replica identity full;

-- 3. RLS Policies (anon can read; service role seeds)
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

-- 4. Seed ALL 8 instructors (fixed UUIDs so re-running is idempotent)
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
  education,
  certifications,
  learners_count,
  is_verified,
  is_published,
  published_at
) values

-- 1. Ikjot Singh – Fitness Coach
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
  array['Studio Sessions (Siri Fort / South Delhi)', 'Home Visit (South Delhi on request)', 'Live 1-on-1 Stream'],
  array['English', 'Hindi', 'Punjabi'],
  'Results-driven personal fitness coach specialising in strength training, progressive overload, muscle hypertrophy, and fat loss conditioning. I design structured, science-backed programmes that build real strength, correct posture, and create lasting lifestyle change — whether you train at the gym, at home, or online.',
  'Bachelor of Physical Education (B.P.Ed), Delhi University',
  'Certified Strength & Conditioning Specialist – NSCA India',
  340,
  true,
  true,
  now() - interval '30 days'
),

-- 2. Aisha Rahman – Muay Thai
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
  array['Academy Training (Gurgaon Sector 29)', 'Online Technical Breakdown'],
  array['English', 'Hindi'],
  'Pro combat athlete offering high-intensity striking drills, clinch technique, and core endurance conditioning. Focused on authentic Thai boxing mechanics, power generation from hips, and active self-defense.',
  'Certified Combat Arts Trainer, World Muay Thai Council (WMC)',
  'WMC Certified Muay Thai Kru Instructor',
  210,
  true,
  true,
  now() - interval '25 days'
),

-- 3. Vikram Singh – Kickboxing (8 learners → not verified yet)
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
  array['Mastrive 1-on-1 HD Live Stream', 'Group Virtual Streams'],
  array['English', 'Hindi'],
  'Interactive beginner-friendly kickboxing sessions focusing on form, rhythm, cardio, and basic striking combos. Zero equipment needed—just your living room, passion, and determination.',
  'Certified Kickboxing Fitness Specialist (WAKO)',
  'WAKO Certified Kickboxing Instructor',
  8,
  false,
  true,
  now() - interval '20 days'
),

-- 4. Meera Nair – Fingerstyle Guitar
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
  array['1-on-1 Multi-Camera Online Studio Stream', 'Mumbai In-Person Studio'],
  array['English', 'Hindi', 'Malayalam'],
  'Acoustic fingerstyle guitar teacher covering percussive techniques, solo arrangements, slap harmonics, and practical music theory. Tailored guidance whether you are a beginner or looking to master complex polyphonic solos.',
  'Grade 8 Classical & Acoustic Guitar, Trinity College London',
  'Grade 8 Classical Guitar (Distinction) – Trinity College London',
  490,
  true,
  true,
  now() - interval '18 days'
),

-- 5. Arjun Mehta – Watercolour
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
  array['Hauz Khas Village Art Studio', 'Outdoor Plein Air Workshops'],
  array['English', 'Hindi'],
  'Traditional watercolour artist teaching wet-on-wet gradients, color blending, landscape perspective, and expressive brushwork. Learn to capture light, mist, and atmospheric textures on paper with confidence.',
  'Bachelor of Fine Arts (BFA), College of Art, Delhi',
  'National Youth Art Exhibition Winner – Lalit Kala Akademi',
  165,
  true,
  true,
  now() - interval '15 days'
),

-- 6. Kabir Chawla – Chess
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
  array['Interactive Online Analysis Board (Lichess/Chess.com)', 'Deep Game Review Sessions'],
  array['English', 'Hindi'],
  'FIDE rated tournament player analyzing opening repertoires, tactical calculations, middle-game pawn structures, and endgame masterclasses. Proven track record of boosting student ratings by 300+ points on Chess.com and FIDE.',
  'FIDE Certified Instructor (FIDE Trainer Commission)',
  'FIDE Candidate Master Title (CM) – World Chess Federation',
  310,
  true,
  true,
  now() - interval '12 days'
),

-- 7. Nisha Verma – Competitive Coding (38 learners → not verified)
(
  '00000000-0000-0000-0000-000000000007',
  'Nisha Verma',
  'Competitive Coding Bootcamp',
  'Strategy & Tech',
  'Live Stream',
  'Bengaluru',
  1400,
  4.6,
  38,
  '5 years',
  array['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'],
  array['Live Screen Coding & Pair Programming Stream'],
  array['English', 'Hindi'],
  'Software engineer guiding students through Data Structures, Algorithms, System Design basics, and LeetCode problem-solving patterns. Ace your FAANG & high-growth startup coding rounds.',
  'B.Tech in Computer Science, IIIT Bangalore',
  'LeetCode Guardian Rated (Top 1%)',
  220,
  true,
  true,
  now() - interval '10 days'
),

-- 8. Dev Malhotra – Yoga
(
  '00000000-0000-0000-0000-000000000008',
  'Dev Malhotra',
  'Vinyasa Yoga Flow',
  'Lifestyle',
  'Saket',
  'Delhi',
  700,
  4.8,
  165,
  '8 years',
  array['https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800'],
  array['Saket Yoga Shala (Garden Studio)', 'Online Morning Sunrise Flows'],
  array['English', 'Hindi', 'Sanskrit'],
  'Certified yoga practitioner delivering breath-focused Vinyasa flows, alignment correction, and restorative pranayama designed for mobility, mental stillness, and posture recovery.',
  'Diploma in Yogic Science, Morarji Desai National Institute of Yoga',
  'RYT-500 Master Yoga Teacher – Yoga Alliance USA',
  520,
  true,
  true,
  now() - interval '8 days'
)

on conflict (id) do update set
  display_name     = excluded.display_name,
  skill            = excluded.skill,
  category         = excluded.category,
  locality         = excluded.locality,
  city             = excluded.city,
  price_per_hour   = excluded.price_per_hour,
  rating           = excluded.rating,
  reviews_count    = excluded.reviews_count,
  experience_years = excluded.experience_years,
  image_urls       = excluded.image_urls,
  teaching_modes   = excluded.teaching_modes,
  languages_spoken = excluded.languages_spoken,
  bio              = excluded.bio,
  education        = excluded.education,
  certifications   = excluded.certifications,
  learners_count   = excluded.learners_count,
  is_verified      = excluded.is_verified,
  is_published     = excluded.is_published,
  updated_at       = now();

