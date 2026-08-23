'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Wallet, User } from 'lucide-react'
import { motion } from 'motion/react'
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
  const supabase = createClient()

  useEffect(() => {
    // Check initial auth state
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
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
  }, [supabase])

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Logo */}
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
            className="h-8 w-auto object-contain"
          />
        </button>

        {/* Center Floating Glass Pill Navigation */}
        <nav className="hidden h-[50px] items-center gap-1.5 rounded-full border border-white/10 bg-[#161b22]/70 p-1.5 shadow-2xl backdrop-blur-xl lg:flex">
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

        {/* Right Action Section */}
        {loading ? (
          <div className="h-[50px] w-36 animate-pulse rounded-full bg-white/5" />
        ) : user ? (
          /* Authenticated User: Wallet & Profile Combined Pill */
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
              className="flex size-7 items-center justify-center rounded-full bg-[#e01e37]/10 text-white transition-colors hover:bg-[#e01e37] hover:text-white"
            >
              <User className="size-4" />
            </Link>
          </div>
        ) : (
          /* First-Time Visitor: Auth Controls */
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

      {/* Mobile Nav */}
      <nav className="mt-3 flex items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-[#161b22]/80 p-1.5 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}