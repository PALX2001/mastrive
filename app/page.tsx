'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, CheckCircle2 } from 'lucide-react'
import { Header, type MainTab } from '@/components/mastrive/header'
import { Hero } from '@/components/mastrive/hero'
import { InstructorDirectory } from '@/components/mastrive/instructor-directory'
import type { CategoryId } from '@/lib/data'

// Lazy-load secondary views only when their respective tabs are activated
const TournamentsView = dynamic(
  () => import('@/components/mastrive/tournaments-view').then((mod) => mod.TournamentsView),
  {
    loading: () => (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
      </div>
    ),
  }
)

const InstructorApplicationView = dynamic(
  () => import('@/components/mastrive/instructor-application-view'),
  {
    loading: () => (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
      </div>
    ),
  }
)

function MainApp() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<MainTab>('explore')
  const [category, setCategory] = useState<CategoryId>('fitness')
  const [query, setQuery] = useState('')
  const [showWelcomeToast, setShowWelcomeToast] = useState(false)

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcomeToast(true)
      const timer = setTimeout(() => {
        setShowWelcomeToast(false)
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const handleTabChange = (newTab: MainTab) => {
    setTab(newTab)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col justify-between selection:bg-[#e01e37] selection:text-white">
      <div>
        <Header activeTab={tab} onTabChange={handleTabChange} />

        {/* Welcome Celebratory Banner Toast */}
        <AnimatePresence>
          {showWelcomeToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="sticky top-20 z-40 mx-auto max-w-xl px-4 py-2"
            >
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-[#0d1511]/95 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Welcome to MASTRIVE!</h4>
                    <p className="text-[11px] text-[#8b949e]">Your profile is ready. Explore top verified coaches and book your first session below.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcomeToast(false)}
                  className="rounded-lg p-1 text-[#8b949e] hover:bg-white/10 hover:text-white transition"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'explore' && (
          <>
            <Hero
              query={query}
              onQueryChange={setQuery}
              activeCategory={category}
              onCategoryChange={setCategory}
            />
            <InstructorDirectory activeCategory={category} query={query} />
          </>
        )}

        {tab === 'tournaments' && <TournamentsView />}

        {tab === 'instructor' && <InstructorApplicationView />}

        {tab === 'demo' && (
          <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161b22] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
              <span className="size-1.5 rounded-full bg-[#e01e37] shadow-[0_0_8px_rgba(224,30,55,0.8)]" />
              Live Demo Preview
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-4xl">
              Experience a{' '}
              <span className="font-serif italic text-[#e01e37]">
                live 1-on-1 session.
              </span>
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-[#8b949e]">
              Encrypted HD WebRTC streaming rooms for martial arts, music, chess, and coding coaching. Direct pay-per-session with zero subscriptions.
            </p>
            <button
              onClick={() => setTab('explore')}
              className="mt-6 rounded-full bg-[#e01e37] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(224,30,55,0.4)] transition-all hover:bg-[#c0182f] active:scale-95"
            >
              Explore Instructors
            </button>
          </section>
        )}
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>}>
      <MainApp />
    </Suspense>
  )
}