'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  Award,
  GraduationCap,
  Languages,
  Share2,
  Check,
} from 'lucide-react'
import type { Instructor } from '@/lib/data'
import { BookingModal } from '@/components/mastrive/booking-modal'

export interface ProfileSlot {
  id: string
  day: string
  time: string
  title: string
  type: string
  status: string
}

export interface ProfilePackage {
  id?: string
  title: string
  duration: string
  price: number
  badge?: string
}

export type InstructorProfileData = Instructor & {
  slots?: ProfileSlot[]
  packages?: ProfilePackage[]
}

export function InstructorProfileView({ instructor }: { instructor: InstructorProfileData }) {
  const [selectedImage, setSelectedImage] = useState<string>(
    instructor.image || instructor.images?.[0] || '/placeholder.jpg'
  )
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingPrice, setBookingPrice] = useState(instructor.price)
  const [bookingSessionTitle, setBookingSessionTitle] = useState(instructor.skill)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBookPackage = (pkg: ProfilePackage) => {
    setBookingPrice(pkg.price)
    setBookingSessionTitle(`${instructor.skill} — ${pkg.title}`)
    setIsBookingOpen(true)
  }

  const handleBookSlot = (slot: ProfileSlot) => {
    setBookingPrice(instructor.price)
    setBookingSessionTitle(`${instructor.skill} (${slot.day} ${slot.time})`)
    setIsBookingOpen(true)
  }

  const handleBookDefault = () => {
    setBookingPrice(instructor.price)
    setBookingSessionTitle(instructor.skill)
    setIsBookingOpen(true)
  }

  const packagesList: ProfilePackage[] =
    instructor.packages && instructor.packages.length > 0
      ? instructor.packages
      : [
          { title: '1-on-1 Trial Session', duration: '60 min', price: instructor.price, badge: 'Popular' },
          {
            title: '5-Session Pass',
            duration: '5 × 60 min',
            price: Math.round(instructor.price * 4.5),
            badge: '10% Off',
          },
        ]

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white">
      {/* Top Navigation Header */}
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
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#161b22] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5 text-[#8b949e]" />}
            <span>{copied ? 'Link Copied' : 'Share Profile'}</span>
          </button>

          <button
            onClick={handleBookDefault}
            className="rounded-xl bg-[#e01e37] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-[#c0182f] active:scale-95"
          >
            Book Session · ₹{instructor.price.toLocaleString('en-IN')}
          </button>
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Media & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Featured Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#12161f] shadow-2xl">
              <Image
                src={selectedImage}
                alt={instructor.name}
                fill
                priority
                className="size-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <ShieldCheck className="size-3.5" />
                  MASTRIVE Verified Professional
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">{instructor.name}</h1>
                <p className="text-xs text-[#8b949e] flex items-center gap-2 mt-1">
                  <MapPin className="size-3.5 text-[#e01e37]" />
                  <span>
                    {instructor.area}, {instructor.city}
                  </span>
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
                      selectedImage === img
                        ? 'border-[#e01e37] ring-2 ring-[#e01e37]/40'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${instructor.name} photo ${i + 1}`}
                      fill
                      className="size-full object-cover"
                    />
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
                  <span>{instructor.rating ? instructor.rating.toFixed(1) : '4.9'}</span>
                </p>
                <span className="text-[10px] text-[#6e7681]">({instructor.reviews || 12} reviews)</span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Experience</span>
                <p className="mt-1 text-base font-black text-white">
                  {instructor.experienceYears || 5}+ Yrs
                </p>
                <span className="text-[10px] text-[#6e7681]">Field Track</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">Learners</span>
                <p className="mt-1 text-base font-black text-white">
                  {instructor.totalStudents || 250}+
                </p>
                <span className="text-[10px] text-[#6e7681]">Trained</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Services, Curriculum & Reviews */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#e01e37]">
                {instructor.category?.toUpperCase()} COACHING
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
                {instructor.headline || `${instructor.skill} Specialist`}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">
                {instructor.description}
              </p>
            </div>

            {/* Teaching Modes & Languages */}
            <div className="flex flex-wrap gap-2">
              {instructor.modes?.map((mode, i) => (
                <span
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#12161f] px-3 py-1.5 text-xs font-semibold text-gray-300"
                >
                  ✓ {mode}
                </span>
              ))}
              {instructor.languages?.map((lang, i) => (
                <span
                  key={`lang-${i}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#12161f] px-3 py-1.5 text-xs font-semibold text-[#8b949e]"
                >
                  <Languages className="size-3 text-[#e01e37]" /> {lang}
                </span>
              ))}
            </div>

            {/* Available Training Packages / Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Available Training Packages</h3>
                <span className="text-xs text-[#8b949e]">Transparent pricing · No subscriptions</span>
              </div>
              <div className="space-y-3">
                {packagesList.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
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
                        onClick={() => handleBookPackage(pkg)}
                        className="rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#c0182f] active:scale-95 transition"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Calendar Slots (if configured) */}
            {instructor.slots && instructor.slots.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="size-4 text-[#e01e37]" />
                    <span>Weekly Available Slots</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold">
                    {instructor.slots.length} open slot{instructor.slots.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {instructor.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#12161f]/60 p-3.5 hover:border-[#e01e37]/40 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <Clock className="size-3.5 text-[#e01e37]" />
                          <span>
                            {slot.day}, {slot.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8b949e] mt-1">
                          {slot.title} · {slot.type}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot)}
                        className="rounded-lg border border-white/10 bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e01e37] hover:border-[#e01e37] transition"
                      >
                        Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <span>
                    <strong>{cert.title}</strong> — {cert.institute} {cert.year ? `(${cert.year})` : ''}
                  </span>
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
                      <span className="mt-2 block text-[10px] text-[#6e7681]">
                        {rev.date} · {rev.tag}
                      </span>
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
            id: instructor.id,
            name: instructor.name,
            skill: bookingSessionTitle,
            price: bookingPrice,
          }}
        />
      )}
    </div>
  )
}
