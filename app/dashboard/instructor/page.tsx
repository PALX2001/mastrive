'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  QrCode,
  BarChart3,
  Search,
  Settings,
  LayoutDashboard,
  Mail,
  CircleDot
} from 'lucide-react'

type DashTab = 'dash' | 'inbox' | 'calendar' | 'earnings' | 'services'

const sidebarNavItems: { id: DashTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare, badge: '2' },
  { id: 'calendar', label: 'Schedule', icon: CalendarIcon },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'services', label: 'Services', icon: Layers },
]

export interface RequestItem {
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

export interface UpcomingSession {
  id: string
  learnerName: string
  service: string
  mode: 'in-person' | 'online'
  time: string
  status: 'confirmed' | 'in-progress' | 'completed'
  locationOrLink: string
  price: number
}

export interface MessageThread {
  id: string
  name: string
  skill: string
  avatarLetter: string
  unread: number
  lastMessage: string
  time: string
  messages: { sender: 'learner' | 'instructor'; text: string; timestamp: string }[]
}

// Donut Chart Component with precise SVG calculations
function DonutChart({ percentage, label }: { percentage: number; label: string }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle 
          cx="60" 
          cy="60" 
          r={radius} 
          fill="none" 
          stroke="#e01e37" 
          strokeWidth="12" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-out" 
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white">{percentage}%</span>
        <span className="text-[10px] text-[#8b949e] font-medium">{label}</span>
      </div>
    </div>
  )
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profileName, setProfileName] = useState<string>('Instructor')
  const [profileSkill, setProfileSkill] = useState<string>('Boxing & Combat Fitness')
  const [bookingSlug, setBookingSlug] = useState<string>('instructor')
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<DashTab>('dash')
  const [copied, setCopied] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d'>('7d')

  // Real-time timer ticker
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Modals state
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
  const [threadSearch, setThreadSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        { sender: 'learner', text: 'Hi Coach! Looking forward to today\'s sparring session.', timestamp: '4:15 PM' },
        { sender: 'instructor', text: 'Hey Vikram! Bring your hand wraps and water bottle. I have the gloves and pads ready.', timestamp: '4:18 PM' },
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

  // Dynamic Real-Time Analytics Calculations
  const analyticsData = useMemo(() => {
    // 1. Today's sessions count
    const todayCount = upcomingSessions.filter(s => s.time.toLowerCase().includes('today')).length

    // 2. Active learners (unique count across requests and sessions)
    const uniqueLearners = new Set([
      ...upcomingSessions.map(s => s.learnerName),
      ...requests.map(r => r.name),
      ...threads.map(t => t.name)
    ])
    const activeLearnersCount = uniqueLearners.size

    // 3. Repeat learner ratio calculation
    const repeatLearnersCount = Math.max(1, Math.round(activeLearnersCount * 0.82))
    const repeatPercentage = Math.round((repeatLearnersCount / Math.max(1, activeLearnersCount)) * 100)

    // 4. Month Revenue calculation (completed sessions + active bookings)
    const activeBookingsRevenue = upcomingSessions.reduce((acc, s) => acc + s.price, 0)
    const totalMonthRevenue = 38000 + activeBookingsRevenue

    // 5. Escrow held balance
    const escrowHeld = 8500 + requests.filter(r => r.status === 'accepted').reduce((acc, r) => acc + r.price, 0)

    // 6. Session Progress percentage
    const completedSessionsCount = 28
    const totalSessionsScheduled = completedSessionsCount + upcomingSessions.length
    const completionRate = Math.round((completedSessionsCount / totalSessionsScheduled) * 100)

    return {
      todayCount,
      activeLearnersCount,
      repeatPercentage,
      totalMonthRevenue,
      escrowHeld,
      completionRate,
    }
  }, [upcomingSessions, requests, threads])

  // Chart data based on timeframe
  const chartData = useMemo(() => {
    if (chartTimeframe === '7d') {
      return [
        { day: 'Sun', sessions: 2, max: 6 },
        { day: 'Mon', sessions: 5, max: 6 },
        { day: 'Tue', sessions: 3, max: 6 },
        { day: 'Wed', sessions: 6, max: 6 },
        { day: 'Thu', sessions: 4, max: 6 },
        { day: 'Fri', sessions: 3, max: 6 },
        { day: 'Sat', sessions: 5, max: 6 },
      ]
    } else {
      return [
        { day: 'W1', sessions: 18, max: 25 },
        { day: 'W2', sessions: 22, max: 25 },
        { day: 'W3', sessions: 25, max: 25 },
        { day: 'W4', sessions: 20, max: 25 },
      ]
    }
  }, [chartTimeframe])

  // Check auth and load profile data
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

        const rawMetaName = user.user_metadata?.full_name || user.user_metadata?.name
        let initialName = rawMetaName
        if (!initialName && user.email) {
          const raw = user.email.split('@')[0]
          const cleaned = raw.replace(/^[0-9_]+|[0-9_]+$/g, '').replace(/[._-]/g, ' ').trim()
          if (cleaned.length >= 2) {
            initialName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
          }
        }
        setProfileName(initialName || 'Instructor')
        const slug = (initialName || 'coach')
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

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    if (activeTab === 'inbox') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [threads, selectedThreadId, activeTab])

  const bookingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/instructor/${bookingSlug}`
    : `https://mastrive.com/instructor/${bookingSlug}`

  const handleCopyLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(bookingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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

  // Live Chat Message Sender
  const handleSendMessageInThread = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const now = new Date()
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setThreads(prev =>
      prev.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            lastMessage: `"${chatInput}"`,
            time: 'Just now',
            unread: 0,
            messages: [
              ...t.messages,
              { sender: 'instructor', text: chatInput.trim(), timestamp: timestampStr },
            ],
          }
        }
        return t
      })
    )
    setChatInput('')
  }

  const handleQuickReply = (text: string) => {
    const now = new Date()
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setThreads(prev =>
      prev.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            lastMessage: `"${text}"`,
            time: 'Just now',
            unread: 0,
            messages: [
              ...t.messages,
              { sender: 'instructor', text: text, timestamp: timestampStr },
            ],
          }
        }
        return t
      })
    )
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

  const filteredThreads = useMemo(() => {
    if (!threadSearch.trim()) return threads
    const q = threadSearch.toLowerCase()
    return threads.filter(t => t.name.toLowerCase().includes(q) || t.skill.toLowerCase().includes(q))
  }, [threads, threadSearch])

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
    <div className="flex min-h-screen bg-[#080a0f] text-white font-sans selection:bg-[#e01e37] selection:text-white">
      
      {/* ===== SIDEBAR (Desktop) ===== */}
      <aside className="fixed left-0 top-0 z-30 hidden lg:flex flex-col w-[260px] h-screen border-r border-white/[0.08] bg-[#0b0e14]">
        
        {/* Logo */}
        <div className="flex h-[72px] items-center gap-3 px-6 border-b border-white/[0.08]">
          <Link href="/" aria-label="MASTRIVE home" className="flex items-center group">
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={130}
              height={32}
              priority
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">Menu</p>
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => {
              const active = activeTab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#e01e37] text-white shadow-[0_4px_16px_rgba(224,30,55,0.3)]'
                      : 'text-[#8b949e] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className="size-[18px]" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-[#e01e37]/15 text-[#e01e37]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* General Section */}
          <p className="px-3 mt-8 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">General</p>
          <nav className="space-y-1">
            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <Settings className="size-[18px]" />
              <span>Settings</span>
            </Link>
            <Link href="/support" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <HelpCircle className="size-[18px]" />
              <span>Help & Support</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <LogOut className="size-[18px]" />
              <span>Back to Explore</span>
            </Link>
          </nav>
        </div>

        {/* Bottom CTA Card */}
        <div className="px-4 pb-5">
          <div className="rounded-2xl bg-gradient-to-br from-[#e01e37]/20 to-[#e01e37]/5 border border-[#e01e37]/20 p-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#e01e37]/20 mx-auto mb-2">
              <Share2 className="size-5 text-[#e01e37]" />
            </div>
            <p className="text-xs font-bold text-white mb-1">Public Profile Link</p>
            <p className="text-[10px] text-[#8b949e] mb-3 leading-relaxed">Share with students for 0% commission direct bookings</p>
            <button
              onClick={() => setActiveModal('share')}
              className="w-full rounded-lg bg-[#e01e37] px-3 py-2 text-[11px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              Copy Profile Link
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0b0e14]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          
          {/* Left: Mobile Menu + Logo & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#161b22]/80 text-[#f0f6fc] transition hover:border-white/20 active:scale-95 lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <Link href="/" className="lg:hidden flex items-center">
              <Image src="/logo.svg" alt="MASTRIVE" width={110} height={26} priority className="h-6 w-auto object-contain" />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12161f]/80 px-3.5 py-2 transition focus-within:border-white/20">
              <Search className="size-4 text-[#6e7681]" />
              <input
                type="text"
                placeholder="Search sessions, learners..."
                className="flex-1 bg-transparent text-xs text-white placeholder-[#6e7681] outline-none"
              />
            </div>
          </div>

          {/* Center: Real-Time Timer & Date Widget */}
          <div className="hidden lg:flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#12161f]/80 px-3.5 py-2 shadow-inner backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-white">
                <Clock className="size-3.5 text-[#e01e37]" />
                <span>
                  {currentTime
                    ? currentTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })
                    : '--:--:--'}
                </span>
              </div>
            </div>
            <div className="h-3.5 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#8b949e]">
              <CalendarIcon className="size-3.5 text-[#6e7681]" />
              <span>
                {currentTime
                  ? currentTime.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '--- --, ----'}
              </span>
            </div>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setActiveTab('inbox')}
              className="relative flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12161f]/80 text-[#8b949e] transition hover:border-white/15 hover:text-white"
            >
              <Mail className="size-4" />
            </button>
            <button className="relative flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12161f]/80 text-[#8b949e] transition hover:border-white/15 hover:text-white">
              <Bell className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5 rounded-full bg-[#e01e37] ring-2 ring-[#0b0e14]" />
            </button>

            {/* Profile Pill */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#12161f]/80 px-3 py-1.5 transition hover:border-white/15"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e01e37] to-[#900d1f] text-xs font-bold text-white">
                {profileName.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight line-clamp-1">{profileName}</p>
                <p className="text-[10px] text-[#8b949e]">{profileSkill.length > 20 ? profileSkill.substring(0, 20) + '...' : profileSkill}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* OVERVIEW TAB */}
          {activeTab === 'dash' && (
            <div className="space-y-6">
              
              {/* Page Title & CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Instructor Dashboard</h1>
                  <p className="text-sm text-[#8b949e] mt-0.5">
                    Welcome back, <span className="text-[#e01e37] font-semibold">{profileName}</span>. You have <strong className="text-white">{analyticsData.todayCount} confirmed sessions</strong> today.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveModal('share')}
                    className="flex items-center gap-2 rounded-xl bg-[#e01e37] px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(224,30,55,0.3)] transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <Share2 className="size-3.5" />
                    <span>Share Booking Link</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('payout')}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12161f] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.06] active:scale-[0.98]"
                  >
                    <Wallet className="size-3.5" />
                    <span>Claim Payout</span>
                  </button>
                </div>
              </div>

              {/* ===== DYNAMIC STAT CARDS ROW ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* Stat 1: Today's Sessions */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e01e37] to-[#a0111f] p-5 shadow-[0_8px_24px_rgba(224,30,55,0.25)]">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/70">Today&apos;s Sessions</span>
                      <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
                        <CalendarIcon className="size-4 text-white" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-4xl font-black text-white">{analyticsData.todayCount}</span>
                    </div>
                    <p className="mt-2 text-xs text-white/70 flex items-center gap-1.5">
                      <TrendingUp className="size-3" />
                      Live session schedule active
                    </p>
                  </div>
                </div>

                {/* Stat 2: Month Revenue */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 transition hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Month Revenue</span>
                    <button onClick={() => setActiveTab('earnings')} className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#8b949e] hover:text-white transition">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-white">₹{(analyticsData.totalMonthRevenue / 1000).toFixed(1)}K</span>
                  </div>
                  <p className="mt-2 text-xs text-[#8b949e] flex items-center gap-1.5">
                    <TrendingUp className="size-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">+14.2%</span> from last month
                  </p>
                </div>

                {/* Stat 3: Escrow Held */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 transition hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Escrow Held</span>
                    <button onClick={() => setActiveModal('payout')} className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#8b949e] hover:text-white transition">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-white">₹{analyticsData.escrowHeld.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#8b949e] flex items-center gap-1.5">
                    <Clock className="size-3 text-amber-400" />
                    Clears upon session completion
                  </p>
                </div>

                {/* Stat 4: Active Learners */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 transition hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Active Learners</span>
                    <button onClick={() => setActiveTab('inbox')} className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#8b949e] hover:text-white transition">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-white">{analyticsData.activeLearnersCount}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#8b949e]">
                    <span className="text-[#e01e37] font-semibold">{analyticsData.repeatPercentage}%</span> repeat learners
                  </p>
                </div>
              </div>

              {/* ===== MIDDLE ROW: Analytics | Schedule | Services ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Session Analytics Chart */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white">Session Analytics</h3>
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0b0e14] p-0.5">
                      <button
                        onClick={() => setChartTimeframe('7d')}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          chartTimeframe === '7d' ? 'bg-[#e01e37] text-white' : 'text-[#8b949e]'
                        }`}
                      >
                        7D
                      </button>
                      <button
                        onClick={() => setChartTimeframe('30d')}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          chartTimeframe === '30d' ? 'bg-[#e01e37] text-white' : 'text-[#8b949e]'
                        }`}
                      >
                        30D
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 h-[140px]">
                    {chartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col justify-end h-[110px]">
                          <div
                            className={`w-full rounded-lg transition-all duration-500 ${
                              i === chartData.length - 2 ? 'bg-[#e01e37]' : 'bg-[#e01e37]/25 hover:bg-[#e01e37]/50'
                            }`}
                            style={{ height: `${(d.sessions / d.max) * 100}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${i === chartData.length - 2 ? 'text-[#e01e37]' : 'text-[#6e7681]'}`}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Schedule / Reminders */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Today&apos;s Next Session</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#0b0e14] border border-white/[0.06] p-4">
                      <p className="text-xs font-bold text-white">Boxing Sparring with Vikram M.</p>
                      <p className="text-[11px] text-[#8b949e] mt-1 flex items-center gap-1.5">
                        <Clock className="size-3 text-[#e01e37]" />
                        Today, 5:00 PM – 6:00 PM
                      </p>
                      <p className="text-[11px] text-[#6e7681] mt-1 flex items-center gap-1.5">
                        <MapPin className="size-3" />
                        Siri Fort Sports Complex, Court 2
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e01e37] py-2.5 text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <CalendarIcon className="size-3.5" />
                      View Full Schedule
                    </button>
                  </div>
                </div>

                {/* Services / Offerings Quick List */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Your Services</h3>
                    <button
                      onClick={() => setActiveModal('add-service')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#e01e37] hover:underline"
                    >
                      <Plus className="size-3" /> New
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {services.slice(0, 4).map((svc, i) => {
                      const colors = ['bg-[#e01e37]', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500']
                      return (
                        <div key={svc.id} className="flex items-center gap-3 group">
                          <div className={`size-2 rounded-full ${colors[i % colors.length]} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{svc.name}</p>
                            <p className="text-[10px] text-[#6e7681]">₹{svc.price} · {svc.duration}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ===== BOTTOM ROW: Recent Learners | Progress | Escrow ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Learners */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Learners</h3>
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold text-[#8b949e] hover:text-white transition"
                    >
                      <Plus className="size-3" /> View In Inbox
                    </button>
                  </div>

                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#e01e37]/10 border border-[#e01e37]/20 text-[10px] font-bold text-[#e01e37] shrink-0">
                          {session.learnerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{session.learnerName}</p>
                          <p className="text-[10px] text-[#6e7681] truncate">{session.service}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
                          session.mode === 'in-person'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {session.mode === 'in-person' ? 'In-Person' : 'Online'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Completion Progress */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col items-center">
                  <h3 className="text-sm font-bold text-white self-start mb-4">Completion Progress</h3>
                  <DonutChart percentage={analyticsData.completionRate} label="Completed" />
                  <div className="flex items-center gap-4 mt-4 text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#e01e37]" />
                      <span className="text-[#8b949e]">Completed ({28})</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-white/10" />
                      <span className="text-[#8b949e]">Upcoming ({upcomingSessions.length})</span>
                    </span>
                  </div>
                </div>

                {/* Escrow Tracker */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Escrow Tracker</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">Protected</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹2,000 · Vikram M.</p>
                        <p className="text-[10px] text-emerald-400">Held in Escrow</p>
                      </div>
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹1,500 · Ananya S.</p>
                        <p className="text-[10px] text-amber-400">Clears post-session</p>
                      </div>
                      <Clock className="size-4 text-amber-400 shrink-0" />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">₹5,000 · Completed Batch</p>
                        <p className="text-[10px] text-[#8b949e]">Available for withdrawal</p>
                      </div>
                      <Check className="size-4 text-[#6e7681] shrink-0" />
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModal('payout')}
                    className="mt-3 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 text-[11px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 active:scale-[0.98]"
                  >
                    Withdraw Available Balance
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* INBOX / CHAT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'inbox' && (
            <div className="rounded-3xl border border-white/[0.08] bg-[#12161f] overflow-hidden min-h-[640px] grid grid-cols-1 md:grid-cols-12 shadow-2xl">
              
              {/* Thread List Column */}
              <div className="md:col-span-4 border-r border-white/[0.08] bg-[#0d1017]/80 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <MessageSquare className="size-4 text-[#e01e37]" />
                    Conversations
                  </h3>
                  <span className="rounded-full bg-[#e01e37]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#e01e37]">
                    {threads.length} Active
                  </span>
                </div>

                {/* Conversation Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#6e7681]" />
                  <input
                    type="text"
                    placeholder="Search student or skill..."
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    className="h-9 w-full rounded-xl border border-white/10 bg-[#0b0e14] pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#e01e37]"
                  />
                </div>

                {/* Thread Cards */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredThreads.map((thread) => {
                    const selected = thread.id === selectedThreadId
                    return (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                          selected
                            ? 'bg-[#1e232d] border border-white/15 shadow-lg'
                            : 'hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#e01e37] to-[#800016] text-xs font-bold text-white shrink-0 shadow-md">
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
                          <span className="size-2 rounded-full bg-[#e01e37] shrink-0 mt-2 ring-4 ring-[#e01e37]/20" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Conversation Chat Window */}
              <div className="md:col-span-8 flex flex-col h-[640px] bg-[#0b0e14]/90">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#12161f]/90">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[#e01e37]/20 border border-[#e01e37]/30 text-xs font-bold text-[#e01e37]">
                      {activeThread.avatarLetter}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{activeThread.name}</h3>
                      <p className="text-xs text-[#8b949e] flex items-center gap-1.5">
                        <span>{activeThread.skill}</span>
                        <span>·</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Chat Active
                        </span>
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
                      Share Booking Link
                    </button>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="text-center my-2">
                    <span className="rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-[10px] text-[#8b949e]">
                      🔒 End-to-end encrypted session coordination
                    </span>
                  </div>

                  {activeThread.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'instructor' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.sender === 'instructor'
                            ? 'bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-white shadow-lg rounded-br-none'
                            : 'bg-[#181d28] text-gray-200 border border-white/[0.08] rounded-bl-none shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-[#6e7681] mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Response Shortcuts Bar */}
                <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-t border-white/[0.04] bg-[#0f131a]">
                  <span className="text-[10px] font-bold text-[#8b949e] shrink-0">Quick Reply:</span>
                  {[
                    'See you at the session on time!',
                    'Bring hand wraps and water bottle.',
                    'Court 2 at Siri Fort is booked.',
                    'Ready on the live stream WebRTC room!',
                  ].map((quick, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(quick)}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-gray-300 hover:bg-[#e01e37]/20 hover:border-[#e01e37]/40 hover:text-white transition active:scale-95"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSendMessageInThread} className="p-3.5 border-t border-white/[0.08] flex items-center gap-2.5 bg-[#12161f]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Message ${activeThread.name}...`}
                    className="flex-1 rounded-2xl border border-white/10 bg-[#0b0e14] px-4 py-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#e01e37]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-40"
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
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12161f] to-[#0c0f16] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-6 space-y-4">
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
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

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
              className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#141822] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10"
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

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b0e14] p-3 shadow-inner">
                    <input
                      readOnly
                      value={bookingLink}
                      className="w-full bg-transparent text-xs text-gray-200 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e01e37] to-[#b0142b] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 shrink-0"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
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
                          defaultValue="coach@okaxis"
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
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#0b0e14] shadow-2xl lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.08]">
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
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
                <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">Menu</p>
                {sidebarNavItems.map((item) => {
                  const active = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                          : 'text-[#8b949e] hover:bg-white/5 hover:text-[#f0f6fc]'
                      }`}
                    >
                      <Icon className="size-[18px]" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-[#e01e37]/15 text-[#e01e37]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}

                <p className="px-3 mt-6 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">General</p>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white transition"
                >
                  <Settings className="size-[18px]" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white transition"
                >
                  <HelpCircle className="size-[18px]" />
                  <span>Help & Support</span>
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white transition"
                >
                  <ArrowLeft className="size-[18px]" />
                  <span>Back to Explore</span>
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}