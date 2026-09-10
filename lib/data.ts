import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  Swords,
  Palette,
  BrainCircuit,
  Leaf,
} from 'lucide-react'

export type CategoryId =
  | 'all'
  | 'fitness'
  | 'music'
  | 'strategy'
  | 'lifestyle'

export type Category = {
  id: CategoryId
  label: string
  icon: LucideIcon
}

export const categories: Category[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'fitness', label: 'Fitness & Combat', icon: Swords },
  { id: 'music', label: 'Music & Arts', icon: Palette },
  { id: 'strategy', label: 'Strategy & Tech', icon: BrainCircuit },
  { id: 'lifestyle', label: 'Lifestyle', icon: Leaf },
]

export const categoryLabelMap: Record<CategoryId, string> = {
  all: 'All Skills',
  fitness: 'Fitness/Combat',
  music: 'Music & Arts',
  strategy: 'Strategy/Tech',
  lifestyle: 'Lifestyle',
}

export type Mode = 'all' | 'in-person' | 'online'

export type Instructor = {
  id: string
  name: string
  verified: boolean
  skill: string
  category: CategoryId
  mode: 'in-person' | 'online'
  area: string
  city: string
  rating: number
  reviews: number
  price: number
  tag: string
  image?: string
  icon?: string
  description?: string
  headline?: string
  experienceYears?: number
  totalStudents?: number
  totalHours?: number
  languages?: string[]
  education?: string
  certifications?: { title: string; year: string; institute: string }[]
  modes?: string[]
  specialties?: string[]
  curriculum?: { title: string; desc: string }[]
  studentReviews?: { name: string; rating: number; comment: string; date: string; tag: string }[]
  packages?: { title: string; duration: string; price: number; badge?: string }[]
}

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Ikjot Singh',
    verified: true,
    skill: 'Fitness Coach',
    category: 'fitness',
    mode: 'in-person',
    area: 'Safdarjung',
    city: 'Delhi',
    rating: 4.9,
    reviews: 128,
    price: 1200,
    tag: 'IN-PERSON: SAFDARJUNG',
    image: '/instructors/ikjot-1.jpeg',
    images: [
      '/instructors/ikjot-1.jpeg',
      '/instructors/ikjot-2.jpeg',
      '/instructors/ikjot-3.jpeg'
    ],
    headline: 'Certified Strength & Conditioning Coach · Personal Fitness Transformation Specialist',
    experienceYears: 7,
    totalStudents: 340,
    totalHours: 2450,
    languages: ['English', 'Hindi', 'Punjabi'],
    education: 'Bachelor of Physical Education (B.P.Ed), Delhi University',
    description: 'Results-driven personal fitness coach specialising in strength training, progressive overload, muscle hypertrophy, and fat loss conditioning. I design structured, science-backed programmes that build real strength, correct posture, and create lasting lifestyle change — whether you train at the gym, at home, or online.',
    certifications: [
      { title: 'Certified Strength & Conditioning Specialist', institute: 'NSCA India', year: '2021' },
      { title: 'Personal Trainer Certification (Gold Standard)', institute: 'ACE Fitness', year: '2020' },
      { title: 'CPT & Nutrition Coach', institute: 'International Sports Sciences Association', year: '2019' },
    ],
    modes: ['Studio Sessions (Siri Fort / South Delhi)', 'Home Visit (South Delhi on request)', 'Live 1-on-1 Stream'],
    specialties: ['Strength & Hypertrophy', 'Fat Loss & Body Recomposition', 'Posture & Mobility Correction', 'Nutrition Guidance'],
    curriculum: [
      { title: 'Phase 1: Foundation, Form & Assessment', desc: 'Full movement screening, posture analysis, personalised warm-up routine, and mastery of compound lifts with correct form.' },
      { title: 'Phase 2: Progressive Strength & Conditioning', desc: 'Structured hypertrophy blocks, progressive overload tracking, conditioning circuits, and weekly progression check-ins.' },
      { title: 'Phase 3: Peak Transformation & Maintenance', desc: 'Calibrated nutrition integration, peak performance protocol, and sustainable maintenance coaching for lifelong results.' },
    ],
    studentReviews: [
      { name: 'Aarav Sharma', rating: 5, comment: 'Ikjot completely transformed my lifts and posture in 4 weeks. Super patient, technical, and genuinely invested in progress.', date: '2 weeks ago', tag: 'Strength Training' },
      { name: 'Tanya Mehra', rating: 5, comment: 'Best fitness coach I have worked with. The plans are personalised, the form cues are on point, and I see actual changes.', date: '1 month ago', tag: 'Body Transformation' },
      { name: 'Karan Joshi', rating: 4.8, comment: 'Great eye for technique corrections. Helped me break plateaus in my bench and squat without any injuries.', date: '2 months ago', tag: 'Powerlifting' },
    ],
    packages: [
      { title: 'Single 1-on-1 Trial Session', duration: '60 min', price: 1200, badge: 'Popular' },
      { title: '5-Session Strength & Form Mastery Pass', duration: '5 × 60 min', price: 5400, badge: '10% Off' },
      { title: '10-Session Full Transformation Bootcamp', duration: '10 × 60 min', price: 9999, badge: 'Best Value' },
    ]
  },
  {
    id: '2',
    name: 'Aisha Rahman',
    verified: true,
    skill: 'Muay Thai Conditioning',
    category: 'fitness',
    mode: 'in-person',
    area: 'Gurgaon',
    city: 'Gurgaon',
    rating: 4.8,
    reviews: 94,
    price: 1500,
    tag: 'IN-PERSON: GURGAON',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800',
    headline: 'National Muay Thai Silver Medalist · 8 Limbs Striking & Clinch Expert',
    experienceYears: 6,
    totalStudents: 210,
    totalHours: 1920,
    languages: ['English', 'Hindi'],
    education: 'Certified Combat Arts Trainer, World Muay Thai Council (WMC)',
    description: 'Pro combat athlete offering high-intensity striking drills, clinch technique, and core endurance conditioning. Focused on authentic Thai boxing mechanics, power generation from hips, and active self-defense.',
    certifications: [
      { title: 'WMC Certified Muay Thai Kru Instructor', institute: 'World Muay Thai Council', year: '2020' },
      { title: 'Functional Combat Movement Coach', institute: 'ACE Fitness', year: '2022' },
    ],
    modes: ['Academy Training (Gurgaon Sector 29)', 'Online Technical Breakdown'],
    specialties: ['8 Limbs Striking', 'Clinch Control & Knee Strikes', 'Shin Conditioning', 'High Intensity Fight Cardio'],
    curriculum: [
      { title: 'Phase 1: Basic Strikes & Teep Kick Balance', desc: 'Developing solid shin kicks, teeps, horizontal elbows, and hip rotation.' },
      { title: 'Phase 2: Clinch Mechanics & Sweeps', desc: 'Head positioning, collar-tie control, knee power, and trip maneuvers.' },
      { title: 'Phase 3: Fight Conditioning & Combo Flow', desc: 'High-pace Dutch and Thai style kick-punch combinations with live mitt work.' },
    ],
    studentReviews: [
      { name: 'Simran Chadha', rating: 5, comment: 'Aisha pushes you past your limits in the best way. My core stamina and kick accuracy have skyrocketed.', date: '3 weeks ago', tag: 'Muay Thai' },
      { name: 'Rahul V.', rating: 5, comment: 'Incredible technical knowledge. She breaks down the biomechanics of every elbow and kick.', date: '1 month ago', tag: 'Striking Drills' },
    ],
    packages: [
      { title: '1-on-1 Muay Thai Session', duration: '60 min', price: 1500 },
      { title: '5-Session Striking & Clinch Intensive', duration: '5 × 60 min', price: 6750, badge: '10% Off' },
    ]
  },
  {
    id: '3',
    name: 'Vikram Singh',
    verified: false,
    skill: 'Kickboxing for Beginners',
    category: 'fitness',
    mode: 'online',
    area: 'Live Stream',
    city: 'Delhi',
    rating: 4.7,
    reviews: 52,
    price: 800,
    tag: 'LIVE ONLINE STREAM',
    image: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&q=80&w=800',
    headline: 'High-Energy Kickboxing & HIIT Conditioning Instructor',
    experienceYears: 4,
    totalStudents: 180,
    totalHours: 1100,
    languages: ['English', 'Hindi'],
    education: 'Certified Kickboxing Fitness Specialist (WAKO)',
    description: 'Interactive beginner-friendly kickboxing sessions focusing on form, rhythm, cardio, and basic striking combos. Zero equipment needed—just your living room, passion, and determination.',
    certifications: [
      { title: 'WAKO Certified Kickboxing Instructor', institute: 'WAKO India Federation', year: '2021' },
    ],
    modes: ['Mastrive 1-on-1 HD Live Stream', 'Group Virtual Streams'],
    specialties: ['Beginner Combos', 'Fat Burn HIIT Cardio', 'Shadowboxing Rhythm', 'Flexibility & Hip Mobility'],
    curriculum: [
      { title: 'Session 1-2: Basic Jab-Cross-Hook & Low Kick', desc: 'Understanding balance, core tightening, and fluid punch delivery.' },
      { title: 'Session 3-5: Cardio Kickboxing Flow', desc: 'High calorie burn workouts with continuous combo sequences.' },
    ],
    studentReviews: [
      { name: 'Neha Gupta', rating: 5, comment: 'Vikram makes virtual workouts feel as immersive as being in the gym. Fantastic energy!', date: '1 week ago', tag: 'Kickboxing Online' },
    ],
    packages: [
      { title: 'Virtual 1-on-1 Workout', duration: '45 min', price: 800 },
      { title: 'Monthly Virtual Fight Pass (8 Sessions)', duration: '8 × 45 min', price: 5600, badge: '12% Off' },
    ]
  },
  {
    id: '4',
    name: 'Meera Nair',
    verified: true,
    skill: 'Fingerstyle Guitar',
    category: 'music',
    mode: 'online',
    area: 'Live Stream',
    city: 'Mumbai',
    rating: 5.0,
    reviews: 210,
    price: 1000,
    tag: 'LIVE ONLINE STREAM',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800',
    headline: 'Trinity College London Grade 8 Certified Acoustic Soloist',
    experienceYears: 8,
    totalStudents: 490,
    totalHours: 3200,
    languages: ['English', 'Hindi', 'Malayalam'],
    education: 'Grade 8 Classical & Acoustic Guitar, Trinity College London',
    description: 'Acoustic fingerstyle guitar teacher covering percussive techniques, solo arrangements, slap harmonics, and practical music theory. Tailored guidance whether you are a beginner or looking to master complex polyphonic solos.',
    certifications: [
      { title: 'Grade 8 Classical Guitar (Distinction)', institute: 'Trinity College London', year: '2017' },
      { title: 'Acoustic Fingerstyle Arrangement Award', institute: 'All India Acoustic Summit', year: '2020' },
    ],
    modes: ['1-on-1 Multi-Camera Online Studio Stream', 'Mumbai In-Person Studio'],
    specialties: ['Percussive Slapping & Thumb Taps', 'Alternate Tunings (DADGAD)', 'Sight Reading & Tablature', 'Song Arrangement'],
    curriculum: [
      { title: 'Module 1: Thumb Independency & Trailing Notes', desc: 'Developing steady bassline rhythms while playing melody simultaneously.' },
      { title: 'Module 2: Percussive Techniques & Harmonics', desc: 'Slap harmonics, body tapping, palm muted grooves, and hammer-on pull-off runs.' },
      { title: 'Module 3: Solo Fingerstyle Repertoire', desc: 'Full song arrangements from Tommy Emmanuel to contemporary pop ballads.' },
    ],
    studentReviews: [
      { name: 'Arjun Das', rating: 5, comment: 'Meera has a crystal-clear way of teaching thumb-finger independence. I can now play my favorite songs with percussion!', date: '5 days ago', tag: 'Fingerstyle' },
      { name: 'Kavita Menon', rating: 5, comment: 'The multi-camera stream shows every finger position perfectly. Worth every rupee.', date: '3 weeks ago', tag: 'Acoustic Mastery' },
    ],
    packages: [
      { title: '1-on-1 Fingerstyle Live Lesson', duration: '60 min', price: 1000 },
      { title: '4-Week Fingerstyle Roadmap (4 Sessions)', duration: '4 × 60 min', price: 3600, badge: '10% Off' },
    ]
  },
  {
    id: '5',
    name: 'Arjun Mehta',
    verified: true,
    skill: 'Watercolour Landscapes',
    category: 'music',
    mode: 'in-person',
    area: 'Hauz Khas',
    city: 'Delhi',
    rating: 4.9,
    reviews: 76,
    price: 900,
    tag: 'IN-PERSON: HAUZ KHAS',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
    headline: 'Fine Arts Alumnus · Exhibited Watercolorist & Plein Air Painter',
    experienceYears: 9,
    totalStudents: 165,
    totalHours: 1400,
    languages: ['English', 'Hindi'],
    education: 'Bachelor of Fine Arts (BFA), College of Art, Delhi',
    description: 'Traditional watercolour artist teaching wet-on-wet gradients, color blending, landscape perspective, and expressive brushwork. Learn to capture light, mist, and atmospheric textures on paper with confidence.',
    certifications: [
      { title: 'National Youth Art Exhibition Winner', institute: 'Lalit Kala Akademi', year: '2019' },
    ],
    modes: ['Hauz Khas Village Art Studio', 'Outdoor Plein Air Workshops'],
    specialties: ['Wet-on-Wet Blending', 'Atmospheric Lighting & Mist', 'Color Palette Harmony', 'Plein Air Sketching'],
    curriculum: [
      { title: 'Step 1: Pigment Ratios & Paper Absorption', desc: 'Understanding paper moisture, granulating pigments, and brush loaded washes.' },
      { title: 'Step 2: Negative Space & Sunlight Effects', desc: 'Preserving white space for light, mountain silhouetting, and sky gradients.' },
      { title: 'Step 3: Complete Finished Masterpiece', desc: 'Painting a full Delhi monuments or Himalayan landscape with rich textural details.' },
    ],
    studentReviews: [
      { name: 'Pallavi Rao', rating: 5, comment: 'Arjun is an incredible artist and an even better teacher. The studio environment in Hauz Khas is so inspiring.', date: '1 month ago', tag: 'Watercolour' },
    ],
    packages: [
      { title: 'Studio Watercolour Workshop', duration: '90 min', price: 900 },
      { title: 'Weekend Landscape Series (3 Sessions)', duration: '3 × 90 min', price: 2400 },
    ]
  },
  {
    id: '6',
    name: 'Kabir Chawla',
    verified: true,
    skill: 'Tournament Chess Strategy',
    category: 'strategy',
    mode: 'online',
    area: 'Live Stream',
    city: 'Delhi',
    rating: 4.9,
    reviews: 143,
    price: 1100,
    tag: 'LIVE ONLINE STREAM',
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800',
    headline: 'FIDE Rated 2180 Candidate Master · Competitive Tournament Coach',
    experienceYears: 6,
    totalStudents: 310,
    totalHours: 2800,
    languages: ['English', 'Hindi'],
    education: 'FIDE Certified Instructor (FIDE Trainer Commission)',
    description: 'FIDE rated tournament player analyzing opening repertoires, tactical calculations, middle-game pawn structures, and endgame masterclasses. Proven track record of boosting student ratings by 300+ points on Chess.com and FIDE.',
    certifications: [
      { title: 'FIDE Candidate Master Title (CM)', institute: 'World Chess Federation', year: '2019' },
      { title: 'Delhi State Rapid Chess Champion', institute: 'Delhi Chess Association', year: '2022' },
    ],
    modes: ['Interactive Online Analysis Board (Lichess/Chess.com)', 'Deep Game Review Sessions'],
    specialties: ['Sicilian & Italian Openings', 'Positional Pawn Structures', 'Calculation Under Time Pressure', 'Endgame Conversions'],
    curriculum: [
      { title: 'Phase 1: Tactical Spotting & Blunder Prevention', desc: 'Forks, skewers, deflection puzzles, and disciplined calculation trees.' },
      { title: 'Phase 2: Custom Opening Repertoire', desc: 'Building reliable White and Black arsenals tailored to your playing style.' },
      { title: 'Phase 3: Live Tournament Game Analysis', desc: 'Deconstructing your losses move-by-move to eradicate tactical blindspots.' },
    ],
    studentReviews: [
      { name: 'Rohit Gupta', rating: 5, comment: 'Gained 250 Elo rating points within 6 weeks of studying middle games with Kabir!', date: '2 weeks ago', tag: 'Chess Tactics' },
    ],
    packages: [
      { title: '1-on-1 Grandmaster Repertoire Analysis', duration: '60 min', price: 1100 },
      { title: 'Tournament Prep Package (5 Sessions)', duration: '5 × 60 min', price: 4950, badge: '10% Off' },
    ]
  },
  {
    id: '7',
    name: 'Nisha Verma',
    verified: false,
    skill: 'Competitive Coding Bootcamp',
    category: 'strategy',
    mode: 'online',
    area: 'Live Stream',
    city: 'Bengaluru',
    rating: 4.6,
    reviews: 38,
    price: 1400,
    tag: 'LIVE ONLINE STREAM',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    headline: 'Ex-FAANG Senior Engineer · LeetCode 2000+ Guardian Rated',
    experienceYears: 5,
    totalStudents: 220,
    totalHours: 1500,
    languages: ['English', 'Hindi'],
    education: 'B.Tech in Computer Science, IIIT Bangalore',
    description: 'Software engineer guiding students through Data Structures, Algorithms, System Design basics, and LeetCode problem-solving patterns. Ace your FAANG & high-growth startup coding rounds.',
    certifications: [
      { title: 'LeetCode Guardian Rated (Top 1%)', institute: 'LeetCode', year: '2023' },
    ],
    modes: ['Live Screen Coding & Pair Programming Stream'],
    specialties: ['Dynamic Programming', 'Graph Algorithms & Trees', 'Time-Space Complexity', 'Mock FAANG Interviews'],
    curriculum: [
      { title: 'Week 1: Two Pointers, Sliding Window & Hash Maps', desc: 'Mastering linear array patterns and edge cases with zero hesitation.' },
      { title: 'Week 2: Binary Search & Tree Traversals', desc: 'DFS, BFS, prefix trees, and recursive calculation patterns.' },
      { title: 'Week 3: Dynamic Programming Masterclass', desc: 'Top-down memoization, bottom-up tabulations, and knapsack variations.' },
    ],
    studentReviews: [
      { name: 'Priya Verma', rating: 5, comment: 'Cracked my SDE-2 interview thanks to Nisha’s systematic breakdown of hard graph problems!', date: '1 month ago', tag: 'Coding Bootcamp' },
    ],
    packages: [
      { title: '1-on-1 Live Coding & Mock Interview', duration: '60 min', price: 1400 },
    ]
  },
  {
    id: '8',
    name: 'Dev Malhotra',
    verified: true,
    skill: 'Vinyasa Yoga Flow',
    category: 'lifestyle',
    mode: 'in-person',
    area: 'Saket',
    city: 'Delhi',
    rating: 4.8,
    reviews: 165,
    price: 700,
    tag: 'IN-PERSON: SAKET',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
    headline: 'RYT 500 Yoga Alliance Certified Master · Breathwork & Asana Coach',
    experienceYears: 8,
    totalStudents: 520,
    totalHours: 3600,
    languages: ['English', 'Hindi', 'Sanskrit'],
    education: 'Diploma in Yogic Science, Morarji Desai National Institute of Yoga',
    description: 'Certified yoga practitioner delivering breath-focused Vinyasa flows, alignment correction, and restorative pranayama designed for mobility, mental stillness, and posture recovery.',
    certifications: [
      { title: 'RYT-500 Master Yoga Teacher', institute: 'Yoga Alliance USA', year: '2018' },
    ],
    modes: ['Saket Yoga Shala (Garden Studio)', 'Online Morning Sunrise Flows'],
    specialties: ['Vinyasa Breath Alignment', 'Pranayama & Meditation', 'Spine & Hip Mobility', 'Stress Reduction'],
    curriculum: [
      { title: 'Module 1: Foundation of Asanas & Pranayama', desc: 'Sun salutations, pelvic alignment, and deep diaphragmatic breath coordination.' },
      { title: 'Module 2: Balance, Twists & Inversions', desc: 'Building core stability for crow pose, headstand preparation, and spinal decompression.' },
      { title: 'Module 3: Restorative Yin & Sound Meditation', desc: 'Deep fascia release, sound vibrations, and nervous system relaxation.' },
    ],
    studentReviews: [
      { name: 'Ankita Sen', rating: 5, comment: 'Dev’s morning Vinyasa sessions have completely resolved my lower back pain. Pure zen.', date: '2 weeks ago', tag: 'Yoga' },
    ],
    packages: [
      { title: '1-on-1 Studio Session', duration: '60 min', price: 700 },
      { title: 'Monthly Wellness Pass (12 Sessions)', duration: '12 × 60 min', price: 7200, badge: 'Best Value' },
    ]
  },
]

export type Tournament = {
  id: string
  category: string
  name: string
  entryFee: number
  prizePool: number
  date: string
}

export const tournaments: Tournament[] = [
  {
    id: 't1',
    category: 'MUSIC & ARTS',
    name: 'Delhi Guitar Solo Showcase',
    entryFee: 500,
    prizePool: 25000,
    date: 'Sat, 12 Sep',
  },
  {
    id: 't2',
    category: 'FITNESS & COMBAT',
    name: 'Capital Amateur Boxing Cup',
    entryFee: 750,
    prizePool: 40000,
    date: 'Sun, 20 Sep',
  },
  {
    id: 't3',
    category: 'STRATEGY & TECH',
    name: 'NCR Rapid Chess Open',
    entryFee: 300,
    prizePool: 18000,
    date: 'Sat, 26 Sep',
  },
  {
    id: 't4',
    category: 'LIFESTYLE',
    name: 'Mindful Movement Challenge',
    entryFee: 200,
    prizePool: 12000,
    date: 'Sun, 04 Oct',
  },
]

export type LeaderboardEntry = {
  rank: number
  name: string
  category: string
  xp: number
  verifiedHrs: number
  status: 'certified' | 'rising'
  isUser?: boolean
}

export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Meera Nair',
    category: 'Music & Arts',
    xp: 5420,
    verifiedHrs: 312,
    status: 'certified',
  },
  {
    rank: 2,
    name: 'Ikjot Singh',
    category: 'Fitness & Combat',
    xp: 5010,
    verifiedHrs: 288,
    status: 'certified',
  },
  {
    rank: 3,
    name: 'Kabir Chawla',
    category: 'Strategy & Tech',
    xp: 4780,
    verifiedHrs: 254,
    status: 'certified',
  },
  {
    rank: 4,
    name: 'Dev Malhotra',
    category: 'Lifestyle',
    xp: 3990,
    verifiedHrs: 201,
    status: 'rising',
  },
  {
    rank: 5,
    name: 'You (Palash B.)',
    category: 'Fitness & Combat',
    xp: 3640,
    verifiedHrs: 176,
    status: 'rising',
    isUser: true,
  },
  {
    rank: 6,
    name: 'Aisha Rahman',
    category: 'Fitness & Combat',
    xp: 3120,
    verifiedHrs: 152,
    status: 'rising',
  },
  {
    rank: 7,
    name: 'Arjun Mehta',
    category: 'Music & Arts',
    xp: 2890,
    verifiedHrs: 131,
    status: 'rising',
  },
]

export const cities = ['All Cities', 'Delhi', 'Gurgaon', 'Mumbai', 'Bengaluru']
