'use client'

import { useState } from 'react'
import { Header, type MainTab } from '@/components/mastrive/header'
import { Hero } from '@/components/mastrive/hero'
import { InstructorDirectory } from '@/components/mastrive/instructor-directory'
import { TournamentsView } from '@/components/mastrive/tournaments-view'
import InstructorApplicationView from '@/components/mastrive/instructor-application-view'
import type { CategoryId } from '@/lib/data'

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
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Coming Soon
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Experience a{' '}
            <span className="font-serif italic text-primary">
              live session.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            A 1-on-1 live streaming demo is being polished. Explore skills and book a session in the meantime.
          </p>
          <button
            onClick={() => setTab('explore')}
            className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Explore Skills
          </button>
        </section>
      )}
    </main>
  )
}