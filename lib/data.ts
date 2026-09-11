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
  images?: string[]
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
    category: 'FITNESS & COMBAT',
    name: 'Capital Strength & Sparring Challenge',
    entryFee: 750,
    prizePool: 40000,
    date: 'Upcoming • Registrations Open',
  },
  {
    id: 't2',
    category: 'STRATEGY & TECH',
    name: 'NCR Rapid Chess Open',
    entryFee: 300,
    prizePool: 18000,
    date: 'Upcoming • Registrations Open',
  },
  {
    id: 't3',
    category: 'MUSIC & ARTS',
    name: 'Acoustic & Solo Showcase',
    entryFee: 500,
    prizePool: 25000,
    date: 'Upcoming • Registrations Open',
  },
  {
    id: 't4',
    category: 'LIFESTYLE',
    name: 'Mindful Movement & Wellness Meet',
    entryFee: 200,
    prizePool: 12000,
    date: 'Upcoming • Registrations Open',
  },
]

export type LeaderboardEntry = {
  rank: number
  name: string
  category: string
  skill: string
  state: string
  xp: number
  verifiedHrs: number
  status: 'certified' | 'rising'
  isUser?: boolean
}

export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Ikjot Singh',
    category: 'Fitness & Combat',
    skill: 'Fitness & Strength Coach',
    state: 'Delhi',
    xp: 5010,
    verifiedHrs: 288,
    status: 'certified',
  },
  {
    rank: 2,
    name: 'You (Learner)',
    category: 'Fitness & Combat',
    skill: 'Strength Training',
    state: 'Delhi',
    xp: 1200,
    verifiedHrs: 18,
    status: 'rising',
    isUser: true,
  },
]

export const cities = ['All Cities', 'Delhi', 'Gurgaon', 'Mumbai', 'Bengaluru']

