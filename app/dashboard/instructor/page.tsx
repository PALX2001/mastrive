'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { 
  MessageSquare, 
  Wallet, 
  Share2, 
  CheckCircle2, 
  Clock, 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  Send, 
  Copy, 
  Menu,
  LogOut,
  User as UserIcon,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Star,
  Users,
  Video,
  MapPin,
  Plus,
  ChevronRight,
  ExternalLink,
  Layers,
  Award,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Bell,
  SlidersHorizontal,
  RefreshCw,
  QrCode
} from 'lucide-react'

type DashTab = 'dash' | 'inbox' | 'calendar' | 'earnings' | 'services'

const navItems: { id: DashTab; label: string; badge?: string }[] = [
  { id: 'dash', label: 'Overview' },
  { id: 'inbox', label: 'Learner Inbox', badge: '2' },
  { id: 'calendar', label: 'Schedule & Slots' },
  { id: 'earnings', label: 'Earnings & Escrow' },
  { id: 'services', label: 'Services & Pricing' },
]

interface RequestItem {
  id: string
  name: string
  avatar?: string
  service: string
  mode: 'in-person' | 'online'
  location: string
  price: number
  message: string
  status: 'pending' | 'accepted' | 'declined'
  time: string
  date: string
}

interface UpcomingSession {
  id: string
  learnerName: string
  service: string
  mode: 'in-person' | 'online'
  time: string
  status: 'confirmed' | 'in-progress' | 'completed'
  locationOrLink: string
  price: number
}

interface MessageThread {
  id: string
  name: string
  skill: string
  avatarLetter: string
  unread: number
  lastMessage: string
  time: string
  messages: { sender: 'learner' | 'instructor'; text: string; timestamp: string }[]
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profileName, setProfileName] = useState<string>('Instructor')
  const [profileSkill, setProfileSkill] = useState<string>('Boxing & Combat Fitness')
  const [bookingSlug, setBookingSlug] = useState<string>('instructor')
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<DashTab>('dash')
  const [isOnline, setIsOnline] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Interactive Modals
  const [activeModal, setActiveModal] = useState<'share' | 'reply' | 'reschedule' | 'payout' | 'add-slot' | 'add-service' | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [selectedLearner, setSelectedLearner] = useState<string>('')
  const [rescheduleDate, setRescheduleDate] = useState('')

  // Withdraw & Services states
  const [withdrawAmount, setWithdrawAmount] = useState('8500')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('60 min')
  const [newServiceMode, setNewServiceMode] = useState<'in-person' | 'online' | 'both'>('in-person')

  // Chat thread states
  const [selectedThreadId, setSelectedThreadId] = useState<string>('t1')
  const [chatInput, setChatInput] = useState('')

  // State for active request items
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'req-1',
      name: 'Vikram Malhotra',
      service: 'Boxing 1-on-1 Sparring',
      mode: 'in-person',
      location: 'Siri Fort Sports Complex, Delhi',
      price: 1500,
      message: '"Ready for the Saturday session at 5 PM? Have my own wraps."',
      status: 'accepted',
      time: '5:00 PM - 6:00 PM',
      date: 'Today, 24 Oct',
    },
    {
      id: 'req-2',
      name: 'Karan Patel',
      service: 'Combat Fitness Assessment',
      mode: 'online',
      location: 'Live Stream Room #204',
      price: 900,
      message: '"Looking to build stamina for amateur boxing tryouts."',
      status: 'pending',
      time: '10:00 AM - 11:00 AM',
      date: 'Tomorrow, 25 Oct',
    },
    {
      id: 'req-3',
      name: 'Ananya Sen',
      service: 'Pad Work & Striking Drills',
      mode: 'in-person',
      location: 'Hauz Khas Studio A',
      price: 1200,
      message: '"Would love to focus on defensive stance and slip counters."',
      status: 'pending',
      time: '4:00 PM - 5:00 PM',
      date: 'Sun, 26 Oct',
    },
  ])

  // Upcoming Confirmed Sessions
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([
    {
      id: 'sess-1',
      learnerName: 'Vikram Malhotra',
      service: 'Boxing 1-on-1 Sparring',
      mode: 'in-person',
      time: 'Today · 5:00 PM (In 45m)',
      status: 'confirmed',
      locationOrLink: 'Siri Fort Sports Complex, South Delhi',
      price: 1500,
    },
    {
      id: 'sess-2',
      learnerName: 'Devika Ray',
      service: 'Muay Thai Kick Drills',
      mode: 'online',
      time: 'Today · 7:30 PM',
      status: 'confirmed',
      locationOrLink: 'https://mastrive.com/live/rohits-muaythai',
      price: 1200,
    },
    {
      id: 'sess-3',
      learnerName: 'Rahul Duggal',
      service: 'Core Conditioning & Bag Work',
      mode: 'in-person',
      time: 'Tomorrow · 9:00 AM',
      status: 'confirmed',
      locationOrLink: 'Hauz Khas Studio B, New Delhi',
      price: 1000,
    },
  ])

  // Services Catalog
  const [services, setServices] = useState([
    {
      id: 's1',
      name: 'Boxing 1-on-1 (Fundamentals & Footwork)',
      duration: '60 min',
      mode: 'in-person',
      price: 1200,
      bookingsCount: 48,
      active: true,
    },
    {
      id: 's2',
      name: 'Advanced Pad Work & Sparring Drills',
      duration: '45 min',
      mode: 'in-person',
      price: 1500,
      bookingsCount: 32,
      active: true,
    },
    {
      id: 's3',
      name: 'Virtual Combat Fitness & Cardio Blast',
      duration: '50 min',
      mode: 'online',
      price: 800,
      bookingsCount: 65,
      active: true,
    },
    {
      id: 's4',
      name: 'Personalized Nutrition & Fight Prep Blueprint',
      duration: '30 min',
      mode: 'online',
      price: 1000,
      bookingsCount: 19,
      active: true,
    },
  ])

  // Weekly Calendar Slots
  const [calendarSlots, setCalendarSlots] = useState([
    { id: 'slot-1', day: 'Monday', time: '07:00 AM - 08:30 AM', title: 'Morning Conditioning', type: 'in-person', status: 'booked', student: 'Amit K.' },
    { id: 'slot-2', day: 'Monday', time: '05:00 PM - 06:00 PM', title: 'Boxing Sparring', type: 'in-person', status: 'open', student: null },
    { id: 'slot-3', day: 'Tuesday', time: '06:00 PM - 07:00 PM', title: 'Virtual Striking Class', type: 'online', status: 'booked', student: 'Rhea S.' },
    { id: 'slot-4', day: 'Wednesday', time: '08:00 AM - 09:00 AM', title: 'Heavy Bag Technique', type: 'in-person', status: 'open', student: null },
    { id: 'slot-5', day: 'Wednesday', time: '05:30 PM - 06:30 PM', title: 'Boxing 1-on-1', type: 'in-person', status: 'open', student: null },
    { id: 'slot-6', day: 'Thursday', time: '07:00 PM - 08:00 PM', title: 'Live Stream Core & Cardio', type: 'online', status: 'booked', student: 'Varun M.' },
    { id: 'slot-7', day: 'Friday', time: '06:00 PM - 07:30 PM', title: 'Weekend Combat Prep', type: 'in-person', status: 'open', student: null },
    { id: 'slot-8', day: 'Saturday', time: '09:00 AM - 10:30 AM', title: 'South Delhi Bootcamp', type: 'in-person', status: 'booked', student: 'Batch of 6' },
  ])

  // Chat Threads
  const [threads, setThreads] = useState<MessageThread[]>([
    {
      id: 't1',
      name: 'Vikram Malhotra',
      skill: 'Boxing 1-on-1',
      avatarLetter: 'VM',
      unread: 1,
      lastMessage: '"Ready for Siri Fort session at 5 PM?"',
      time: '12m ago',
      messages: [
        { sender: 'learner', text: 'Hi Rohit! Looking forward to today\'s session.', timestamp: '4:15 PM' },
        { sender: 'instructor', text: 'Hey Vikram! Bring your hand wraps and water bottle. I have the gloves ready.', timestamp: '4:18 PM' },
        { sender: 'learner', text: 'Ready for Siri Fort session at 5 PM? See you on Court 2!', timestamp: '4:22 PM' },
      ],
    },
    {
      id: 't2',
      name: 'Karan Patel',
      skill: 'Combat Fitness',
      avatarLetter: 'KP',
      unread: 1,
      lastMessage: '"Can we do online stream tomorrow at 10 AM?"',
      time: '1h ago',
      messages: [
        { sender: 'learner', text: 'Hello! I submitted a booking request for the fitness assessment.', timestamp: '3:05 PM' },
        { sender: 'learner', text: 'Can we do online stream tomorrow at 10 AM?', timestamp: '3:10 PM' },
      ],
    },
    {
      id: 't3',
      name: 'Devika Ray',
      skill: 'Muay Thai Kick Drills',
      avatarLetter: 'DR',
      unread: 0,
      lastMessage: '"Session confirmed for 7:30 PM tonight"',
      time: '3h ago',
      messages: [
        { sender: 'instructor', text: 'Session confirmed for 7:30 PM tonight on Mastrive Live.', timestamp: '1:45 PM' },
        { sender: 'learner', text: 'Awesome, see you online!', timestamp: '2:10 PM' },
      ],
    },
  ])

  // Check auth and load profile
  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const loadInstructorData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!isMounted) return

        if (error || !user) {
          router.replace('/login?next=/dashboard/instructor')
          return
        }

        setUser(user)

        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Instructor'
        setProfileName(name)
        const slug = (user.user_metadata?.full_name || user.email?.split('@')[0] || 'instructor')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
        setBookingSlug(slug)

        // Try to fetch profile or application data for skill
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, skill')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          if (profile.full_name) setProfileName(profile.full_name)
          if (profile.skill) setProfileSkill(profile.skill)
        } else {
          const { data: appData } = await supabase
            .from('instructor_applications')
            .select('full_name, skill')
            .eq('user_id', user.id)
            .maybeSingle()

          if (appData) {
            if (appData.full_name) setProfileName(appData.full_name)
            if (appData.skill) setProfileSkill(appData.skill)
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadInstructorData()

    return () => {
      isMounted = false
    }
  }, [router])

  const bookingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/instructor/${bookingSlug}`
    : `https://mastrive.com/instructor/${bookingSlug}`

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(bookingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [bookingLink])

  const handleAcceptRequest = useCallback((id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'accepted' } : r))
    )
  }, [])

  const handleDeclineRequest = useCallback((id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'declined' } : r))
    )
  }, [])

  const handleSendReply = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return
    setActiveModal(null)
    setReplyMessage('')
  }, [replyMessage])

  const handleSendMessageInThread = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    setThreads(prev =>
      prev.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            lastMessage: `"${chatInput}"`,
            messages: [
              ...t.messages,
              { sender: 'instructor', text: chatInput, timestamp: 'Just now' },
            ],
          }
        }
        return t
      })
    )
    setChatInput('')
  }

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newServiceName || !newServicePrice) return

    setServices(prev => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        name: newServiceName,
        duration: newServiceDuration,
        mode: newServiceMode === 'both' ? 'in-person' : newServiceMode,
        price: parseInt(newServicePrice) || 1000,
        bookingsCount: 0,
        active: true,
      }
    ])

    setNewServiceName('')
    setNewServicePrice('')
    setActiveModal(null)
  }

  const handleProcessPayout = (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawSuccess(true)
    setTimeout(() => {
      setWithdrawSuccess(false)
      setActiveModal(null)
    }, 1800)
  }

  const handleToggleSlot = (slotId: string) => {
    setCalendarSlots(prev =>
      prev.map(s => {
        if (s.id === slotId) {
          return {
            ...s,
            status: s.status === 'open' ? 'booked' : 'open',
            student: s.status === 'open' ? 'Manually Reserved' : null,
          }
        }
        return s
      })
    )
  }

  const activeThread = threads.find(t => t.id === selectedThreadId) || threads[0]

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080a0f] text-white">
        <div className="relative flex size-14 items-center justify-center">
          <div className="absolute size-full animate-ping rounded-full bg-[#e01e37]/20" />
          <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
          Loading Instructor Hub...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white font-sans selection:bg-[#e01e37] selection:text-white relative overflow-x-hidden">
      
      {/* Ambient background glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-[500px] rounded-full bg-[#e01e37]/10 blur-[140px]" />
        <div className="absolute right-0 top-1/4 size-[450px] rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute bottom-10 left-1/3 size-[500px] rounded-full bg-emerald-600/5 blur-[160px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0b0e14]/85 px-4 py-3 backdrop-blur-2xl sm:px-8">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Mobile Menu Button (< md) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#161b22]/80 text-[#f0f6fc] backdrop-blur-xl transition hover:border-white/20 active:scale-95 md:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Left: Official Logo */}
          <div className="flex items-center gap-5 z-10">
            <Link href="/" aria-label="MASTRIVE home" className="flex items-center group">
              <Image
                src="/logo.svg"
                alt="MASTRIVE"
                width={130}
                height={32}
                priority
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105 sm:h-8"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation Pills (≥ md) */}
          <nav className="hidden h-[50px] items-center gap-1 rounded-full border border-white/10 bg-[#14171f]/80 p-1.5 shadow-2xl backdrop-blur-2xl md:flex">
            {navItems.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex h-full items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold tracking-wide transition-all ${
                    active ? 'text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e01e37] to-[#b0142b] shadow-[0_2px_14px_rgba(224,30,55,0.45)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                  {item.badge && (
                    <span className={`relative z-10 flex size-4 items-center justify-center rounded-full text-[9px] font-bold ${
                      active ? 'bg-white text-[#e01e37]' : 'bg-[#e01e37] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right: Instructor Profile */}
          <div className="flex items-center gap-3 z-10">
            {/* Profile Avatar & Details */}
            <Link
              href="/profile"
              className="flex h-[42px] sm:h-[48px] items-center gap-2.5 rounded-full border border-white/10 bg-[#161b22]/80 px-3 sm:px-4 shadow-xl backdrop-blur-xl transition hover:border-white/20"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-[#e01e37]/20 border border-[#e01e37]/40 text-xs font-bold text-[#e01e37]">
                {profileName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight text-white line-clamp-1">{profileName}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Verified Coach</p>
              </div>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'dash' && (
          <div className="space-y-6">
            
            {/* 1. HERO BANNER: Welcome & Direct Booking Share */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#161b24] via-[#12151d] to-[#0c0f16] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              <div className="absolute -right-16 -top-16 size-72 rounded-full bg-[#e01e37]/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-10 bottom-0 size-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                    WELCOME BACK, <span className="bg-gradient-to-r from-[#e01e37] via-[#ff4d6d] to-[#ff758f] bg-clip-text text-transparent">{profileName.toUpperCase()}!</span>
                  </h1>
                  <p className="text-sm text-[#8b949e] mt-1.5 max-w-2xl leading-relaxed">
                    You have <strong className="text-white">3 confirmed sessions</strong> today. 100% of your earnings go straight to your bank account with zero deduction during the founder promo period.
                  </p>

                  {/* Rating & Performance Trust Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 font-medium text-yellow-400">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      <strong>4.9</strong> (148 verified reviews)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 font-medium text-emerald-400">
                      <ShieldCheck className="size-3.5" />
                      100% Escrow Protection
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 font-medium text-indigo-400">
                      <Award className="size-3.5" />
                      Rank #2 Combat Tier (Delhi NCR)
                    </span>
                  </div>
                </div>

                {/* Quick Action CTAs */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px]">
                  <button
                    onClick={() => setActiveModal('share')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_20px_rgba(224,30,55,0.4)] transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <Share2 className="size-4" />
                    <span>Share Booking Link</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModal('add-slot')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-[#f0f6fc] transition hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98]"
                    >
                      <Plus className="size-3.5 text-[#e01e37]" />
                      <span>Add Slot</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('payout')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 active:scale-[0.98]"
                    >
                      <Wallet className="size-3.5" />
                      <span>Claim Payout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STATS & REVENUE METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Today's Sessions */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f]/90 p-5 backdrop-blur-xl transition hover:border-white/20 shadow-lg">
                <div className="flex items-center justify-between text-[#8b949e]">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Sessions</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-[#e01e37]/10 text-[#e01e37]">
                    <CalendarIcon className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">3</span>
                  <span className="text-xs font-semibold text-emerald-400">Confirmed</span>
                </div>
                <p className="mt-2 text-xs text-[#8b949e] flex items-center gap-1.5">
                  <Clock className="size-3 text-[#e01e37]" />
                  Next: Vikram M. at 5:00 PM
                </p>
              </div>

              {/* Stat 2: Monthly Revenue */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f]/90 p-5 backdrop-blur-xl transition hover:border-white/20 shadow-lg">
                <div className="flex items-center justify-between text-[#8b949e]">
                  <span className="text-xs font-bold uppercase tracking-wider">Month Revenue</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">₹42,500</span>
                  <span className="text-xs font-semibold text-emerald-400">+14.2%</span>
                </div>
                <p className="mt-2 text-xs text-[#8b949e]">
                  34 completed sessions in October
                </p>
              </div>

              {/* Stat 3: Escrow Balance */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f]/90 p-5 backdrop-blur-xl transition hover:border-white/20 shadow-lg">
                <div className="flex items-center justify-between text-[#8b949e]">
                  <span className="text-xs font-bold uppercase tracking-wider">Escrow Held</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <ShieldCheck className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">₹8,500</span>
                  <span className="text-xs font-semibold text-amber-400/80">Secured</span>
                </div>
                <p className="mt-2 text-xs text-[#8b949e] flex items-center gap-1">
                  <Clock className="size-3 text-amber-400" />
                  Next release: ₹1,500 in 4h
                </p>
              </div>

              {/* Stat 4: Active Learners */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f]/90 p-5 backdrop-blur-xl transition hover:border-white/20 shadow-lg">
                <div className="flex items-center justify-between text-[#8b949e]">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Learners</span>
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">28</span>
                  <span className="text-xs font-semibold text-indigo-400">82% Repeat</span>
                </div>
                <p className="mt-2 text-xs text-[#8b949e]">
                  94 total lifetime students
                </p>
              </div>

            </div>

            {/* 3. TODAY'S AGENDA & PENDING REQUESTS (2-COL SPLIT) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2-Cols: Upcoming Sessions & Learner Requests */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Upcoming Confirmed Sessions */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-[#e01e37]/10 text-[#e01e37]">
                        <Clock className="size-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Today's Schedule & Agenda</h2>
                        <p className="text-xs text-[#8b949e]">Live confirmed sessions for today</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="text-xs font-semibold text-[#e01e37] hover:underline flex items-center gap-1"
                    >
                      View Calendar <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-white/[0.06] bg-[#0b0e14]/70 p-4 transition hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{session.learnerName}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              session.mode === 'in-person' 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {session.mode === 'in-person' ? 'In-Person' : 'Live Stream'}
                            </span>
                            <span className="text-xs font-semibold text-emerald-400">₹{session.price}</span>
                          </div>
                          <p className="text-xs font-medium text-[#8b949e]">{session.service}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#6e7681]">
                            <span className="flex items-center gap-1 text-white/80">
                              <Clock className="size-3 text-[#e01e37]" /> {session.time}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              {session.mode === 'in-person' ? <MapPin className="size-3" /> : <Video className="size-3" />}
                              {session.locationOrLink}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {session.mode === 'online' ? (
                            <a
                              href={session.locationOrLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                            >
                              <Video className="size-3.5" />
                              <span>Join Room</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedLearner(session.learnerName)
                                setActiveModal('reply')
                              }}
                              className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95"
                            >
                              <MessageSquare className="size-3.5 text-[#e01e37]" />
                              <span>Chat</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learner Inquiries & Booking Requests */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                        <MessageSquare className="size-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Learner Inquiries & Requests</h2>
                        <p className="text-xs text-[#8b949e]">Accept or reschedule incoming student bookings</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-2xl border border-white/[0.06] bg-[#0b0e14]/70 p-4 transition hover:border-white/15 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-white">{req.name}</p>
                              <span className="text-xs font-bold text-emerald-400">₹{req.price}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                req.status === 'accepted'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : req.status === 'declined'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {req.status === 'accepted' ? 'Confirmed' : req.status === 'declined' ? 'Declined' : 'Pending Action'}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b949e]">{req.service} · {req.date} ({req.time})</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLearner(req.name)
                                    setActiveModal('reschedule')
                                  }}
                                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#8b949e] hover:text-white hover:bg-white/[0.08] transition active:scale-95"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(req.id)}
                                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition active:scale-95"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedLearner(req.name)
                                  setActiveModal('reply')
                                }}
                                className="rounded-xl bg-[#e01e37] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#c0182f] active:scale-95"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-2.5 text-xs text-[#8b949e] italic">
                          {req.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right 1-Col: Escrow Protection Tracker & Leaderboard Standings */}
              <div className="space-y-6">
                
                {/* Real-time Escrow Timeline Tracker */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-emerald-400" />
                      <h2 className="font-bold text-sm text-white">Escrow Protection Hub</h2>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      100% Guaranteed
                    </span>
                  </div>

                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    Student payments are held in escrow before sessions start and automatically deposited to your account upon completion.
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹2,000 · Vikram M.</p>
                        <p className="text-[11px] text-emerald-400">Held in Escrow (Paid & Ready)</p>
                      </div>
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹1,500 · Ananya S.</p>
                        <p className="text-[11px] text-amber-400">Session Done · Clears in 4h</p>
                      </div>
                      <Clock className="size-4 text-amber-400" />
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#0b0e14]/60 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹5,000 · Weekly Batch</p>
                        <p className="text-[11px] text-[#8b949e]">Auto-Deposit Scheduled: Monday</p>
                      </div>
                      <Check className="size-4 text-[#8b949e]" />
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('payout')}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    Manage Payout Method
                  </button>
                </div>

                {/* Tournament & Leaderboard XP Card */}
                <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="size-5 text-[#e01e37]" />
                      <h2 className="font-bold text-sm text-white">Coach Leaderboard</h2>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">5,010 XP</span>
                  </div>

                  <div className="rounded-2xl bg-[#0b0e14]/80 p-4 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b949e]">Current Rank</span>
                      <span className="font-bold text-white">#2 in Delhi Combat</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b949e]">Hours Taught</span>
                      <span className="font-bold text-white">288 hrs verified</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b949e]">Next Reward Tier</span>
                      <span className="font-bold text-[#e01e37]">410 XP to #1 Master</span>
                    </div>

                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-3">
                      <div className="bg-gradient-to-r from-[#e01e37] to-amber-500 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <Link
                    href="/#tournaments"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8b949e] hover:text-white transition"
                  >
                    <span>View Tournament Standings</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[600px] grid grid-cols-1 md:grid-cols-3">
            
            {/* Thread List Column */}
            <div className="border-r border-white/[0.08] bg-[#0d1017]/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageSquare className="size-4 text-[#e01e37]" />
                  Learner Conversations
                </h3>
                <span className="rounded-full bg-[#e01e37]/20 px-2 py-0.5 text-[10px] font-bold text-[#e01e37]">
                  {threads.length} Active
                </span>
              </div>

              <div className="space-y-1.5">
                {threads.map((thread) => {
                  const selected = thread.id === selectedThreadId
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                        selected
                          ? 'bg-[#1e232d] border border-white/10 shadow-md'
                          : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#e01e37] to-[#800016] text-xs font-bold text-white shrink-0">
                        {thread.avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-white truncate">{thread.name}</p>
                          <span className="text-[10px] text-[#8b949e]">{thread.time}</span>
                        </div>
                        <p className="text-[11px] text-[#e01e37] font-medium truncate">{thread.skill}</p>
                        <p className="text-[11px] text-[#8b949e] truncate mt-0.5">{thread.lastMessage}</p>
                      </div>
                      {thread.unread > 0 && (
                        <span className="size-2 rounded-full bg-[#e01e37] shrink-0 mt-2" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Conversation Chat Window */}
            <div className="md:col-span-2 flex flex-col h-[600px] bg-[#0b0e14]/80">
              
              {/* Header */}
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#12161f]/80">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#e01e37]/20 border border-[#e01e37]/30 text-xs font-bold text-[#e01e37]">
                    {activeThread.avatarLetter}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeThread.name}</h3>
                    <p className="text-xs text-[#8b949e] flex items-center gap-1.5">
                      <span>{activeThread.skill}</span>
                      <span>·</span>
                      <span className="text-emerald-400">Active Booking</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedLearner(activeThread.name)
                      setActiveModal('reschedule')
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#8b949e] hover:text-white transition"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => setActiveModal('share')}
                    className="rounded-xl bg-[#e01e37] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#c0182f]"
                  >
                    Share Slot
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-center my-2">
                  <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-[10px] text-[#8b949e]">
                    Encrypted Chat for Booking #{activeThread.id}
                  </span>
                </div>

                {activeThread.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'instructor' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                        msg.sender === 'instructor'
                          ? 'bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-white shadow-md rounded-br-none'
                          : 'bg-[#1b202a] text-gray-200 border border-white/[0.06] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-[#6e7681] mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Quick Reply Presets */}
              <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-t border-white/[0.04] bg-[#0f131a]">
                <span className="text-[10px] font-bold text-[#8b949e] shrink-0">Quick:</span>
                {[
                  'See you at the session on time!',
                  'Bring wraps and water bottle.',
                  'Here is the studio pin location.',
                  'Ready on the live stream!',
                ].map((quick, i) => (
                  <button
                    key={i}
                    onClick={() => setChatInput(quick)}
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-gray-300 hover:bg-white/10 transition"
                  >
                    {quick}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessageInThread} className="p-3 border-t border-white/[0.08] flex items-center gap-2 bg-[#12161f]/90">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message or instruction..."
                  className="flex-1 rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#e01e37]"
                />
                <button
                  type="submit"
                  className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-white shadow-md transition hover:brightness-110 active:scale-95"
                >
                  <Send className="size-4" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* CALENDAR & SLOTS TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="size-5 text-[#e01e37]" />
                  Weekly Availability & Time Blocks
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Click any slot to toggle availability. Students can only book your active open slots.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('add-slot')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#c0182f] active:scale-95"
                >
                  <Plus className="size-3.5" />
                  <span>+ Add Time Slot</span>
                </button>
              </div>
            </div>

            {/* Weekly Slot Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {calendarSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => handleToggleSlot(slot.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    slot.status === 'booked'
                      ? 'bg-[#181d28] border-purple-500/30 shadow-lg'
                      : 'bg-[#0d1017] border-white/[0.08] hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{slot.day}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      slot.status === 'booked'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {slot.status === 'booked' ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  <p className="mt-3 font-bold text-sm text-white">{slot.title}</p>
                  <p className="text-xs text-[#8b949e] mt-1 flex items-center gap-1">
                    <Clock className="size-3 text-[#e01e37]" /> {slot.time}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#8b949e]">{slot.student || 'Open for booking'}</span>
                    <span className="text-[#e01e37] font-semibold">{slot.type === 'in-person' ? 'Delhi' : 'Online'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EARNINGS & ESCROW TAB */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            
            {/* Top Balance Banner */}
            <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#12161f] to-[#0c0f16] p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Available Wallet Balance</span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹8,500</span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    Ready for Instant Withdrawal
                  </span>
                </div>
                <p className="text-xs text-[#8b949e] mt-2">
                  Total lifetime payout earned: <strong className="text-white">₹1,42,500</strong> · Platform fee: <strong className="text-emerald-400">0% (Founder tier)</strong>
                </p>
              </div>

              <button
                onClick={() => setActiveModal('payout')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition hover:brightness-110 active:scale-95"
              >
                <Wallet className="size-4" />
                <span>Withdraw to UPI / Bank</span>
              </button>
            </div>

            {/* Payouts Breakdown Table */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="font-bold text-base text-white">Recent Completed Sessions & Escrow Settlements</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#8b949e]">
                  <thead className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-white/70">
                    <tr>
                      <th className="py-3 px-4">Session Date</th>
                      <th className="py-3 px-4">Learner</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Gross</th>
                      <th className="py-3 px-4">Platform Fee</th>
                      <th className="py-3 px-4">Net Payout</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {[
                      { date: '22 Oct 2026', learner: 'Vikram M.', service: 'Boxing 1-on-1', gross: '₹1,500', fee: '₹0', net: '₹1,500', status: 'Deposited' },
                      { date: '21 Oct 2026', learner: 'Ananya S.', service: 'Pad Work & Sparring', gross: '₹1,200', fee: '₹0', net: '₹1,200', status: 'Escrow Clearing' },
                      { date: '20 Oct 2026', learner: 'Karan P.', service: 'Cardio Blast Live', gross: '₹800', fee: '₹0', net: '₹800', status: 'Deposited' },
                      { date: '19 Oct 2026', learner: 'Dev Malhotra', service: 'Kick Drills 1-on-1', gross: '₹1,500', fee: '₹0', net: '₹1,500', status: 'Deposited' },
                      { date: '18 Oct 2026', learner: 'Meera Nair', service: 'Combat Conditioning', gross: '₹1,000', fee: '₹0', net: '₹1,000', status: 'Deposited' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4 font-medium text-white">{row.date}</td>
                        <td className="py-3.5 px-4 text-white">{row.learner}</td>
                        <td className="py-3.5 px-4">{row.service}</td>
                        <td className="py-3.5 px-4 text-white font-semibold">{row.gross}</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{row.fee} (0%)</td>
                        <td className="py-3.5 px-4 text-white font-bold">{row.net}</td>
                        <td className="py-3.5 px-4">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            row.status === 'Deposited'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SERVICES & PRICING TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/[0.08] bg-[#12161f]/90 p-6 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="size-5 text-[#e01e37]" />
                  Your Offered Services & Pricing
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Customize your session offerings, rates per hour, and formats (in-person vs virtual).
                </p>
              </div>

              <button
                onClick={() => setActiveModal('add-service')}
                className="flex items-center gap-1.5 rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#c0182f] active:scale-95"
              >
                <Plus className="size-3.5" />
                <span>+ Create New Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#0d1017]/80 p-5 transition hover:border-white/20 shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        svc.mode === 'in-person'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {svc.mode === 'in-person' ? 'In-Person (Delhi)' : 'Live Online Stream'}
                      </span>
                      <span className="text-xs text-[#8b949e]">{svc.duration}</span>
                    </div>

                    <h3 className="font-bold text-base text-white">{svc.name}</h3>
                    <p className="text-xs text-[#8b949e]">{svc.bookingsCount} learners booked so far</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[10px] uppercase text-[#8b949e]">Your Price</span>
                      <p className="text-xl font-black text-white">₹{svc.price}</p>
                    </div>

                    <button
                      onClick={() => setActiveModal('share')}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition active:scale-95"
                    >
                      Share Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* INTERACTIVE ACTION MODALS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#141822] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-[#8b949e] hover:bg-white/10 hover:text-white transition"
              >
                <X className="size-5" />
              </button>

              {/* MODAL 1: SHARE BOOKING LINK */}
              {activeModal === 'share' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e01e37]/15 text-[#e01e37]">
                      <Share2 className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Share Your Profile Link</h3>
                      <p className="text-xs text-[#8b949e]">Clients can view your schedule & book directly</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b0e14] p-3 shadow-inner">
                    <input
                      readOnly
                      value={bookingLink}
                      className="w-full bg-transparent text-xs text-gray-200 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 shrink-0"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
                    <p className="text-[11px] text-[#8b949e]">
                      Tip: Add this link to your WhatsApp bio or Instagram to receive direct 0% commission bookings.
                    </p>
                  </div>
                </div>
              )}

              {/* MODAL 2: INSTANT PAYOUT & WITHDRAWAL */}
              {activeModal === 'payout' && (
                <form onSubmit={handleProcessPayout} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Instant Escrow Payout</h3>
                      <p className="text-xs text-[#8b949e]">Transfer balance directly to your bank / UPI</p>
                    </div>
                  </div>

                  {withdrawSuccess ? (
                    <div className="py-6 text-center space-y-2">
                      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                        <CheckCircle2 className="size-6" />
                      </div>
                      <h4 className="font-bold text-white">Payout Initiated!</h4>
                      <p className="text-xs text-[#8b949e]">₹{withdrawAmount} has been sent to your registered UPI ID.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#8b949e]">Withdraw Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          max="8500"
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-[#8b949e] mt-1 block">Max available balance: ₹8,500</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8b949e]">UPI ID / Bank Account</label>
                        <input
                          type="text"
                          defaultValue="rohitsingh@okicici"
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98]"
                      >
                        Confirm ₹{withdrawAmount} Withdrawal
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* MODAL 3: RESCHEDULE */}
              {activeModal === 'reschedule' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Reschedule with {selectedLearner || 'Learner'}</h3>
                  <p className="text-xs text-[#8b949e]">Select a new time slot to propose.</p>
                  <input
                    type="datetime-local"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e14] p-3 text-sm text-white outline-none focus:border-[#e01e37]"
                  />
                  <button
                    onClick={() => {
                      setActiveModal(null)
                      setRescheduleDate('')
                    }}
                    className="w-full rounded-xl bg-[#e01e37] py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    Send Reschedule Request
                  </button>
                </div>
              )}

              {/* MODAL 4: QUICK REPLY */}
              {activeModal === 'reply' && (
                <form onSubmit={handleSendReply} className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Reply to {selectedLearner || 'Learner'}</h3>
                  <textarea
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your message or instructions..."
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e14] p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#e01e37]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      <Send className="size-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL 5: ADD NEW TIME SLOT */}
              {activeModal === 'add-slot' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setActiveModal(null)
                  }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white">+ Add Availability Slot</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Day of Week</label>
                    <select className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:border-[#e01e37]">
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Time Window</label>
                    <input
                      type="text"
                      placeholder="e.g. 06:00 PM - 07:00 PM"
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#e01e37] py-3 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    Save & Open Slot
                  </button>
                </form>
              )}

              {/* MODAL 6: CREATE SERVICE PACKAGE */}
              {activeModal === 'add-service' && (
                <form onSubmit={handleCreateService} className="space-y-4">
                  <h3 className="text-lg font-bold text-white">+ Create Service Package</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1-on-1 Boxing Mitts Workout"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#8b949e]">Duration</label>
                      <select
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:border-[#e01e37]"
                      >
                        <option value="30 min">30 min</option>
                        <option value="45 min">45 min</option>
                        <option value="60 min">60 min</option>
                        <option value="90 min">90 min</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#8b949e]">Price (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="1200"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-[#e01e37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Delivery Mode</label>
                    <select
                      value={newServiceMode}
                      onChange={(e) => setNewServiceMode(e.target.value as any)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:border-[#e01e37]"
                    >
                      <option value="in-person">In-Person Only</option>
                      <option value="online">Live Stream Only</option>
                      <option value="both">Both In-Person & Online</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] py-3 text-xs font-bold text-white shadow-md transition hover:brightness-110"
                  >
                    Publish Package
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#0d1117] p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <Image
                  src="/logo.svg"
                  alt="MASTRIVE"
                  width={110}
                  height={26}
                  priority
                  className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 py-4">
                {navItems.map((item) => {
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                          : 'text-[#8b949e] hover:bg-white/5 hover:text-[#f0f6fc]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white"
                >
                  <ArrowLeft className="size-4" />
                  <span>Back to Explore</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white"
                >
                  <UserIcon className="size-4" />
                  <span>View Public Profile</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}