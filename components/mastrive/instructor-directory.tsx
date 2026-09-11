'use client'

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'
import { Star, Quote } from 'lucide-react'
import { instructors as fallbackInstructors, type CategoryId, type Instructor } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { InstructorCard } from './instructor-card'
import type { BookingInstructor } from './booking-modal'

// Code-split heavy modals: Loaded on demand
const BookingModal = dynamic(
  () => import('./booking-modal').then((mod) => mod.BookingModal),
  { ssr: false }
)

const InstructorProfileModal = dynamic(
  () => import('./instructor-profile-modal').then((mod) => mod.InstructorProfileModal),
  { ssr: false }
)

const REVIEWS = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Learner (South Delhi)',
    skill: 'Strength & Conditioning',
    instructor: 'Ikjot Singh',
    rating: 5,
    comment:
      'Ikjot completely transformed my lifts and posture in 4 weeks. Super patient, technical, and genuinely invested in progressive overload.',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Tanya Mehra',
    role: 'Learner (Delhi)',
    skill: 'Body Transformation',
    instructor: 'Ikjot Singh',
    rating: 5,
    comment:
      'Best fitness coach I have worked with. The personalized progressive overload plan and form cues are on point, and I saw real transformation.',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Karan Joshi',
    role: 'Strength Athlete',
    skill: 'Powerlifting & Form',
    instructor: 'Ikjot Singh',
    rating: 5,
    comment:
      'Great eye for technique corrections. Helped me break plateaus in my bench press and squat safely without injuries.',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
  },
]

// Duplicate reviews list to create seamless infinite marquee loop
const MARQUEE_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS]

type PublishedInstructorRow = {
  id: string
  display_name: string
  skill: string
  category: string
  teaching_modes: string[] | null
  locality: string | null
  city: string | null
  price_per_hour: number | null
  bio: string | null
  experience_years: string | null
  languages_spoken: string[] | null
  education: string | null
  certifications: string | null
  image_urls: string[] | null
  learners_count?: number | null
  is_verified?: boolean | null
  rating?: number | null
  reviews_count?: number | null
  is_published?: boolean | null
}

const categoryIdFor = (category: string): Exclude<CategoryId, 'all'> => {
  const normalized = category.toLowerCase()
  if (normalized.includes('fitness')) return 'fitness'
  if (normalized.includes('music') || normalized.includes('performing')) return 'music'
  if (normalized.includes('lifestyle') || normalized.includes('sports')) return 'lifestyle'
  return 'strategy'
}

const toInstructor = (row: PublishedInstructorRow): Instructor => {
  const isOnline = row.teaching_modes?.some((mode) => /online|stream|video/i.test(mode)) ?? false
  const area = isOnline ? 'Live Stream' : row.locality || row.city || 'Delhi'
  const experience = Number.parseInt(row.experience_years || '', 10)
  const learnersCount = Number(row.learners_count || 0)
  const isVerified = learnersCount >= 10 || Boolean(row.is_verified)
  const images = Array.isArray(row.image_urls) && row.image_urls.length > 0
    ? row.image_urls
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800']

  return {
    id: row.id,
    name: row.display_name,
    verified: isVerified,
    totalStudents: learnersCount,
    skill: row.skill,
    category: categoryIdFor(row.category),
    mode: isOnline ? 'online' : 'in-person',
    area,
    city: row.city || 'Delhi',
    rating: row.rating ? Number(row.rating) : 4.9,
    reviews: row.reviews_count != null ? Number(row.reviews_count) : learnersCount,
    price: row.price_per_hour ? Number(row.price_per_hour) : 1000,
    tag: `${isOnline ? 'LIVE ONLINE' : 'IN-PERSON'}: ${(row.city || area).toUpperCase()}`,
    image: images[0],
    images,
    description: row.bio || `${row.skill} instructor available for personalised sessions on Mastrive.`,
    experienceYears: Number.isFinite(experience) ? experience : undefined,
    languages: Array.isArray(row.languages_spoken) && row.languages_spoken.length > 0 ? row.languages_spoken : ['English', 'Hindi'],
    education: row.education || undefined,
    certifications: row.certifications
      ? [{ title: row.certifications, institute: 'Instructor-provided', year: '' }]
      : [],
    modes: row.teaching_modes || [],
  }
}

function InstructorCardSkeleton() {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] animate-pulse">
      <div className="h-48 w-full bg-white/5" />
      <div className="p-4 space-y-3 flex-1">
        <div className="h-4 w-3/4 bg-white/10 rounded-md" />
        <div className="h-3 w-1/2 bg-white/5 rounded-md" />
        <div className="space-y-2 pt-3">
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-4/5 bg-white/5 rounded-md" />
        </div>
      </div>
      <div className="p-4 border-t border-white/10 flex justify-between items-center">
        <div className="h-4 w-16 bg-white/10 rounded-md" />
        <div className="h-7 w-24 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}

export function InstructorDirectory({
  activeCategory,
  query,
}: {
  activeCategory: CategoryId
  query: string
}) {
  const [selectedInstructor, setSelectedInstructor] = useState<BookingInstructor | null>(null)
  const [activeProfileInstructor, setActiveProfileInstructor] = useState<Instructor | null>(null)
  const [publishedInstructors, setPublishedInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const loadAllInstructors = async () => {
      const mergedList: Instructor[] = []
      const seenIds = new Set<string>()
      const seenNames = new Set<string>()

      // 1. Load from Supabase `instructors` table (Primary Source of Truth)
      try {
        const { data: dbInstructors, error: instErr } = await supabase
          .from('instructors')
          .select('*')
          .order('published_at', { ascending: false })

        if (!instErr && dbInstructors && dbInstructors.length > 0) {
          for (const row of dbInstructors) {
            const mapped = toInstructor(row)
            const normalizedName = mapped.name?.toLowerCase().trim()
            if (!seenIds.has(mapped.id) && !seenNames.has(normalizedName)) {
              seenIds.add(mapped.id)
              seenNames.add(normalizedName)
              mergedList.push(mapped)
            }
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('Instructors table query fallback:', e)
      }

      // 2. Load from Supabase `instructor_applications` table (ensures newly submitted applications display immediately)
      try {
        const { data: appData, error: appErr } = await supabase
          .from('instructor_applications')
          .select('*')
          .order('created_at', { ascending: false })

        if (!appErr && appData && appData.length > 0) {
          for (const app of appData) {
            const appId = app.id
            const fullName = (app.full_name || app.institute_name || 'Coach').trim()
            const normalizedName = fullName.toLowerCase()
            
            if (!seenIds.has(appId) && !seenNames.has(normalizedName)) {
              seenIds.add(appId)
              seenNames.add(normalizedName)

              const isOnline = app.teaching_modes?.some((mode: string) => /online|stream|video/i.test(mode)) ?? false
              const area = isOnline ? 'Live Stream' : app.locality || app.location || app.city || 'Delhi'
              const experience = Number.parseInt(app.experience_years || app.experience || '', 10)
              const firstImage = Array.isArray(app.image_urls) && app.image_urls.length > 0 ? app.image_urls[0] : undefined

              mergedList.push({
                id: appId,
                name: fullName,
                verified: false, // Unverified until 10 learners boarded
                totalStudents: 0,
                skill: app.sub_skills || app.skill || 'Coach',
                category: categoryIdFor(app.category || 'Fitness & Combat'),
                mode: isOnline ? 'online' : 'in-person',
                area,
                city: app.city || 'Delhi',
                rating: 5.0,
                reviews: 0,
                price: app.price_per_hour ? Number(app.price_per_hour) : 1000,
                tag: `${isOnline ? 'LIVE ONLINE' : 'IN-PERSON'}: ${(app.city || area).toUpperCase()}`,
                image: firstImage,
                images: Array.isArray(app.image_urls) ? app.image_urls : (firstImage ? [firstImage] : []),
                description: app.bio || `Specialized ${app.sub_skills || app.skill || 'coach'} available for booking on Mastrive.`,
                experienceYears: Number.isFinite(experience) ? experience : 2,
                languages: app.languages_spoken || ['English', 'Hindi'],
                education: app.education || undefined,
                certifications: app.certifications
                  ? [{ title: app.certifications, institute: 'Instructor-provided', year: '' }]
                  : [],
                modes: app.teaching_modes || [],
              })
            }
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.warn('Applications table fallback notice:', e)
      }

      // Safe fallback to seed instructors if network or DB returned 0 rows
      if (mergedList.length === 0 && fallbackInstructors.length > 0) {
        mergedList.push(...fallbackInstructors)
      }

      if (mounted) {
        setPublishedInstructors(mergedList)
        setLoading(false)
      }
    }

    // Clear any stale localStorage instructor data — Supabase is the single source of truth now
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mastrive_custom_instructors')
    }

    loadAllInstructors()

    // Subscribe to Supabase Realtime for live changes in the instructors table
    const channel = supabase
      .channel('instructors-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'instructors' },
        (payload) => {
          if (!mounted) return

          if (payload.eventType === 'INSERT') {
            const row = payload.new as PublishedInstructorRow
            if (row && row.is_published !== false) {
              const inst = toInstructor(row)
              setPublishedInstructors((prev) => [inst, ...prev.filter((i) => i.id !== inst.id)])
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as PublishedInstructorRow
            if (row) {
              if (row.is_published === false) {
                setPublishedInstructors((prev) => prev.filter((i) => i.id !== row.id))
              } else {
                const inst = toInstructor(row)
                setPublishedInstructors((prev) => {
                  const exists = prev.some((i) => i.id === inst.id)
                  if (exists) {
                    return prev.map((i) => (i.id === inst.id ? inst : i))
                  }
                  return [inst, ...prev]
                })
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id
            if (deletedId) {
              setPublishedInstructors((prev) => prev.filter((i) => i.id !== deletedId))
            }
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const allInstructors = useMemo(() => publishedInstructors, [publishedInstructors])

  // Parallax offsets
  const col1Y = useTransform(smoothProgress, [0, 1], [40, 0])
  const col2Y = useTransform(smoothProgress, [0, 1], [80, 0])
  const col3Y = useTransform(smoothProgress, [0, 1], [30, 0])

  const handleBookClick = useCallback((id: string) => {
    const instructor = allInstructors.find((i) => i.id === id)
    if (instructor) {
      setSelectedInstructor({
        name: instructor.name,
        skill: instructor.skill,
        price: instructor.price,
      })
    }
  }, [allInstructors])

  const handleCardClick = useCallback((instructor: Instructor) => {
    setActiveProfileInstructor(instructor)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedInstructor(null)
  }, [])

  const handleCloseProfileModal = useCallback(() => {
    setActiveProfileInstructor(null)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allInstructors.filter((i) => {
      if (activeCategory !== 'all' && i.category !== activeCategory) return false
      if (q && !`${i.skill} ${i.name}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [activeCategory, allInstructors, query])

  return (
    <div id="instructors" ref={containerRef} className="perspective-1000 w-full pb-24 overflow-hidden">
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
            {loading ? 'Finding top coaches...' : `${filtered.length} instructor${filtered.length === 1 ? '' : 's'} available`}
          </p>
        </div>

        {/* Loading Skeletons or Parallax Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InstructorCardSkeleton />
            <InstructorCardSkeleton />
            <InstructorCardSkeleton />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((instructor, index) => {
              const colTransforms = [col1Y, col2Y, col3Y]
              const parallaxY = colTransforms[index % 3]

              return (
                <motion.div
                  key={instructor.id}
                  style={{ y: parallaxY }}
                  className="w-full h-full flex flex-col transform-gpu will-change-transform"
                >
                  <InstructorCard
                    instructor={instructor}
                    onBook={handleBookClick}
                    onCardClick={handleCardClick}
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
              <span className="font-bold text-[#f0f6fc]">4.9 / 5.0</span> across verified learners
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

        {/* UrbanPro Style Skill Details Popup Modal */}
        {activeProfileInstructor && (
          <InstructorProfileModal
            isOpen={Boolean(activeProfileInstructor)}
            onClose={handleCloseProfileModal}
            instructor={activeProfileInstructor}
            onBook={handleBookClick}
          />
        )}

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
