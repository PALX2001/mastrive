'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { categories, type CategoryId } from '@/lib/data'

const SKILLS = ['Boxing', 'Chess', 'Guitar', 'Pottery', 'Salsa', 'Web Dev']

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
  const [placeholderText, setPlaceholderText] = useState('')

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
    <section className="relative z-10 w-full overflow-visible">
      {/* SVG Blur Filter Definition */}
      <svg className="absolute size-0" aria-hidden>
        <defs>
          <filter id="text-centered-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="70" result="blur" />
          </filter>
        </defs>
      </svg>

      <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24">
        {/* Delhi Early Access Badge */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161b22] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#8b949e]"
        >
          <span className="size-1.5 rounded-full bg-[#e01e37]" />
          Delhi • Early Access
        </motion.p>

        {/* Heading Container with Centered Glow */}
        <div className="relative inline-block w-full">
          {/* Centered Ambient Glow Element */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[280px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(224, 30, 55, 0.45) 0%, rgba(224, 30, 55, 0.18) 40%, rgba(0, 0, 0, 0) 75%)',
              filter: 'url(#text-centered-glow)',
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[#f0f6fc] sm:text-6xl"
          >
            Find your{' '}
            <span className="inline-block bg-gradient-to-r from-[#ff8080] via-[#e01e37] to-[#ff4d6d] bg-clip-text font-serif italic text-transparent">
              perfect skill.
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-[#8b949e]"
        >
          Book in-person sessions nearby or jump into a live 1-on-1 stream — pay
          per session, no subscriptions.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-white/10 bg-[#161b22] p-2 pl-5 shadow-2xl shadow-black/40 focus-within:border-[#e01e37]/50"
        >
          <Search className="size-5 shrink-0 text-[#8b949e]" aria-hidden />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="text"
            placeholder={placeholderText}
            aria-label="Search skills"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#f0f6fc] outline-none placeholder:text-[#8b949e]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#e01e37] px-6 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)] transition-all hover:bg-[#c0182f] active:scale-95"
          >
            Search
          </button>
        </motion.form>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const active = activeCategory === cat.id
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? 'border-[#e01e37] bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)]'
                    : 'border-white/10 bg-[#161b22] text-[#8b949e] hover:border-white/20 hover:text-[#f0f6fc]'
                }`}
              >
                {IconComponent && (
                  <IconComponent
                    className={`size-3.5 ${active ? 'text-white' : 'text-[#8b949e]'}`}
                  />
                )}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}