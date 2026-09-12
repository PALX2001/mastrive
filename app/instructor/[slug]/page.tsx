import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { instructors as staticInstructors, type Instructor, type CategoryId } from '@/lib/data'
import {
  InstructorProfileView,
  type InstructorProfileData,
  type ProfilePackage,
  type ProfileSlot,
} from '@/components/mastrive/instructor-profile-view'

type PageProps = {
  params: Promise<{ slug: string }>
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co'
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_duxFFpmuESkr6dThcJTqxQ_C1IL6vli'

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

const categoryIdFor = (category: string): Exclude<CategoryId, 'all'> => {
  const normalized = (category || '').toLowerCase()
  if (normalized.includes('fitness')) return 'fitness'
  if (normalized.includes('music') || normalized.includes('performing')) return 'music'
  if (normalized.includes('lifestyle') || normalized.includes('sports')) return 'lifestyle'
  return 'strategy'
}

async function resolveInstructor(rawSlug: string): Promise<InstructorProfileData | null> {
  const decoded = decodeURIComponent(rawSlug || '').trim()
  const cleanSlug = decoded.toLowerCase().replace(/[^a-z0-9]/g, '')
  const hyphenSlug = decoded.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  // 1. Search in static verified instructors
  const matchedStatic = staticInstructors.find(
    (inst) =>
      inst.id === decoded ||
      inst.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSlug ||
      inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === hyphenSlug ||
      cleanSlug.includes(inst.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  )

  if (matchedStatic) {
    return matchedStatic
  }

  // 2. Search in Supabase `instructors` table with targeted queries
  try {
    const supabase = getSupabaseClient()

    // 2a. Query by slug
    let query = supabase
      .from('instructors')
      .select('*')
      .eq('slug', hyphenSlug)
      .maybeSingle()

    let { data: matchedDb, error } = await query

    // 2b. Fallback query by ID if rawSlug is UUID
    if (!matchedDb) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded)
      if (isUuid) {
        const { data: byId } = await supabase
          .from('instructors')
          .select('*')
          .eq('id', decoded)
          .maybeSingle()
        matchedDb = byId
      }
    }

    // 2c. Fallback query by clean slug or display_name
    if (!matchedDb) {
      const { data: byName } = await supabase
        .from('instructors')
        .select('*')
        .ilike('display_name', decoded.replace(/-/g, ' '))
        .limit(1)
        .maybeSingle()
      matchedDb = byName
    }

    if (matchedDb) {
      // 3. Fetch active services for this instructor
      const { data: dbServices } = await supabase
        .from('instructor_services')
        .select('*')
        .eq('instructor_id', matchedDb.id)
        .eq('active', true)
        .order('price', { ascending: true })

      // 4. Fetch open calendar slots for this instructor
      const { data: dbSlots } = await supabase
        .from('instructor_slots')
        .select('*')
        .eq('instructor_id', matchedDb.id)
        .eq('status', 'open')
        .order('created_at', { ascending: true })

      const isOnline = matchedDb.teaching_modes?.some((m: string) => /online|stream|video/i.test(m)) ?? false
      const area = isOnline ? 'Live Stream' : matchedDb.locality || matchedDb.city || 'Delhi'
      const learnersCount = Number(matchedDb.learners_count || 0)
      const basePrice = Number(matchedDb.price_per_hour) || 1200

      // Map packages
      let packages: ProfilePackage[] = []
      if (dbServices && dbServices.length > 0) {
        packages = dbServices.map((s: any) => ({
          id: s.id,
          title: s.name,
          duration: s.duration || '60 min',
          price: Number(s.price),
          badge: s.price < basePrice ? 'Best Value' : undefined,
        }))
      } else {
        packages = [
          { title: 'Single 1-on-1 Trial Session', duration: '60 min', price: basePrice, badge: 'Popular' },
          { title: '5-Session Acceleration Pass', duration: '5 × 60 min', price: Math.round(basePrice * 4.5), badge: '10% Off' },
        ]
      }

      // Map slots
      const slots: ProfileSlot[] = (dbSlots || []).map((s: any) => ({
        id: s.id,
        day: s.day,
        time: s.time,
        title: s.title,
        type: s.type,
        status: s.status,
      }))

      const mapped: InstructorProfileData = {
        id: matchedDb.id,
        name: matchedDb.display_name,
        verified: Boolean(matchedDb.is_verified) || learnersCount >= 10,
        skill: matchedDb.skill,
        category: categoryIdFor(matchedDb.category),
        mode: isOnline ? 'online' : 'in-person',
        area,
        city: matchedDb.city || 'Delhi',
        rating: matchedDb.rating ? Number(matchedDb.rating) : 4.9,
        reviews: matchedDb.reviews_count != null ? Number(matchedDb.reviews_count) : learnersCount || 12,
        price: basePrice,
        tag: `${isOnline ? 'LIVE ONLINE' : 'IN-PERSON'}: ${(matchedDb.city || area).toUpperCase()}`,
        image: matchedDb.image_urls?.[0] || '/placeholder.jpg',
        images: Array.isArray(matchedDb.image_urls) && matchedDb.image_urls.length > 0
          ? matchedDb.image_urls
          : ['/placeholder.jpg'],
        headline: matchedDb.headline || `Certified ${matchedDb.skill} Specialist`,
        description: matchedDb.bio || `Verified ${matchedDb.skill} coach available for personal sessions on Mastrive.`,
        experienceYears: Number.parseInt(matchedDb.experience_years) || 5,
        totalStudents: learnersCount || 250,
        languages: Array.isArray(matchedDb.languages_spoken) && matchedDb.languages_spoken.length > 0
          ? matchedDb.languages_spoken
          : ['English', 'Hindi'],
        education: matchedDb.education || 'Professional Coach Certification',
        certifications: matchedDb.certifications
          ? [{ title: matchedDb.certifications, institute: 'Verified Institute', year: '2024' }]
          : [],
        modes: matchedDb.teaching_modes || ['1-on-1 Studio Sessions', 'Live HD Stream'],
        specialties: [matchedDb.skill, 'Form Correction', 'Customized Routine'],
        packages,
        slots,
      }

      return mapped
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Database instructor lookup error:', err)
    }
  }

  return null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const instructor = await resolveInstructor(slug)

  if (!instructor) {
    return {
      title: 'Instructor Profile Not Found | MASTRIVE',
      description: 'The requested coach profile could not be found on MASTRIVE.',
    }
  }

  const title = `${instructor.name} — ${instructor.skill} Coach | MASTRIVE`
  const description =
    instructor.description ||
    `Book 1-on-1 personal session with ${instructor.name}, certified ${instructor.skill} coach on MASTRIVE.`
  const ogImage = instructor.image || instructor.images?.[0] || 'https://mastrive.com/placeholder.jpg'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1000,
          alt: instructor.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PublicInstructorProfilePage({ params }: PageProps) {
  const { slug } = await params
  const instructor = await resolveInstructor(slug)

  if (!instructor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080a0f] px-4 text-center text-[#f0f6fc]">
        <div className="size-16 rounded-2xl border border-white/10 bg-[#161b22] flex items-center justify-center text-2xl mb-4">
          🔍
        </div>
        <h1 className="text-2xl font-bold text-white">Instructor Profile Not Found</h1>
        <p className="mt-2 text-sm text-[#8b949e] max-w-sm">
          We couldn&apos;t find an active instructor profile matching &quot;{slug}&quot;.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e01e37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#e01e37]/30 transition hover:bg-[#c0182f]"
        >
          <ArrowLeft className="size-4" />
          Browse All Instructors
        </Link>
      </div>
    )
  }

  return <InstructorProfileView instructor={instructor} />
}
