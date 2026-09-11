'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  BadgeCheck,
  Star,
  MapPin,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  Share2,
  Check,
  GraduationCap,
  Languages,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  MessageCircle,
  Video
} from 'lucide-react'
import type { Instructor } from '@/lib/data'

interface InstructorProfileModalProps {
  instructor: Instructor | null
  isOpen: boolean
  onClose: () => void
  onBook: (id: string) => void
}

type ProfileTab = 'about' | 'curriculum' | 'reviews' | 'pricing'

export function InstructorProfileModal({
  instructor,
  isOpen,
  onClose,
  onBook,
}: InstructorProfileModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('about')
  const [copied, setCopied] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  useEffect(() => {
    setActiveImageIdx(0)
    setActiveTab('about')
  }, [instructor?.id])

  const galleryImages =
    instructor?.images && instructor.images.length > 0
      ? instructor.images
      : instructor?.image
        ? [instructor.image]
        : []

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !instructor || !isOpen) return null

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/instructor/${encodeURIComponent(instructor.id || instructor.name)}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = `Check out ${instructor.name} (${instructor.skill} Coach) on MASTRIVE: ${window.location.origin}/instructor/${encodeURIComponent(instructor.id || instructor.name)}`
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  const isOnlineOnly = instructor.mode === 'online'

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-5 backdrop-blur-2xl">
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Container: Luxury Dark Frosted Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="gloss-card relative z-10 my-auto w-full max-w-2xl rounded-3xl border border-white/[0.09] bg-[#0c1017]/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden transform-gpu"
        >
          {/* Subtle Top Glow Accent */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-[#e01e37]/15 blur-3xl" />

          {/* ══════════════════════════════════════════════
              HEADER BAR (Crisp Editorial Branding)
             ══════════════════════════════════════════════ */}
          <div className="relative z-20 flex items-center justify-between border-b border-white/[0.08] bg-[#0c1017]/90 px-5 sm:px-6 py-3.5 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                    {instructor.name}
                  </h2>
                  {instructor.verified && (
                    <span title="Verified Professional Coach">
                      <BadgeCheck className="size-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#8b949e]">
                  <span className="inline-flex items-center rounded-full bg-[#e01e37]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#ff4d6d] border border-[#e01e37]/25">
                    {instructor.skill}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="capitalize">{instructor.category}</span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1 text-[#c9d1d9]">
                    <MapPin className="size-3 text-[#e01e37]" />
                    {instructor.area}, {instructor.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShareWhatsApp}
                title="Share on WhatsApp"
                className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#8b949e] transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <MessageCircle className="size-3.5" />
              </button>

              <button
                onClick={handleCopyLink}
                title="Copy Profile Link"
                className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#8b949e] transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
              </button>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#8b949e] transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              SCROLLABLE BODY CONTENT
             ══════════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5 custom-scrollbar">
            
            {/* 1. CINEMATIC MEDIA GALLERY */}
            {galleryImages.length > 0 && (
              <div className="space-y-2.5">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090c12] shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
                  <Image
                    src={galleryImages[activeImageIdx]}
                    alt={`${instructor.name} featured media ${activeImageIdx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 680px"
                    priority
                    className="object-cover object-[50%_35%] transition-opacity duration-300"
                  />

                  {/* Gradient vignettes for depth */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c1017]/90 via-transparent to-black/20" />

                  {/* Floating Top Badge */}
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
                      {isOnlineOnly ? (
                        <>
                          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                          <Video className="size-3 text-[#ff4d6d]" />
                          <span>Live 1-on-1 Stream</span>
                        </>
                      ) : (
                        <>
                          <span className="size-2 rounded-full bg-[#e01e37]" />
                          <MapPin className="size-3 text-[#ff4d6d]" />
                          <span>In-Person Studio & Gym</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Image Counter & Escrow Trust Seal */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="size-3 text-emerald-400" />
                      MASTRIVE Verified
                    </span>

                    {galleryImages.length > 1 && (
                      <div className="rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/10">
                        {activeImageIdx + 1} / {galleryImages.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnails Strip */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {galleryImages.map((img, idx) => {
                      const isActive = idx === activeImageIdx
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-xl border transition-all ${
                            isActive
                              ? 'ring-2 ring-[#e01e37] ring-offset-2 ring-offset-[#0c1017] border-transparent scale-[0.98] shadow-[0_0_16px_rgba(224,30,55,0.4)]'
                              : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                          }`}
                          aria-label={`View photo ${idx + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`${instructor.name} angle ${idx + 1}`}
                            fill
                            sizes="72px"
                            className="object-cover object-[50%_32%]"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. HEADLINE & VERIFIED STATS TILES (NO duplicate avatar!) */}
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#f0f6fc] leading-snug">
                  {instructor.headline || `${instructor.skill} Coach · Certified Training Specialist`}
                </p>
              </div>

              {/* 4 Sleek Glass Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Rating */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Star className="size-3.5 fill-current" />
                    <span className="text-sm font-extrabold text-white">{instructor.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#8b949e]">
                    {instructor.reviews} Reviews
                  </p>
                </div>

                {/* Experience */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className="flex items-center justify-center gap-1 text-indigo-400">
                    <Award className="size-3.5" />
                    <span className="text-sm font-extrabold text-white">{instructor.experienceYears || 5}+ Yrs</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#8b949e]">
                    Experience
                  </p>
                </div>

                {/* Students */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className="flex items-center justify-center gap-1 text-purple-400">
                    <Users className="size-3.5" />
                    <span className="text-sm font-extrabold text-white">{instructor.totalStudents || 200}+</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#8b949e]">
                    Trained
                  </p>
                </div>

                {/* Total Hours */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-center backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className="flex items-center justify-center gap-1 text-blue-400">
                    <Clock className="size-3.5" />
                    <span className="text-sm font-extrabold text-white">{instructor.totalHours || 1500}+</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#8b949e]">
                    Coached Hrs
                  </p>
                </div>
              </div>
            </div>

            {/* 3. REFINED PILL TABS */}
            <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/[0.08] bg-black/40 p-1 backdrop-blur-md">
              {[
                { id: 'about', label: 'Overview' },
                { id: 'curriculum', label: 'Curriculum' },
                { id: 'reviews', label: `Reviews (${instructor.reviews})` },
                { id: 'pricing', label: 'Packages' },
              ].map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={`rounded-xl py-2 text-[11px] font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.06] text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] border border-white/[0.12]'
                        : 'text-[#8b949e] hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* 4. TAB CONTENT */}

            {/* ── TAB 1: OVERVIEW & BIO ── */}
            {activeTab === 'about' && (
              <div className="space-y-3.5">
                {/* Editorial Bio */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8b949e]">
                    Coaching Philosophy & Background
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#c9d1d9]">
                    {instructor.description}
                  </p>
                </div>

                {/* Training Delivery Formats */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8b949e]">
                    Session Delivery Formats
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(instructor.modes || [
                      'In-Person Studio & Gym Sessions',
                      'Interactive 1-on-1 Live Stream',
                      'Private Venue / Home on Request',
                    ]).map((mode, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5 text-white"
                      >
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-medium">{mode}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialties Chips */}
                {instructor.specialties && instructor.specialties.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#8b949e]">
                      Specialties & Focus Areas
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#f0f6fc] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credentials & Education */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                      <Languages className="size-3.5 text-[#e01e37]" /> Spoken Languages
                    </span>
                    <p className="text-xs font-semibold text-white mt-1.5">
                      {(instructor.languages || ['English', 'Hindi']).join(' · ')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-[#e01e37]" /> Verified Education
                    </span>
                    <p className="text-xs font-semibold text-white mt-1.5 truncate">
                      {instructor.education || 'Certified Training Institute'}
                    </p>
                  </div>
                </div>

                {/* Certifications List */}
                {instructor.certifications && instructor.certifications.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                      <Award className="size-3.5 text-[#e01e37]" /> Verified Accreditations
                    </span>
                    <div className="space-y-2">
                      {instructor.certifications.map((cert, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5"
                        >
                          <div>
                            <p className="font-semibold text-white">{cert.title}</p>
                            <p className="text-[10px] text-[#8b949e]">{cert.institute}</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#e01e37] shrink-0 ml-2">
                            {cert.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: CURRICULUM ROADMAP ── */}
            {activeTab === 'curriculum' && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                    <BookOpen className="size-4 text-[#e01e37]" /> Structured Training Roadmap
                  </h4>
                  <span className="text-[11px] text-[#8b949e]">Personalized to your goals</span>
                </div>

                <div className="space-y-3">
                  {(instructor.curriculum || [
                    { title: 'Movement Screening & Stance Alignment', desc: 'Comprehensive mobility check, joint posture assessment, and foundational movement patterns.' },
                    { title: 'Technical Precision & Controlled Resistance', desc: 'Repetitive biomechanics calibration, speed control, and compound exercises.' },
                    { title: 'Advanced Performance & Autonomous Execution', desc: 'Peak conditioning under simulated intensity, progress milestones, and maintenance protocol.' },
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-white/15 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#e01e37]/20 border border-[#e01e37]/30 text-[10px] font-extrabold text-[#ff4d6d]">
                          0{idx + 1}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-white">{item.title}</h5>
                          <p className="text-xs leading-relaxed text-[#8b949e]">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: VERIFIED REVIEWS ── */}
            {activeTab === 'reviews' && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                      Learner Testimonials
                    </h4>
                    <p className="text-[11px] text-[#8b949e] mt-0.5">
                      100% verified bookings via Mastrive Escrow
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-amber-400 flex items-center justify-end gap-1">
                      <Star className="size-4 fill-current" /> {instructor.rating.toFixed(1)} / 5.0
                    </span>
                    <span className="text-[10px] text-[#8b949e]">({instructor.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(instructor.studentReviews || [
                    { name: 'Aarav Sharma', rating: 5, comment: 'Phenomenal instruction. Spotted my posture flaws within the first 15 minutes.', date: '2 weeks ago', tag: 'Strength Training' },
                    { name: 'Tanya Mehra', rating: 5, comment: 'High energy, great communication, and very accommodating with timings.', date: '1 month ago', tag: 'Body Transformation' },
                    { name: 'Karan Joshi', rating: 4.8, comment: 'Super technical coach. Helped me break plateaus safely.', date: '2 months ago', tag: 'Powerlifting' },
                  ]).map((rev, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white">{rev.name}</span>
                            <span className="ml-2 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Verified
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8b949e]">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`size-3 ${
                              starIdx < Math.floor(rev.rating) ? 'fill-current' : 'opacity-40'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs leading-relaxed text-[#c9d1d9] italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: PACKAGES & PRICING ── */}
            {activeTab === 'pricing' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                        Flexible Training Packages
                      </h4>
                      <p className="text-[11px] text-[#8b949e] mt-0.5">
                        Guaranteed with 100% platform escrow protection
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="size-3" /> Zero Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(instructor.packages || [
                      { title: 'Single 1-on-1 Trial Session', duration: '60 min', price: instructor.price, badge: 'Popular' },
                      { title: '5-Session Acceleration Pass', duration: '5 × 60 min', price: instructor.price * 4.5, badge: '10% Off' },
                      { title: '10-Session Mastery Bootcamp', duration: '10 × 60 min', price: instructor.price * 8.5, badge: 'Best Value' },
                    ]).map((pkg, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 transition hover:border-[#e01e37]/40 hover:bg-white/[0.04]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-bold text-white">{pkg.title}</h5>
                            {pkg.badge && (
                              <span className="rounded-full bg-[#e01e37]/15 border border-[#e01e37]/30 px-2 py-0.5 text-[9px] font-bold text-[#ff4d6d]">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8b949e]">{pkg.duration} · Dedicated 1-on-1 time</p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="text-sm sm:text-base font-extrabold text-white">
                              ₹{pkg.price.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[10px] text-emerald-400 font-medium">Escrow Secured</p>
                          </div>
                          <button
                            onClick={() => {
                              onClose()
                              onBook(instructor.id)
                            }}
                            className="rounded-full bg-white/[0.08] hover:bg-[#e01e37] px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ══════════════════════════════════════════════
              STICKY BOTTOM ACTION BAR (SINGLE COMMANDING CTA)
             ══════════════════════════════════════════════ */}
          <div className="relative z-20 flex items-center justify-between border-t border-white/[0.08] bg-[#0c1017]/95 px-5 sm:px-6 py-3.5 backdrop-blur-xl shrink-0">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ₹{instructor.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#8b949e]">/ 60 min session</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
                <span>100% Escrow Protected · Instant Refund Guarantee</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose()
                onBook(instructor.id)
              }}
              className="gloss-btn-primary flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_24px_rgba(224,30,55,0.45)] hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <span>Book Session</span>
              <ChevronRight className="size-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
