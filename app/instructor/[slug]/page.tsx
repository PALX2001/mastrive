'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Video, 
  Calendar, 
  Clock, 
  Award, 
  GraduationCap, 
  Languages, 
  CheckCircle2, 
  Share2, 
  Check, 
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react'
import { instructors, type Instructor } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { BookingModal } from '@/components/mastrive/booking-modal'

export default function PublicInstructorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string) || ''
  const slug = decodeURIComponent(rawSlug).toLowerCase().replace(/[^a-z0-9]/g, '')

  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const resolveInstructor = async () => {
      // 1. Search in static verified instructors
      const matchedStatic = instructors.find(
        (inst) =>
          inst.id === rawSlug ||
          inst.name.toLowerCase().replace(/[^a-z0-9]/g, '') === slug ||
          slug.includes(inst.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )

      if (matchedStatic) {
        if (isMounted) {
          setInstructor(matchedStatic)
          setSelectedImage(matchedStatic.image || matchedStatic.images?.[0] || '')
          setLoading(false)
        }
        return
      }

      // 2. Search in Supabase published instructors table
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select('*')
          .eq('is_published', true)

        if (!error && data && data.length > 0) {
          const matchedDb = data.find(
            (row) =>
              row.id === rawSlug ||
              row.display_name?.toLowerCase().replace(/[^a-z0-9]/g, '') === slug
          )

          if (matchedDb && isMounted) {
            const mapped: Instructor = {
              id: matchedDb.id,
              name: matchedDb.display_name,
              verified: true,
              skill: matchedDb.skill,
              category: 'fitness',
              mode: matchedDb.teaching_modes?.some((m: string) => /online|stream/i.test(m)) ? 'online' : 'in-person',
              area: matchedDb.locality || matchedDb.city || 'Delhi',
              city: matchedDb.city || 'Delhi',
              rating: 5.0,
              reviews: 12,
              price: matchedDb.price_per_hour || 1200,
              tag: `VERIFIED INSTRUCTOR`,
              image: matchedDb.image_urls?.[0] || '/placeholder.jpg',
              images: matchedDb.image_urls || ['/placeholder.jpg'],
              headline: `Certified ${matchedDb.skill} Specialist`,
              description: matchedDb.bio || `Verified coach available for bookings on Mastrive.`,
              experienceYears: parseInt(matchedDb.experience_years) || 5,
              languages: matchedDb.languages_spoken || ['English', 'Hindi'],
              education: matchedDb.education || 'Professional Coach Certification',
              certifications: matchedDb.certifications
                ? [{ title: matchedDb.certifications, institute: 'Verified Institute', year: '2024' }]
                : [],
              modes: matchedDb.teaching_modes || ['1-on-1 Studio Sessions', 'Live HD Stream'],
              specialties: [matchedDb.skill, 'Form Correction', 'Customized Routine'],
              packages: [
                { title: 'Single 1-on-1 Trial Session', duration: '60 min', price: matchedDb.price_per_hour || 1200, badge: 'Popular' },
                { title: '5-Session Acceleration Pass', duration: '5 × 60 min', price: (matchedDb.price_per_hour || 1200) * 4.5, badge: '10% Off' }
              ]
            }
            setInstructor(mapped)
            setSelectedImage(mapped.image || '')
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('Database lookup notice:', err)
      }

      // 3. Fallback to primary featured instructor if slug is not matched
      if (isMounted) {
        setInstructor(instructors[0])
        setSelectedImage(instructors[0].image || '')
        setLoading(false)
      }
    }

    resolveInstructor()

    return () => {
      isMounted = false
    }
  }, [slug, rawSlug])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !instructor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080a0f] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-[#8b949e]">Loading Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0b0e14]/90 px-4 sm:px-8 backdrop-blur-xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b949e] transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          <span>Explore All Instructors</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161b22] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5 text-[#8b949e]" />}
            <span>{copied ? 'Link Copied' : 'Share Profile'}</span>
          </button>
          
          <button
            onClick={() => setIsBookingOpen(true)}
            className="rounded-xl bg-[#e01e37] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-[#c0182f]"
          >
            Book Session · ₹{instructor.price}
          </button>
        </div>
      </header>

      {/* Main Profile Layout */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Media & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Featured Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#12161f] shadow-2xl">
              <Image
                src={selectedImage || instructor.image || '/placeholder.jpg'}
                alt={instructor.name}
                fill
                priority
                className="size-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <ShieldCheck className="size-3.5" />
                  MASTRIVE Verified Professional
                </span>
                <h1 className="mt-2 text-2xl font-black text-white">{instructor.name}</h1>
                <p className="text-xs text-[#8b949e] flex items-center gap-2 mt-1">
                  <MapPin className="size-3.5 text-[#e01e37]" />
                  <span>{instructor.area}, {instructor.city}</span>
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {instructor.images && instructor.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {instructor.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border transition ${
                      selectedImage === img ? 'border-[#e01e37] ring-2 ring-[#e01e37]/40' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Angle ${i + 1}`} fill className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Metrics Card */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-[#12161f]/80 p-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Rating</span>
                <p className="mt-1 flex items-center justify-center gap-1 text-base font-black text-white">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{instructor.rating || 4.9}</span>
                </p>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Experience</span>
                <p className="mt-1 text-base font-black text-white">
                  {instructor.experienceYears || 6}+ Yrs
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Students</span>
                <p className="mt-1 text-base font-black text-white">
                  {instructor.totalStudents || 280}+
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Bio, Curriculum, Packages & Reviews */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#e01e37]">
                {instructor.category.toUpperCase()} COACHING
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
                {instructor.headline || `${instructor.skill} Specialist`}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">
                {instructor.description}
              </p>
            </div>

            {/* Teaching Modes & Language */}
            <div className="flex flex-wrap gap-2">
              {instructor.modes?.map((mode, i) => (
                <span key={i} className="rounded-xl border border-white/10 bg-[#12161f] px-3 py-1.5 text-xs font-semibold text-gray-300">
                  ✓ {mode}
                </span>
              ))}
              {instructor.languages?.map((lang, i) => (
                <span key={`lang-${i}`} className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#12161f] px-3 py-1.5 text-xs font-semibold text-[#8b949e]">
                  <Languages className="size-3 text-[#e01e37]" /> {lang}
                </span>
              ))}
            </div>

            {/* Available Packages Card List */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Available Training Packages</h3>
              <div className="space-y-3">
                {(instructor.packages || [
                  { title: '1-on-1 Trial Session', duration: '60 min', price: instructor.price, badge: 'Popular' },
                  { title: '5-Session Pass', duration: '5 × 60 min', price: instructor.price * 4.5, badge: '10% Off' }
                ]).map((pkg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#12161f]/80 p-4 transition hover:border-[#e01e37]/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{pkg.title}</p>
                        {pkg.badge && (
                          <span className="rounded-full bg-[#e01e37]/15 px-2 py-0.5 text-[9px] font-bold text-[#e01e37] border border-[#e01e37]/30">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8b949e] mt-0.5">{pkg.duration}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-white">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => setIsBookingOpen(true)}
                        className="rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#c0182f] active:scale-95 transition"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Curriculum */}
            {instructor.curriculum && instructor.curriculum.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-white mb-3">Learning Roadmap & Structure</h3>
                <div className="space-y-3">
                  {instructor.curriculum.map((phase, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#0b0e14] p-4">
                      <h4 className="text-xs font-bold text-[#e01e37] uppercase tracking-wider">{phase.title}</h4>
                      <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Education */}
            <div className="rounded-2xl border border-white/10 bg-[#12161f]/80 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Education & Credentials</h3>
              {instructor.education && (
                <div className="flex items-start gap-2.5 text-xs text-gray-300">
                  <GraduationCap className="size-4 text-[#e01e37] shrink-0 mt-0.5" />
                  <span>{instructor.education}</span>
                </div>
              )}
              {instructor.certifications?.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                  <Award className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>{cert.title}</strong> — {cert.institute} {cert.year ? `(${cert.year})` : ''}</span>
                </div>
              ))}
            </div>

            {/* Student Reviews */}
            {instructor.studentReviews && instructor.studentReviews.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-white mb-3">Student Reviews</h3>
                <div className="space-y-3">
                  {instructor.studentReviews.map((rev, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#12161f]/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{rev.name}</span>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, starIdx) => (
                            <Star key={starIdx} className="size-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                      <span className="mt-2 block text-[10px] text-[#6e7681]">{rev.date} · {rev.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          instructor={{
            name: instructor.name,
            skill: instructor.skill,
            price: instructor.price
          }}
        />
      )}

    </div>
  )
}

