'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
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

export default function Page() {
  const [tab, setTab] = useState<MainTab>('explore')
  const [category, setCategory] = useState<CategoryId>('fitness')
  const [query, setQuery] = useState('')

  return (
    <main className="min-h-screen bg-background">
      <Header activeTab={tab} onTabChange={setTab} />

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
            Coming Soon
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-4xl">
            Experience a{' '}
            <span className="font-serif italic text-[#e01e37]">
              live session.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-[#8b949e]">
            A 1-on-1 live streaming demo is being polished. Explore skills and book a session in the meantime.
          </p>
          <button
            onClick={() => setTab('explore')}
            className="mt-6 rounded-full bg-[#e01e37] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(224,30,55,0.4)] transition-all hover:bg-[#c0182f] active:scale-95"
          >
            Explore Skills
          </button>
        </section>
      )}
    </main>
  )
}