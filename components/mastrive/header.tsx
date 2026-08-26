'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Wallet, User, Menu, X } from 'lucide-react'
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

  useEffect(() => {
    const supabase = createClient()

    // Check initial auth state
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Error fetching user:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 sm:px-8">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Left: Hamburger Button (Mobile & Tablet < 1280px) */}
        <div className="flex items-center xl:hidden z-10 min-w-[40px]">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#161b22]/70 text-[#f0f6fc] backdrop-blur-xl transition-colors hover:border-white/20 active:scale-95"
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
        <nav className="hidden h-[50px] items-center gap-1.5 rounded-full border border-white/10 bg-[#161b22]/70 p-1.5 shadow-2xl backdrop-blur-xl xl:flex">
          {navItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`relative flex h-full items-center justify-center rounded-full px-5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-[#e01e37] shadow-[0_4px_12px_rgba(224,30,55,0.35)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
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
            <div className="size-10 xl:h-[50px] xl:w-36 animate-pulse rounded-full bg-white/5" />
          ) : (
            <>
              {/* Desktop Auth Controls */}
              <div className="hidden xl:flex">
                {user ? (
                  <div className="flex h-[50px] items-center gap-3 rounded-full border border-white/10 bg-[#161b22]/70 px-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-[#e01e37]" aria-hidden />
                      <span className="text-sm font-semibold tabular-nums text-[#f0f6fc]">
                        <span className="text-[#8b949e]">Wallet:</span> ₹4,500
                      </span>
                    </div>

                    <div className="h-4 w-px bg-white/10" />

                    <Link
                      href="/profile"
                      aria-label="User Profile"
                      className="flex size-7 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#e01e37]/10 text-white transition-colors hover:bg-[#e01e37]"
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
                  <div className="flex h-[50px] items-center gap-3 rounded-full border border-white/10 bg-[#161b22]/70 px-4 shadow-2xl backdrop-blur-xl">
                    <Link
                      href="/login?mode=signin"
                      className="px-2 text-xs font-semibold text-[#8b949e] transition-colors hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login?mode=signup"
                      className="rounded-full bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f]"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile & Tablet Profile Button (< 1280px) */}
              <Link
                href={user ? '/profile' : '/login'}
                aria-label={user ? 'Profile' : 'Sign in'}
                className="relative flex size-10 items-center justify-center rounded-full border border-white/15 bg-gradient-to-tr from-[#161b22] via-[#21262d] to-[#161b22] p-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-xl active:scale-95 xl:hidden"
              >
                <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[#0d1117]">
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
                    <div className="flex size-full items-center justify-center bg-[#161b22] text-[#8b949e] transition-colors hover:text-white">
                      <User className="size-5 text-[#e01e37]" />
                    </div>
                  )}
                </div>
              </Link>
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
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[300px] flex-col border-r border-white/10 bg-[#0d1117] p-6 shadow-2xl xl:hidden"
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

              {user && (
                <div className="mt-auto rounded-xl border border-white/10 bg-[#161b22] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8b949e]">
                    <Wallet className="size-4 text-[#e01e37]" />
                    <span>Wallet Balance</span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">₹4,500</div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}