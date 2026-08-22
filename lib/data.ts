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
}

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Rohan Kapoor',
    verified: true,
    skill: 'Boxing Fundamentals',
    category: 'fitness',
    mode: 'in-person',
    area: 'South Delhi',
    city: 'Delhi',
    rating: 4.9,
    reviews: 128,
    price: 1200,
    tag: 'IN-PERSON: SOUTH DELHI',
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
    name: 'Rohan Kapoor',
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