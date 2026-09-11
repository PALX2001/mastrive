'use client'

import React, { useEffect, useState, memo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { categories, type CategoryId } from '@/lib/data'

const SKILLS = ['Boxing', 'Chess', 'Guitar', 'Pottery', 'Salsa', 'Web Dev']

const HERO_PHRASES = [
  { id: 'find', line1: 'Find your', line2: 'perfect skill.' },
  { id: 'master', line1: 'and', line2: 'master it.' },
]

// Isolated Typewriter Search Bar: Prevents full Hero re-rendering on every character tick (60ms)
const HeroSearchBar = memo(function HeroSearchBar({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (v: string) => void
}) {
  const [placeholderText, setPlaceholderText] = useState("Try 'Boxing'")

  useEffect(() => {
    let isMounted = true
    let skillIdx = 0
    let charIdx = 0
    let isDeleting = false
    let timeoutId: NodeJS.Timeout

    const prefix = "Try '"
    const suffix = "'"

    const tick = () => {
      if (!isMounted) return

      const currentSkill = SKILLS[skillIdx]

      if (isDeleting) {
        charIdx--
      } else {
        charIdx++
      }

      setPlaceholderText(`${prefix}${currentSkill.slice(0, charIdx)}${suffix}`)

      let speed = isDeleting ? 60 : 110

      if (!isDeleting && charIdx === currentSkill.length) {
        speed = 1800
        isDeleting = true
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false
        skillIdx = (skillIdx + 1) % SKILLS.length
        speed = 350
      }

      timeoutId = setTimeout(tick, speed)
    }

    timeoutId = setTimeout(tick, 500)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={(e) => e.preventDefault()}
      className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] p-2 pl-5 shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl focus-within:border-[#e01e37]/40 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(224,30,55,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300"
    >
      <Search className="size-5 shrink-0 text-[#666]" aria-hidden />
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        type="text"
        placeholder={placeholderText}
        aria-label="Search skills"
        className="min-w-0 flex-1 bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#555]"
      />
      <button
        type="submit"
        className="gloss-btn-primary shrink-0 rounded-full px-6 py-2.5 text-xs font-bold text-white"
      >
        Search
      </button>
    </motion.form>
  )
})

export function Hero({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  activeCategory: CategoryId
  onCategoryChange: (id: CategoryId) => void
}) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [locationName, setLocationName] = useState<string>('Delhi')

  // Loop Hero Phrases
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length)
    }, 3200)
    return () => clearInterval(phraseInterval)
  }, [])

  // Geolocation & Reverse Geocoding with sessionStorage caching & abort controller
  useEffect(() => {
    if (typeof window === 'undefined') return

    const cachedLoc = sessionStorage.getItem('mastrive_loc')
    if (cachedLoc) {
      setLocationName(cachedLoc)
      return
    }

    if (!('geolocation' in navigator)) {
      setLocationName('Delhi')
      return
    }

    const abortController = new AbortController()

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: abortController.signal }
          )
          const data = await res.json()
          const state =
            data.address?.state ||
            data.address?.region ||
            data.address?.city ||
            'Delhi'

          setLocationName(state)
          sessionStorage.setItem('mastrive_loc', state)
        } catch {
          setLocationName('Delhi')
        }
      },
      () => {
        setLocationName('Delhi')
      },
      { timeout: 5000 }
    )

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <section className="relative z-10 flex min-h-[70vh] w-full flex-col items-center justify-center overflow-visible px-4 pb-6 pt-12 sm:pt-16">
      <div className="relative mx-auto max-w-3xl text-center">

        {/* Layered ambient glows — gives depth without being flat */}
        <div aria-hidden className="pointer-events-none">
          {/* Primary center bloom */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e01e37]/12 blur-[100px] transform-gpu" />
          {/* Offset secondary glow — depth layer */}
          <div className="absolute left-[40%] top-[30%] -z-10 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e01e37]/06 blur-[80px] transform-gpu" />
        </div>

        {/* Location Badge — glass style */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-[#888] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
        >
          {/* Pulsing live dot */}
          <span className="relative flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70 duration-1000" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </span>
          <span>{locationName}</span>
        </motion.div>

        {/* Heading — animated phrase flip */}
        <div className="relative flex min-h-[70px] sm:h-[80px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={HERO_PHRASES[phraseIndex].id}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 text-center text-3xl font-extrabold leading-tight tracking-tight text-[#f5f5f5] sm:text-6xl"
            >
              <span className="shrink-0">{HERO_PHRASES[phraseIndex].line1}</span>
              <span className="inline-block bg-gradient-to-r from-[#ff8080] via-[#e01e37] to-[#ff4d6d] bg-clip-text font-serif italic text-transparent drop-shadow-[0_0_20px_rgba(224,30,55,0.4)]">
                {HERO_PHRASES[phraseIndex].line2}
              </span>
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-xl text-pretty text-sm sm:text-base leading-relaxed text-[#777]"
        >
          Book in-person sessions nearby or jump into a live 1-on-1 stream. Pay per session or subscribe.
        </motion.p>

        {/* Search Bar (Isolated Memoized Typewriter) */}
        <HeroSearchBar query={query} onQueryChange={onQueryChange} />

        {/* Category Pills — gloss style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => {
            const active = activeCategory === cat.id
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  active
                    ? 'border-[#e01e37]/60 bg-[#e01e37] text-white shadow-[0_4px_20px_rgba(224,30,55,0.45)]'
                    : 'border-white/[0.08] bg-white/[0.04] text-[#888] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md hover:border-white/15 hover:text-[#f5f5f5]'
                }`}
              >
                {IconComponent && (
                  <IconComponent
                    className={`size-3.5 ${active ? 'text-white' : 'text-[#777]'}`}
                  />
                )}
                {cat.label}
              </button>
            )
          })}
        </motion.div>
      </div>

      {/* Subtle Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 0.8, duration: 0.5 },
          y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        }}
        className="mt-10 text-[#666]"
      >
        <ChevronDown className="size-5" />
      </motion.div>
    </section>
  )
}