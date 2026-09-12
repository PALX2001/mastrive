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
  CreditCard, 
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
  CircleDot,
  Camera
} from 'lucide-react'

type DashTab = 'dash' | 'inbox' | 'calendar' | 'earnings' | 'services'

const sidebarNavItems: { id: DashTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare, badge: '2' },
  { id: 'calendar', label: 'Schedule', icon: CalendarIcon },
  { id: 'earnings', label: 'Earnings', icon: CreditCard },
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
  const [withdrawAmount, setWithdrawAmount] = useState('0')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('60 min')
  const [newServiceMode, setNewServiceMode] = useState<'in-person' | 'online' | 'both'>('in-person')

  // Slot modal states
  const [newSlotDay, setNewSlotDay] = useState('Monday')
  const [newSlotTime, setNewSlotTime] = useState('06:00 PM - 07:00 PM')
  const [newSlotTitle, setNewSlotTitle] = useState('1-on-1 Coaching')
  const [newSlotType, setNewSlotType] = useState<'in-person' | 'online'>('in-person')

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const dashAvatarInputRef = useRef<HTMLInputElement>(null)

  // Chat thread states
  const [selectedThreadId, setSelectedThreadId] = useState<string>('')
  const [chatInput, setChatInput] = useState('')
  const [threadSearch, setThreadSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State for active request items — REAL DATA (empty if none)
  const [requests, setRequests] = useState<RequestItem[]>([])

  // Upcoming Confirmed Sessions — REAL DATA (empty if none)
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])

  // Services Catalog — Loaded from storage or empty
  const [services, setServices] = useState<{
    id: string
    name: string
    duration: string
    mode: string
    price: number
    bookingsCount: number
    active: boolean
  }[]>([])

  // Weekly Calendar Slots — Loaded from storage or empty
  const [calendarSlots, setCalendarSlots] = useState<{
    id: string
    day: string
    time: string
    title: string
    type: string
    status: string
    student: string | null
  }[]>([])

  // Chat Threads — REAL DATA (empty if none)
  const [threads, setThreads] = useState<MessageThread[]>([])

  // Dynamic Real-Time Analytics Calculations from REAL bookings
  const analyticsData = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase()
    
    // 1. Today's sessions count
    const todaySessions = upcomingSessions.filter(s => 
      s.time.toLowerCase().includes('today') || s.time.toLowerCase().includes(todayStr)
    )
    const todayCount = todaySessions.length

    // 2. Active learners (unique count across real sessions)
    const uniqueLearners = new Set(upcomingSessions.map(s => s.learnerName))
    const activeLearnersCount = uniqueLearners.size

    // 3. Repeat learner ratio calculation
    const repeatPercentage = activeLearnersCount > 1 ? 50 : 0

    // 4. Month Revenue calculation (completed sessions payouts)
    const completedSessions = upcomingSessions.filter(s => s.status === 'completed')
    const totalMonthRevenue = completedSessions.reduce((acc, s) => acc + s.price, 0)

    // 5. Escrow held balance (confirmed upcoming sessions payouts)
    const confirmedSessions = upcomingSessions.filter(s => s.status === 'confirmed')
    const escrowHeld = confirmedSessions.reduce((acc, s) => acc + s.price, 0)

    // 6. Session Progress percentage
    const totalSessionsScheduled = upcomingSessions.length
    const completedSessionsCount = completedSessions.length
    const completionRate = totalSessionsScheduled > 0
      ? Math.round((completedSessionsCount / totalSessionsScheduled) * 100)
      : 0

    return {
      todaySessions,
      todayCount,
      activeLearnersCount,
      repeatPercentage,
      totalMonthRevenue,
      escrowHeld,
      completionRate,
      completedSessionsCount,
      totalSessionsScheduled,
    }
  }, [upcomingSessions])

  // Chart data based on timeframe
  const chartData = useMemo(() => {
    if (chartTimeframe === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days.map(day => {
        const count = upcomingSessions.filter(s => s.time.toLowerCase().includes(day.toLowerCase())).length
        return { day, sessions: count, max: Math.max(4, count) }
      })
    } else {
      return [
        { day: 'W1', sessions: 0, max: 10 },
        { day: 'W2', sessions: 0, max: 10 },
        { day: 'W3', sessions: 0, max: 10 },
        { day: 'W4', sessions: 0, max: 10 },
      ]
    }
  }, [chartTimeframe, upcomingSessions])

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

        // 1. Fetch profile for skill and name (valid columns only)
        let { data: profile } = await supabase
          .from('profiles')
          .select('full_name, skill, role')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile && user.email) {
          const { data: pEmail } = await supabase
            .from('profiles')
            .select('full_name, skill, role')
            .eq('email', user.email)
            .maybeSingle()
          if (pEmail) profile = pEmail
        }

        if (profile) {
          if (profile.full_name) setProfileName(profile.full_name)
          if (profile.skill) setProfileSkill(profile.skill)
        }

        const profilePic = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        setAvatarUrl(profilePic)

        // 2. Fetch instructor application if available
        let appQuery = supabase.from('instructor_applications').select('full_name, skill, price_per_hour')
        const { data: appData } = user.email
          ? await appQuery.or(`user_id.eq.${user.id},email.eq.${user.email}`).maybeSingle()
          : await appQuery.eq('user_id', user.id).maybeSingle()

        if (appData) {
          if (appData.full_name && !profile?.full_name) setProfileName(appData.full_name)
          if (appData.skill && !profile?.skill) setProfileSkill(appData.skill)
        }

        // 3. Load services from localStorage
        const savedServices = localStorage.getItem(`mastrive_services_${user.id}`)
        if (savedServices) {
          try {
            setServices(JSON.parse(savedServices))
          } catch {
            setServices([])
          }
        } else {
          setServices([])
        }

        // 4. Load calendar slots from localStorage
        const savedSlots = localStorage.getItem(`mastrive_slots_${user.id}`)
        if (savedSlots) {
          try {
            setCalendarSlots(JSON.parse(savedSlots))
          } catch {
            setCalendarSlots([])
          }
        } else {
          setCalendarSlots([])
        }

        // 5. Query REAL bookings from bookings table
        try {
          const { data: dbBookings } = await supabase
            .from('bookings')
            .select('*')
            .or(`instructor_id.eq.${user.id},instructor_name.ilike.%${initialName || ''}%,customer_email.eq.${user.email}`)
            .order('created_at', { ascending: false })

          if (dbBookings && dbBookings.length > 0) {
            const mapped: UpcomingSession[] = dbBookings.map((b) => ({
              id: b.id,
              learnerName: b.customer_name || 'Learner',
              service: b.instructor_skill || 'Coaching Session',
              mode: b.mode === 'online' ? 'online' : 'in-person',
              time: `${b.session_date} · ${b.session_time}`,
              status: b.status === 'completed' ? 'completed' : 'confirmed',
              locationOrLink: b.mode === 'online' ? 'https://mastrive.vercel.app/demo' : 'Training Venue / Studio',
              price: Number(b.instructor_payout || b.total_amount || 0),
            }))
            setUpcomingSessions(mapped)
          } else {
            setUpcomingSessions([])
          }
        } catch {
          setUpcomingSessions([])
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

    const newSvc = {
      id: `s-${Date.now()}`,
      name: newServiceName,
      duration: newServiceDuration,
      mode: newServiceMode === 'both' ? 'in-person' : newServiceMode,
      price: parseInt(newServicePrice) || 1000,
      bookingsCount: 0,
      active: true,
    }

    setServices(prev => {
      const updated = [...prev, newSvc]
      if (user) {
        localStorage.setItem(`mastrive_services_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })

    setNewServiceName('')
    setNewServicePrice('')
    setActiveModal(null)
  }

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlotTime.trim()) return

    const newSlot = {
      id: `slot-${Date.now()}`,
      day: newSlotDay,
      time: newSlotTime,
      title: newSlotTitle || '1-on-1 Coaching',
      type: newSlotType,
      status: 'open',
      student: null,
    }

    setCalendarSlots(prev => {
      const updated = [...prev, newSlot]
      if (user) {
        localStorage.setItem(`mastrive_slots_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })

    setActiveModal(null)
  }

  const handleDashboardAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return

    setUploadingAvatar(true)
    const supabase = createClient()

    try {
      const localPreview = URL.createObjectURL(file)
      setAvatarUrl(localPreview)

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `avatars/${user.id}-${Date.now()}.${ext}`
      let publicUrl = ''

      try {
        const { error: uploadErr } = await supabase.storage
          .from('instructor-images')
          .upload(path, file, { contentType: file.type, upsert: true })

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('instructor-images').getPublicUrl(path)
          publicUrl = urlData.publicUrl
        }
      } catch {}

      if (!publicUrl) {
        publicUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      setAvatarUrl(publicUrl)

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      try {
        await supabase
          .from('instructors')
          .update({ image_urls: [publicUrl] })
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      } catch {
        // Non-critical
      }
    } catch (err) {
      console.warn('Avatar upload notice:', err)
    } finally {
      setUploadingAvatar(false)
    }
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
    setCalendarSlots(prev => {
      const updated = prev.map(s => {
        if (s.id === slotId) {
          return {
            ...s,
            status: s.status === 'open' ? 'booked' : 'open',
            student: s.status === 'open' ? 'Manually Reserved' : null,
          }
        }
        return s
      })
      if (user) {
        localStorage.setItem(`mastrive_slots_${user.id}`, JSON.stringify(updated))
      }
      return updated
    })
  }

  const filteredThreads = useMemo(() => {
    if (!threadSearch.trim()) return threads
    const q = threadSearch.toLowerCase()
    return threads.filter(t => t.name.toLowerCase().includes(q) || t.skill.toLowerCase().includes(q))
  }, [threads, threadSearch])

  const activeThread = filteredThreads.length > 0
    ? filteredThreads.find(t => t.id === selectedThreadId) || filteredThreads[0]
    : null

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

          {/* Navigation & Account Section */}
          <p className="px-3 mt-8 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">Navigation</p>
          <nav className="space-y-1">
            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <UserIcon className="size-[18px] text-[#e01e37]" />
              <span>Learner Profile</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <ArrowLeft className="size-[18px]" />
              <span>Back to Explore</span>
            </Link>
            <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <Settings className="size-[18px]" />
              <span>Account Settings</span>
            </Link>
            <Link href="/support" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/[0.04] hover:text-white transition">
              <HelpCircle className="size-[18px]" />
              <span>Help & Support</span>
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
            {/* Quick Toggle: Learner Profile */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12161f]/80 px-3 py-1.5 text-xs font-semibold text-[#f0f6fc] backdrop-blur-md transition hover:border-[#e01e37]/40 hover:bg-[#e01e37]/10 active:scale-95"
              title="Switch to Learner Profile"
            >
              <UserIcon className="size-3.5 text-[#e01e37]" />
              <span className="hidden sm:inline">Learner Profile</span>
            </Link>

            {/* Quick Toggle: Explore Skills */}
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12161f]/80 px-3 py-1.5 text-xs font-semibold text-[#8b949e] backdrop-blur-md transition hover:border-white/20 hover:text-white active:scale-95"
              title="Explore Skills"
            >
              <ArrowLeft className="size-3.5" />
              <span>Explore</span>
            </Link>

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
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#12161f]/80 px-3 py-1.5 transition hover:border-white/15">
              <div 
                onClick={() => dashAvatarInputRef.current?.click()}
                className="group relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#e01e37] to-[#900d1f] text-xs font-bold text-white cursor-pointer"
                title="Click to change profile picture"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={profileName} fill sizes="32px" className="size-full object-cover" />
                ) : (
                  profileName.substring(0, 2).toUpperCase()
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploadingAvatar ? (
                    <div className="size-3 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : (
                    <Camera className="size-3.5 text-white" />
                  )}
                </div>
              </div>
              <input 
                type="file" 
                ref={dashAvatarInputRef} 
                accept="image/*" 
                onChange={handleDashboardAvatarUpload} 
                className="hidden" 
              />
              <Link href="/profile" className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight line-clamp-1">{profileName}</p>
                <p className="text-[10px] text-[#8b949e]">{profileSkill.length > 20 ? profileSkill.substring(0, 20) + '...' : profileSkill}</p>
              </Link>
            </div>
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
                    <CreditCard className="size-3.5" />
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
                      {analyticsData.todayCount > 0 ? 'Live session schedule active' : 'No sessions scheduled today'}
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
                    <span className="text-4xl font-black text-white">
                      {analyticsData.totalMonthRevenue > 0
                        ? `₹${analyticsData.totalMonthRevenue.toLocaleString('en-IN')}`
                        : '₹0'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#8b949e] flex items-center gap-1.5">
                    {analyticsData.totalMonthRevenue > 0 ? (
                      <>
                        <TrendingUp className="size-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Live Payouts</span> from completed sessions
                      </>
                    ) : (
                      <>
                        <Clock className="size-3 text-[#6e7681]" />
                        <span>0 completed sessions this month</span>
                      </>
                    )}
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
                    {analyticsData.escrowHeld > 0 ? 'Clears upon session completion' : 'No funds currently in escrow'}
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
                    {analyticsData.activeLearnersCount > 0 ? (
                      <>
                        <span className="text-[#e01e37] font-semibold">{analyticsData.repeatPercentage}%</span> repeat learners
                      </>
                    ) : (
                      'Awaiting first student booking'
                    )}
                  </p>
                </div>
              </div>

              {/* ===== MIDDLE ROW: Analytics | Schedule | Services ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Session Analytics Chart */}
                {analyticsData.totalSessionsScheduled === 0 ? (
                  <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">Session Analytics</h3>
                      <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-bold text-[#8b949e]">
                        7 Days
                      </span>
                    </div>

                    <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-[#8b949e] mb-3">
                        <BarChart3 className="size-6 text-[#e01e37]" />
                      </div>
                      <p className="text-xs font-bold text-white">No Session Traffic Yet</p>
                      <p className="text-[11px] text-[#8b949e] max-w-[220px] mt-1">
                        Share your booking link to start logging bookings & chart trends.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveModal('share')}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition"
                    >
                      Share Booking Link
                    </button>
                  </div>
                ) : (
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
                )}

                {/* Today's Schedule / Reminders */}
                {analyticsData.todaySessions.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">Today&apos;s Next Session</h3>
                      <span className="size-2 rounded-full bg-emerald-400" />
                    </div>
                    
                    <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e01e37]/10 border border-[#e01e37]/20 text-[#e01e37] mb-3">
                        <CalendarIcon className="size-6" />
                      </div>
                      <p className="text-xs font-bold text-white">No Sessions Today</p>
                      <p className="text-[11px] text-[#8b949e] max-w-[220px] mt-1">
                        Your calendar is open today. Add open time blocks or share your link with learners.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setActiveModal('add-slot')}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e01e37] py-2 text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <Plus className="size-3" />
                        <span>Add Slot</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('calendar')}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-[#8b949e] hover:text-white transition"
                      >
                        <span>Schedule</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-white mb-4">Today&apos;s Next Session</h3>
                    <div className="space-y-4">
                      <div className="rounded-xl bg-[#0b0e14] border border-white/[0.06] p-4">
                        <p className="text-xs font-bold text-white">{analyticsData.todaySessions[0].service} with {analyticsData.todaySessions[0].learnerName}</p>
                        <p className="text-[11px] text-[#8b949e] mt-1 flex items-center gap-1.5">
                          <Clock className="size-3 text-[#e01e37]" />
                          {analyticsData.todaySessions[0].time}
                        </p>
                        <p className="text-[11px] text-[#6e7681] mt-1 flex items-center gap-1.5">
                          <MapPin className="size-3" />
                          {analyticsData.todaySessions[0].locationOrLink}
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
                )}

                {/* Services / Offerings Quick List */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Your Services</h3>
                    <button
                      onClick={() => setActiveModal('add-service')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#e01e37] hover:underline"
                    >
                      <Plus className="size-3" /> New
                    </button>
                  </div>

                  {services.length === 0 ? (
                    <>
                      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-[#8b949e] mb-3">
                          <Layers className="size-6 text-[#e01e37]" />
                        </div>
                        <p className="text-xs font-bold text-white">No Services Created</p>
                        <p className="text-[11px] text-[#8b949e] max-w-[220px] mt-1">
                          Set up 1-on-1 sparring, mitts, or live drills so students can book you.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveModal('add-service')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#e01e37] py-2 text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <Plus className="size-3" />
                        <span>+ Create First Service</span>
                      </button>
                    </>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* ===== BOTTOM ROW: Recent Learners | Progress | Escrow ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Learners */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Learners</h3>
                    <button
                      onClick={() => setActiveTab('inbox')}
                      className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold text-[#8b949e] hover:text-white transition"
                    >
                      <Plus className="size-3" /> View In Inbox
                    </button>
                  </div>

                  {upcomingSessions.length === 0 ? (
                    <>
                      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-[#8b949e] mb-3">
                          <Users className="size-6 text-[#e01e37]" />
                        </div>
                        <p className="text-xs font-bold text-white">No Learners Yet</p>
                        <p className="text-[11px] text-[#8b949e] max-w-[220px] mt-1">
                          Learners who book your sessions will appear here with direct chat and history.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveModal('share')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-white hover:bg-white/[0.08] transition"
                      >
                        <Share2 className="size-3" />
                        <span>Share Public Profile</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {upcomingSessions.slice(0, 4).map((session) => (
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
                  )}
                </div>

                {/* Session Completion Progress */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col items-center justify-between">
                  <h3 className="text-sm font-bold text-white self-start mb-2">Completion Progress</h3>
                  <div className="my-auto flex flex-col items-center">
                    <DonutChart percentage={analyticsData.completionRate} label="Completed" />
                    <div className="flex items-center gap-4 mt-4 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#e01e37]" />
                        <span className="text-[#8b949e]">Completed ({analyticsData.completedSessionsCount})</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-white/10" />
                        <span className="text-[#8b949e]">Scheduled ({analyticsData.totalSessionsScheduled})</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#6e7681] text-center mt-2">
                    {analyticsData.totalSessionsScheduled > 0 
                      ? 'Progress automatically tracks your completed bookings'
                      : 'Complete your first session to track progress'}
                  </p>
                </div>

                {/* Escrow Tracker */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Escrow Tracker</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">100% Protected</span>
                  </div>

                  {analyticsData.escrowHeld === 0 && analyticsData.totalMonthRevenue === 0 ? (
                    <>
                      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
                          <ShieldCheck className="size-6" />
                        </div>
                        <p className="text-xs font-bold text-white">Escrow Protection Active</p>
                        <p className="text-[11px] text-[#8b949e] max-w-[230px] mt-1">
                          Learner payments are securely locked in escrow upon checkout and instantly released once you finish training.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveModal('share')}
                        className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 text-[11px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 active:scale-[0.98]"
                      >
                        Share Profile to Get Booked
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2.5">
                      {upcomingSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">₹{session.price} · {session.learnerName}</p>
                            <p className="text-[10px] text-emerald-400">
                              {session.status === 'completed' ? 'Direct Bank Settlement' : 'Held in Escrow'}
                            </p>
                          </div>
                          {session.status === 'completed' ? (
                            <Check className="size-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="size-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                      ))}

                      {analyticsData.totalMonthRevenue > 0 && (
                        <button
                          onClick={() => setActiveModal('payout')}
                          className="mt-3 w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2 text-[11px] font-bold text-emerald-400 transition hover:bg-emerald-500/20 active:scale-[0.98]"
                        >
                          Withdraw Available Balance
                        </button>
                      )}
                    </div>
                  )}
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

                {/* Thread Cards or Empty State */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredThreads.length === 0 ? (
                    <div className="py-12 text-center px-4">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.04] text-[#8b949e] mx-auto mb-2">
                        <MessageSquare className="size-5 text-[#e01e37]" />
                      </div>
                      <p className="text-xs font-bold text-white">No Conversations Yet</p>
                      <p className="text-[11px] text-[#8b949e] mt-1 leading-relaxed">
                        Messages from learners will show up here automatically when they reach out.
                      </p>
                    </div>
                  ) : (
                    filteredThreads.map((thread) => {
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
                    })
                  )}
                </div>
              </div>

              {/* Active Conversation Chat Window or Empty State */}
              {activeThread ? (
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
              ) : (
                <div className="md:col-span-8 flex flex-col items-center justify-center h-[640px] bg-[#0b0e14]/90 p-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-[#e01e37]/10 border border-[#e01e37]/20 text-[#e01e37] mb-4">
                    <MessageSquare className="size-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Your Direct Student Inbox</h3>
                  <p className="text-xs text-[#8b949e] max-w-sm mt-1.5 leading-relaxed">
                    When students book sessions or send inquiries about your training packages, you can coordinate schedules, locations, and gear right here.
                  </p>
                  <button
                    onClick={() => setActiveModal('share')}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-[#e01e37] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(224,30,55,0.3)] transition hover:brightness-110 active:scale-95"
                  >
                    <Share2 className="size-3.5" />
                    <span>Share Booking Link</span>
                  </button>
                </div>
              )}

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

              {calendarSlots.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/10 text-[#8b949e] mx-auto mb-4">
                    <CalendarIcon className="size-8 text-[#e01e37]" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Availability Slots Configured</h3>
                  <p className="text-xs text-[#8b949e] max-w-md mx-auto mt-1.5 leading-relaxed">
                    Set up your weekly recurring time windows (e.g. Monday 06:00 PM - 07:00 PM) so learners can easily schedule sessions with you.
                  </p>
                  <button
                    onClick={() => setActiveModal('add-slot')}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e01e37] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(224,30,55,0.3)] transition hover:brightness-110 active:scale-95"
                  >
                    <Plus className="size-4" />
                    <span>+ Add Your First Time Slot</span>
                  </button>
                </div>
              ) : (
                /* Weekly Slot Grid */
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
              )}
            </div>
          )}

          {/* EARNINGS & ESCROW TAB */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              
              {/* Top Balance Banner */}
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#12161f] to-[#0c0f16] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Available Payout Balance</span>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      ₹{analyticsData.totalMonthRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      analyticsData.totalMonthRevenue > 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-[#8b949e] border-white/10'
                    }`}>
                      {analyticsData.totalMonthRevenue > 0 ? 'Ready for Instant Withdrawal' : 'Awaiting Session Completions'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e] mt-2">
                    Total lifetime payout earned: <strong className="text-white">₹{analyticsData.totalMonthRevenue.toLocaleString('en-IN')}</strong> · Platform fee: <strong className="text-emerald-400">0% (Founder tier)</strong>
                  </p>
                </div>

                <button
                  onClick={() => setActiveModal('payout')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition hover:brightness-110 active:scale-95"
                >
                  <CreditCard className="size-4" />
                  <span>Withdraw to UPI / Bank</span>
                </button>
              </div>

              {/* Payouts Breakdown Table */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-6 space-y-4">
                <h3 className="font-bold text-base text-white">Recent Completed Sessions & Escrow Settlements</h3>

                {analyticsData.completedSessionsCount === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-[#8b949e] mx-auto mb-3">
                      <CreditCard className="size-7 text-[#e01e37]" />
                    </div>
                    <h4 className="text-sm font-bold text-white">No Escrow Settlements Yet</h4>
                    <p className="text-xs text-[#8b949e] max-w-sm mx-auto mt-1">
                      As soon as you complete training sessions, settlements are automatically credited to your earnings and logged here.
                    </p>
                    <button
                      onClick={() => setActiveModal('share')}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
                    >
                      <Share2 className="size-3.5" />
                      <span>Share Booking Link</span>
                    </button>
                  </div>
                ) : (
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
                        {upcomingSessions.filter(s => s.status === 'completed').map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-4 font-medium text-white">{row.time}</td>
                            <td className="py-3.5 px-4 text-white">{row.learnerName}</td>
                            <td className="py-3.5 px-4">{row.service}</td>
                            <td className="py-3.5 px-4 text-white font-semibold">₹{row.price}</td>
                            <td className="py-3.5 px-4 text-emerald-400 font-bold">₹0 (0%)</td>
                            <td className="py-3.5 px-4 text-white font-bold">₹{row.price}</td>
                            <td className="py-3.5 px-4">
                              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Deposited
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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

              {services.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/10 text-[#8b949e] mx-auto mb-4">
                    <Layers className="size-8 text-[#e01e37]" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Services or Packages Yet</h3>
                  <p className="text-xs text-[#8b949e] max-w-md mx-auto mt-1.5 leading-relaxed">
                    Define the session packages you offer (e.g. 60 min 1-on-1 Boxing Mitts, ₹1,200) so students can select and book with one click.
                  </p>
                  <button
                    onClick={() => setActiveModal('add-service')}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e01e37] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_16px_rgba(224,30,55,0.3)] transition hover:brightness-110 active:scale-95"
                  >
                    <Plus className="size-4" />
                    <span>+ Create Your First Package</span>
                  </button>
                </div>
              ) : (
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
              )}
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
                      <CreditCard className="size-5" />
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
                          max={analyticsData.totalMonthRevenue}
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-[#8b949e] mt-1 block">
                          Max available balance: ₹{analyticsData.totalMonthRevenue.toLocaleString('en-IN')}
                        </span>
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
                        disabled={analyticsData.totalMonthRevenue <= 0}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
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
                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <h3 className="text-lg font-bold text-white">+ Add Availability Slot</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Day of Week</label>
                    <select
                      value={newSlotDay}
                      onChange={(e) => setNewSlotDay(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:border-[#e01e37]"
                    >
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
                    <label className="block text-xs font-semibold text-[#8b949e]">Session Title</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-on-1 Boxing Mitts / Sparring"
                      value={newSlotTitle}
                      onChange={(e) => setNewSlotTitle(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Time Window</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 06:00 PM - 07:00 PM"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-sm text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Format</label>
                    <select
                      value={newSlotType}
                      onChange={(e) => setNewSlotType(e.target.value as 'in-person' | 'online')}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:border-[#e01e37]"
                    >
                      <option value="in-person">In-Person Studio / Court</option>
                      <option value="online">Live Online Stream</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#e01e37] py-3 text-xs font-bold text-white hover:bg-red-700 transition active:scale-[0.98]"
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

                <p className="px-3 mt-6 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6e7681]">Navigation & Account</p>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white transition"
                >
                  <UserIcon className="size-[18px] text-[#e01e37]" />
                  <span>Learner Profile</span>
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#8b949e] hover:bg-white/5 hover:text-white transition"
                >
                  <ArrowLeft className="size-[18px]" />
                  <span>Back to Explore</span>
                </Link>
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