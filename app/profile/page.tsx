'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Wallet, 
  Calendar, 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  CreditCard, 
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Video,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { VerifiedProgressTrack } from '@/components/mastrive/verified-progress-track'

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profileData, setProfileData] = useState<{ full_name?: string; city?: string; phone?: string } | null>(null)
  const [isInstructor, setIsInstructor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'settings'>('overview')
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const router = useRouter()

  const resolvedName = useMemo(() => {
    if (profileData?.full_name?.trim()) return profileData.full_name.trim()
    if (user?.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim()
    if (user?.user_metadata?.name?.trim()) return user.user_metadata.name.trim()

    if (user?.email) {
      const raw = user.email.split('@')[0]
      const cleaned = raw.replace(/^[0-9_]+|[0-9_]+$/g, '').replace(/[._-]/g, ' ').trim()
      if (cleaned.length >= 2) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      }
    }
    return 'Learner'
  }, [profileData, user])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!isMounted) return
        if (error || !user) {
          router.push('/login')
          return
        }
        
        setUser(user)
        setNameInput(user.user_metadata?.full_name || '')

        // Fetch profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, city, phone')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          setProfileData(profile)
          if (profile.full_name && !user.user_metadata?.full_name) {
            setNameInput(profile.full_name)
          }
        }

        // Fetch user's bookings from bookings table
        setLoadingBookings(true)
        try {
          const { data: userBookings } = await supabase
            .from('bookings')
            .select('*')
            .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
            .order('created_at', { ascending: false })

          if (userBookings && isMounted) {
            setBookings(userBookings)
          }
        } catch {
          // Table might still be synchronizing
        } finally {
          if (isMounted) setLoadingBookings(false)
        }

        // Check instructor role
        if (user.user_metadata?.role === 'instructor' || user.app_metadata?.role === 'instructor' || profile?.role === 'instructor') {
          setIsInstructor(true)
        } else {
          const { data: application } = await supabase
            .from('instructor_applications')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .maybeSingle()

          if (application) setIsInstructor(true)
        }
      } catch {
        if (isMounted) router.push('/login')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkUser()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setSaveStatus(null)
    const supabase = createClient()

    try {
      const trimmedName = nameInput.trim()

      // 1. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: { full_name: trimmedName }
      })

      // 2. Update profiles table in Supabase
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: trimmedName,
          updated_at: new Date().toISOString()
        })

      if (profErr) {
        setSaveStatus({ type: 'error', text: profErr.message })
      } else {
        setSaveStatus({ type: 'success', text: 'Profile updated successfully!' })
        setProfileData((prev) => ({ ...prev, full_name: trimmedName }))
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', text: err?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0f12] text-white">
        <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white">
      {/* Top Header Navigation Link */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8b949e] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Explore
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161b22]/70 px-3.5 py-1.5 backdrop-blur-xl">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-semibold text-[#f0f6fc]">Account Active</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        {/* Profile Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#161b22]/50 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#e01e37]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e01e37]/20 border border-[#e01e37]/30 text-2xl font-bold text-[#e01e37]">
                {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                  <Image
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                ) : (
                  resolvedName.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {resolvedName}
                  </h1>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    isInstructor
                      ? 'bg-[#e01e37]/10 text-[#e01e37] border-[#e01e37]/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <CheckCircle2 className="size-3" /> {isInstructor ? 'Verified Instructor' : 'Member'}
                  </span>
                </div>
                <p className="text-sm text-[#8b949e] mt-1">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#8b949e]">
                  <span className="flex items-center gap-1"><MapPin className="size-3 text-[#e01e37]" /> {profileData?.city || 'Delhi NCR, India'}</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3 text-[#e01e37]" /> Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2026'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isInstructor && (
                <Link
                  href="/dashboard/instructor"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e01e37] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f]"
                >
                  Instructor Dashboard
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="size-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Calendar className="size-4" /> My Bookings
            {bookings.length > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                {bookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="size-4" /> Settings
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="mt-8 space-y-6">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[#8b949e] mb-4">
                    <span className="text-sm font-medium">Active Bookings</span>
                    <Calendar className="size-5 text-[#e01e37]" />
                  </div>
                  <div className="text-3xl font-bold text-white">0</div>
                  <p className="text-xs text-[#8b949e] mt-1">No upcoming sessions scheduled yet.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[#8b949e] mb-4">
                    <span className="text-sm font-medium">Wallet Balance</span>
                    <Wallet className="size-5 text-[#e01e37]" />
                  </div>
                  <div className="text-3xl font-bold text-white">₹0</div>
                  <p className="text-xs text-[#8b949e] mt-1">Instant per-session checkout active.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[#8b949e] mb-4">
                    <span className="text-sm font-medium">Verified Hours</span>
                    <Shield className="size-5 text-[#e01e37]" />
                  </div>
                  <div className="text-3xl font-bold text-white">0 hrs</div>
                  <p className="text-xs text-[#8b949e] mt-1">Logged from completed 1-on-1 sessions.</p>
                </div>
              </div>

              {/* Progress & Certification Track */}
              <VerifiedProgressTrack
                verifiedHrs={0}
                userName={resolvedName}
                userSkill={isInstructor ? 'Verified Instructor' : 'Active Learner'}
                rank={1}
                xp={100}
              />
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Your Booked Sessions</h3>
                  <p className="text-xs text-[#8b949e]">
                    100% Escrow Protected: Funds are safely held by Mastrive and released to the coach only after the session.
                  </p>
                </div>
                <Link
                  href="/"
                  className="self-start sm:self-auto rounded-full border border-white/10 bg-[#161b22] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  + Book Another Coach
                </Link>
              </div>

              {loadingBookings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#161b22]/40" />
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.map((b) => {
                    const isOnline = b.mode === 'online'
                    return (
                      <div
                        key={b.id}
                        className="rounded-2xl border border-white/10 bg-[#161b22]/70 p-5 shadow-xl backdrop-blur-xl transition hover:border-white/20"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              <ShieldCheck className="size-3" /> 100% Escrow Secured
                            </span>
                            <h4 className="mt-2 text-base font-bold text-white">
                              {b.instructor_name}
                            </h4>
                            <p className="text-xs font-semibold text-[#e01e37]">
                              {b.instructor_skill}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-extrabold text-white">
                              ₹{Number(b.total_amount).toLocaleString('en-IN')}
                            </span>
                            <p className="text-[10px] text-[#8b949e] uppercase">
                              {b.payment_method === 'upi_qr' ? 'UPI Instant' : 'Razorpay Online'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs text-[#8b949e]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-[#e01e37]" />
                            <span className="truncate">{b.session_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-[#e01e37]" />
                            <span>{b.session_time}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8b949e]">
                            {isOnline ? (
                              <span className="flex items-center gap-1 text-blue-400">
                                <Video className="size-3" /> 1-on-1 Live Stream
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-400">
                                <MapPin className="size-3" /> In-Person Studio
                              </span>
                            )}
                          </span>

                          {isOnline ? (
                            <Link
                              href="/demo"
                              className="rounded-xl bg-[#e01e37] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#e01e37]/25 transition hover:bg-[#c0182f]"
                            >
                              Join Live Room
                            </Link>
                          ) : (
                            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white">
                              Venue Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-12 text-center backdrop-blur-xl">
                  <Calendar className="mx-auto size-12 text-[#8b949e]/40 mb-4" />
                  <h3 className="text-lg font-semibold text-white">No session history found</h3>
                  <p className="text-sm text-[#8b949e] mt-1 max-w-sm mx-auto">
                    Explore local coaches or 1-on-1 live streams and book your first session to see it listed here.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-[#e01e37] px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f]"
                  >
                    Browse Instructors
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white mb-4">Account Information</h3>
                
                {saveStatus && (
                  <div className={`mb-4 rounded-xl p-3 text-xs font-medium ${
                    saveStatus.type === 'success' 
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                      : 'border border-red-500/30 bg-red-500/10 text-red-300'
                  }`}>
                    {saveStatus.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e] mb-1">Email Address</label>
                    <input 
                      type="text" 
                      disabled 
                      value={user?.email || ''} 
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-[#8b949e] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e] mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-[#e01e37] focus:outline-none transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-xl bg-[#e01e37] px-5 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white mb-4">Preferences & Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/20 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="size-4 text-[#e01e37]" />
                      <span className="text-sm font-medium text-white">Email alerts for session confirmations & updates</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-[#e01e37] size-4" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}