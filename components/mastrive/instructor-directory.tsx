'use client'

import React, { useMemo, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'
import { Star, Quote } from 'lucide-react'
import { instructors, type CategoryId } from '@/lib/data'
import { InstructorCard } from './instructor-card'
import type { BookingInstructor } from './booking-modal'

// Code-split heavy modal: Only loaded when user clicks "Book Session"
const BookingModal = dynamic(
  () => import('./booking-modal').then((mod) => mod.BookingModal),
  { ssr: false }
)

const REVIEWS = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Learner (Delhi)',
    skill: 'Fingerstyle Guitar',
    instructor: 'Meera Nair',
    rating: 5,
    comment:
      'Booked a 1-on-1 session before my college fest showcase. Meera spotted key finger-picking flaws in 20 minutes that I had been struggling with for months.',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Priya Verma',
    role: 'Learner (Saket)',
    skill: 'Competitive Coding',
    instructor: 'Nisha Verma',
    rating: 5,
    comment:
      'The live streaming setup and instant code debugging made the session worth way more than ₹1,400. High-octane teaching!',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Rohan Gupta',
    role: 'Tournament Player',
    skill: 'Chess Strategy',
    instructor: 'Kabir Chawla',
    rating: 5,
    comment:
      'Climbed into the top 3 on the State Leaderboard after analyzing my middle-game tactics with Kabir. Insanely structured feedback.',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Ananya Roy',
    role: 'Learner (Hauz Khas)',
    skill: 'Watercolour Landscapes',
    instructor: 'Arjun Mehta',
    rating: 5,
    comment:
      'The in-person session in Hauz Khas was incredibly grounding. Learned color blending techniques in under two hours.',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
]

// Duplicate reviews list to create seamless infinite marquee loop
const MARQUEE_REVIEWS = [...REVIEWS, ...REVIEWS]

export function InstructorDirectory({
  activeCategory,
  query,
}: {
  activeCategory: CategoryId
  query: string
}) {
  const [selectedInstructor, setSelectedInstructor] = useState<BookingInstructor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track scroll position right as section enters viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 90%', 'start 20%'],
  })

  // Apple-grade spring physics curve
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    restDelta: 0.001,
  })

  // Smooth Interpolations
  const opacity = useTransform(smoothProgress, [0, 0.5], [0, 1])
  const scale = useTransform(smoothProgress, [0, 1], [0.94, 1])
  const rotateX = useTransform(smoothProgress, [0, 1], [8, 0])

  // Parallax offsets
  const col1Y = useTransform(smoothProgress, [0, 1], [40, 0])
  const col2Y = useTransform(smoothProgress, [0, 1], [80, 0])
  const col3Y = useTransform(smoothProgress, [0, 1], [30, 0])

  const handleBookClick = useCallback((id: string) => {
    const instructor = instructors.find((i) => i.id === id)
    if (instructor) {
      setSelectedInstructor({
        name: instructor.name,
        skill: instructor.skill,
        price: instructor.price,
      })
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedInstructor(null)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return instructors.filter((i) => {
      if (activeCategory !== 'all' && i.category !== activeCategory) return false
      if (q && !`${i.skill} ${i.name}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [activeCategory, query])

  return (
    <div ref={containerRef} className="perspective-1000 w-full pb-24 overflow-hidden">
      <motion.section
        style={{
          opacity,
          scale,
          rotateX,
        }}
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 origin-top transform-gpu will-change-transform"
      >
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
            {filtered.length} instructor{filtered.length === 1 ? '' : 's'} available
          </p>
        </div>

        {/* Parallax Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((instructor, index) => {
              const colTransforms = [col1Y, col2Y, col3Y]
              const parallaxY = colTransforms[index % 3]

              return (
                <motion.div
                  key={instructor.id}
                  style={{ y: parallaxY }}
                  className="w-full transform-gpu will-change-transform"
                >
                  <InstructorCard
                    instructor={instructor}
                    onBook={handleBookClick}
                    booked={false}
                  />
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#161b22] p-12 text-center">
            <p className="text-sm text-[#8b949e]">
              No instructors match your search. Try a different category or keyword.
            </p>
          </div>
        )}

        {/* Automatic Horizontal Reviews Marquee */}
        <div className="content-auto mt-20 border-t border-white/10 pt-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#e01e37]">
                Verified Social Proof
              </span>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#f0f6fc]">
                What Learners Are Saying
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161b22] px-4 py-2 text-xs text-[#8b949e]">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#f0f6fc]">4.9 / 5.0</span> across 1,200+ verified sessions
            </div>
          </div>

          {/* Marquee Wrapper with Vignette Fades */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee gap-4 py-4 transform-gpu">
              {MARQUEE_REVIEWS.map((rev, idx) => (
                <div
                  key={`${rev.id}-${idx}`}
                  className="relative flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-sm transition-all duration-300 hover:border-white/20 sm:w-[380px]"
                >
                  <Quote className="absolute right-5 top-5 size-8 text-white/5" />
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                      <Star className="size-3.5 fill-current" />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[#8b949e]">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                    <div className="relative size-10 overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={rev.avatar}
                        alt={rev.name}
                        width={40}
                        height={40}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#f0f6fc]">
                        {rev.name}
                      </h4>
                      <p className="text-xs text-[#8b949e]">
                        Learned <span className="text-[#f0f6fc]">{rev.skill}</span> with {rev.instructor}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Modal (Loaded on Demand) */}
        {selectedInstructor && (
          <BookingModal
            isOpen={Boolean(selectedInstructor)}
            onClose={handleCloseModal}
            instructor={selectedInstructor}
          />
        )}
      </motion.section>
    </div>
  )
}