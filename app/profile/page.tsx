'use client'

import { useEffect, useState } from 'react'
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
  MapPin
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'settings'>('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        // Redirect to login if unauthenticated
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    checkUser()
  }, [supabase, router])

  const handleSignOut = async () => {
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8b949e] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Explore
        </Link>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#161b22]/70 px-4 py-2 backdrop-blur-xl">
          <Wallet className="size-4 text-[#e01e37]" />
          <span className="text-sm font-semibold tabular-nums">
            <span className="text-[#8b949e]">Wallet:</span> ₹4,500
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 pb-20">
        {/* Profile Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#e01e37]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-[#e01e37]/20 border border-[#e01e37]/30 text-2xl font-bold text-[#e01e37]">
                {user?.email?.substring(0, 2).toUpperCase() || 'MS'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Mastrive User'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3" /> Verified Student
                  </span>
                </div>
                <p className="text-sm text-[#8b949e] mt-1">{user?.email}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#8b949e]">
                  <span className="flex items-center gap-1"><MapPin className="size-3 text-[#e01e37]" /> New Delhi, India</span>
                  <span className="flex items-center gap-1"><Calendar className="size-3 text-[#e01e37]" /> Member since 2026</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="size-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Calendar className="size-4" /> My Bookings
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="size-4" /> Settings
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between text-[#8b949e] mb-4">
                  <span className="text-sm font-medium">Active Bookings</span>
                  <Calendar className="size-5 text-[#e01e37]" />
                </div>
                <div className="text-3xl font-bold text-white">0</div>
                <p className="text-xs text-[#8b949e] mt-1">No upcoming sessions booked yet.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between text-[#8b949e] mb-4">
                  <span className="text-sm font-medium">Wallet Balance</span>
                  <Wallet className="size-5 text-[#e01e37]" />
                </div>
                <div className="text-3xl font-bold text-white">₹4,500</div>
                <p className="text-xs text-[#8b949e] mt-1">Available for instant instructor booking.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between text-[#8b949e] mb-4">
                  <span className="text-sm font-medium">Tournament Rank</span>
                  <Shield className="size-5 text-[#e01e37]" />
                </div>
                <div className="text-3xl font-bold text-white">Unranked</div>
                <p className="text-xs text-[#8b949e] mt-1">Join a leaderboard challenge to compete.</p>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-12 text-center backdrop-blur-xl">
              <Calendar className="mx-auto size-12 text-[#8b949e]/40 mb-4" />
              <h3 className="text-lg font-semibold text-white">No session history found</h3>
              <p className="text-sm text-[#8b949e] mt-1 max-w-sm mx-auto">
                Explore local skills or 1-on-1 streams and book your first session to see it listed here.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#e01e37] px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f]"
              >
                Browse Instructors
              </Link>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white mb-4">Account Information</h3>
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
                      defaultValue={user?.user_metadata?.full_name || ''}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-[#e01e37] focus:outline-none"
                    />
                  </div>
                  <button className="rounded-xl bg-[#e01e37] px-5 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f]">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#161b22]/40 p-6 backdrop-blur-xl">
                <h3 className="text-base font-semibold text-white mb-4">Preferences & Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/20 cursor-pointer hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Bell className="size-4 text-[#e01e37]" />
                      <span className="text-sm font-medium text-white">Email alerts for booking updates</span>
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