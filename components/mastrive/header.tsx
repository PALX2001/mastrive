'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type MainTab = 'explore' | 'tournaments' | 'instructor' | 'demo'

const navItems: { id: MainTab; label: string }[] = [
  { id: 'explore', label: 'Explore Skills' },
  { id: 'tournaments', label: 'Tournaments & Leaderboards' },
  { id: 'instructor', label: 'Become an Instructor' },
  { id: 'demo', label: 'Live Session Demo' },
]

export function Header({
  activeTab = 'explore',
  onTabChange,
}: {
  activeTab?: MainTab
  onTabChange?: (tab: MainTab) => void
}) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let lastFetchedUserId: string | null = null

    const fetchUserProfile = async (userId: string, userEmail?: string) => {
      if (lastFetchedUserId === userId && profileName) return
      lastFetchedUserId = userId

      try {
        let isInst = false

        // 1. Instant metadata check
        if (
          userEmail?.toLowerCase() === '2001palash@gmail.com' ||
          user?.user_metadata?.role === 'instructor' ||
          user?.app_metadata?.role === 'instructor'
        ) {
          isInst = true
        }

        // 2. Parallel concurrent checks across tables
        const [profileRes, appRes, instRes] = await Promise.allSettled([
          supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', userId)
            .maybeSingle(),
          userEmail
            ? supabase
                .from('instructor_applications')
                .select('id')
                .or(`user_id.eq.${userId},email.eq.${userEmail}`)
                .maybeSingle()
            : Promise.resolve({ data: null } as any),
          supabase
            .from('instructors')
            .select('id')
            .or(`id.eq.${userId},user_id.eq.${userId}`)
            .maybeSingle(),
        ])

        const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null
        if (profile?.full_name) {
          setProfileName(profile.full_name)
        }
        if (profile?.role === 'instructor') {
          isInst = true
        }

        if (!isInst && appRes.status === 'fulfilled' && appRes.value.data) {
          isInst = true
        }

        if (!isInst && instRes.status === 'fulfilled' && instRes.value.data) {
          isInst = true
        }

        setIsInstructor(isInst)
      } catch {
        // ignore error
      }
    }

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchUserProfile(user.id, user.email)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchUserProfile(u.id, u.email)
      } else {
        lastFetchedUserId = null
        setProfileName(null)
        setProfileAvatarUrl(null)
        setIsInstructor(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const displayName = useMemo(() => {
    if (!user) return 'My Account'
    if (profileName && profileName.trim()) return profileName.trim()
    if (user.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim()
    if (user.user_metadata?.name?.trim()) return user.user_metadata.name.trim()

    if (user.email) {
      const raw = user.email.split('@')[0]
      // Format cleanly: strip leading/trailing numbers and symbols (e.g. 2001palash -> Palash, rahul.sharma -> Rahul Sharma)
      const cleaned = raw.replace(/^[0-9_]+|[0-9_]+$/g, '').replace(/[._-]/g, ' ').trim()
      if (cleaned.length >= 2) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      }
    }
    return 'Learner'
  }, [user, profileName])

  const userAvatarUrl = profileAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <header
      className={`sticky top-0 z-50 w-full px-4 py-3 sm:px-8 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/[0.06] py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Left: Hamburger Button (Mobile & Tablet < 1280px) */}
        <div className="flex items-center xl:hidden z-10 min-w-[40px]">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="gloss-pill flex size-10 items-center justify-center rounded-full text-[#f5f5f5] transition-all hover:border-white/15 active:scale-95"
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* Center: Centered Logo (< 1280px) & Left-aligned Desktop Logo (≥ 1280px) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 xl:static xl:translate-x-0 xl:translate-y-0">
          <button
            onClick={() => onTabChange?.('explore')}
            className="flex items-center"
            aria-label="MASTRIVE home"
          >
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={130}
              height={32}
              priority
              className="h-7 w-auto object-contain sm:h-8"
            />
          </button>
        </div>

        {/* Center: Desktop Navigation Pills (≥ 1280px) */}
        <nav className="gloss-pill hidden h-[50px] items-center gap-1 rounded-full p-1.5 xl:flex">
          {navItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`relative flex h-full items-center justify-center rounded-full px-5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#777] hover:text-[#f5f5f5]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="header-active-pill"
                    className="absolute inset-0 rounded-full bg-[#e01e37] shadow-[0_4px_20px_rgba(224,30,55,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: User Profile Action Button */}
        <div className="flex items-center z-10 min-w-[40px] justify-end">
          {loading ? (
            <div className="size-10 xl:h-[50px] xl:w-36 animate-pulse rounded-full bg-white/[0.05]" />
          ) : (
            <>
              {/* Desktop Auth Controls */}
              <div className="hidden xl:flex items-center gap-2.5">
                {user ? (
                  <div className="gloss-pill flex h-[50px] items-center gap-3 rounded-full px-4">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 text-xs font-semibold text-[#f5f5f5] hover:text-white transition-colors"
                      >
                        <span className="max-w-[130px] truncate">
                          {displayName}
                        </span>
                      </Link>

                      <div className="h-4 w-px bg-white/[0.08]" />

                      <Link
                        href="/profile"
                        aria-label="User Profile"
                        className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#e01e37]/10 text-white transition-all hover:bg-[#e01e37] hover:shadow-[0_2px_12px_rgba(224,30,55,0.4)]"
                      >
                        {userAvatarUrl ? (
                          <Image
                            src={userAvatarUrl}
                            alt="Profile"
                            width={28}
                            height={28}
                            className="size-full object-cover"
                          />
                        ) : (
                          <User className="size-4" />
                        )}
                      </Link>
                    </div>
                ) : (
                  <div className="gloss-pill flex h-[50px] items-center gap-3 rounded-full px-4">
                    <Link
                      href="/login?mode=signin"
                      className="px-2 text-xs font-semibold text-[#777] transition-colors hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?mode=signup"
                      className="gloss-btn-primary rounded-full px-4 py-2 text-xs font-bold text-white"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile & Tablet Profile Button (< 1280px) */}
              <div className="flex items-center gap-2 xl:hidden">

                <Link
                  href={user ? '/profile' : '/login'}
                  aria-label={user ? 'Profile' : 'Sign in'}
                  className="gloss-pill relative flex size-10 items-center justify-center rounded-full p-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] active:scale-95"
                >
                  <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[#0a0a0a]">
                    {userAvatarUrl ? (
                      <Image
                        src={userAvatarUrl}
                        alt="Profile Avatar"
                        width={36}
                        height={36}
                        className="size-full object-cover"
                      />
                    ) : user ? (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#e01e37] to-[#800016] text-white">
                        <User className="size-5" />
                      </div>
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[#111] text-[#e01e37]">
                        <User className="size-5" />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drawer Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[300px] flex-col border-r border-white/[0.06] bg-[#0a0a0a] p-6 shadow-[4px_0_40px_rgba(0,0,0,0.7)] xl:hidden"
              style={{ backdropFilter: 'blur(24px)' }}
            >
              <div className="flex items-center justify-between pb-6">
                <Image
                  src="/logo.svg"
                  alt="MASTRIVE"
                  width={110}
                  height={26}
                  priority
                  className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
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
                        onTabChange?.(item.id)
                        setIsMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-start rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                          : 'text-[#8b949e] hover:bg-white/5 hover:text-[#f0f6fc]'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </nav>

              {user ? (
                <div className="mt-auto space-y-2">

                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#161b22] p-3.5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#e01e37]/20 text-[#e01e37] overflow-hidden">
                        {userAvatarUrl ? (
                          <Image
                            src={userAvatarUrl}
                            alt="Profile"
                            width={36}
                            height={36}
                            className="size-full object-cover"
                          />
                        ) : (
                          <User className="size-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white max-w-[150px] truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-[#8b949e]">View profile & bookings</div>
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/10">
                  <Link
                    href="/login?mode=signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl bg-[#e01e37] text-sm font-bold text-white shadow-lg shadow-[#e01e37]/30 hover:bg-[#c0182f]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}