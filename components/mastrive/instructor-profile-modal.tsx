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
      const url = `${window.location.origin}/#${instructor.id}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = `Check out ${instructor.name}, ${instructor.skill} instructor on MASTRIVE: ${window.location.href}`
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
        {/* Backdrop Click Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Card - Exactly matching dimensions, background, and radius of Book Session UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12161f] p-5 shadow-2xl backdrop-blur-xl sm:p-7 transform-gpu max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  {instructor.name}
                </h2>
                {instructor.verified && (
                  <BadgeCheck className="size-4 text-[#3fb950]" aria-label="Verified" />
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8b949e]">
                <span className="text-[#e01e37] font-semibold">{instructor.skill}</span>
                <span>•</span>
                <span className="capitalize">{instructor.category}</span>
                <span>•</span>
                <span>{instructor.area}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close details"
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#161b22] text-[#8b949e] transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            
            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <div className="space-y-2">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
                  <Image
                    src={galleryImages[activeImageIdx]}
                    alt={`${instructor.name} photo ${activeImageIdx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    priority
                    className="object-cover object-[50%_35%] transition-opacity duration-300"
                  />
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {activeImageIdx + 1} / {galleryImages.length}
                    </div>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((img, idx) => {
                      const isActive = idx === activeImageIdx
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative aspect-square shrink-0 overflow-hidden rounded-lg border transition-all ${
                            isActive
                              ? 'border-[#e01e37] ring-2 ring-[#e01e37]/40 scale-[0.97]'
                              : 'border-white/10 hover:border-white/30 opacity-80 hover:opacity-100'
                          }`}
                          style={{ width: '64px', height: '64px' }}
                          aria-label={`View photo ${idx + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`${instructor.name} thumbnail ${idx + 1}`}
                            fill
                            sizes="64px"
                            className="object-cover object-[50%_32%]"
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Top Instructor Overview Card */}
            <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                
                {/* Avatar */}
                <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#161b22]">
                  {instructor.image ? (
                    <Image
                      src={instructor.image}
                      alt={instructor.name}
                      fill
                      className="object-cover object-[50%_15%]"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-3xl">
                      🥊
                    </div>
                  )}
                </div>

                {/* Quick Info & Metrics */}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-semibold text-[#f0f6fc] leading-snug">
                    {instructor.headline || `${instructor.skill} Specialist · Certified Trainer`}
                  </p>

                  {/* Badges Grid */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#8b949e]">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {instructor.rating.toFixed(1)}
                      <span className="font-normal text-[#8b949e]">({instructor.reviews})</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Award className="size-3 text-indigo-400" />
                      <strong className="text-white">{instructor.experienceYears || 5}+ yrs</strong> Exp
                    </span>

                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-purple-400" />
                      <strong className="text-white">{instructor.totalStudents || 200}+</strong> Students
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-blue-400" />
                      <strong className="text-white">{instructor.totalHours || 1500}+</strong> hrs
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
                    <MapPin className="size-3 text-[#e01e37]" />
                    <span>{instructor.area}, {instructor.city}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">
                      {instructor.mode === 'in-person' ? 'In-Person & Studio' : 'Live Online Stream'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Price & Action Strip */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-lg font-black text-white">₹{instructor.price.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#8b949e]"> / hr</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    title="Share on WhatsApp"
                    className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-emerald-400 transition"
                  >
                    <MessageCircle className="size-3.5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    title="Copy Profile Link"
                    className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-white transition"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      onClose()
                      onBook(instructor.id)
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-[#e01e37] px-4 py-1.5 text-xs font-bold text-white shadow-[0_2px_10px_rgba(224,30,55,0.35)] hover:bg-[#c0182f] transition active:scale-95"
                  >
                    <span>Book Session</span>
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-[#0d1117] p-1">
              {[
                { id: 'about', label: 'Profile' },
                { id: 'curriculum', label: 'Classes' },
                { id: 'reviews', label: `Reviews (${instructor.reviews})` },
                { id: 'pricing', label: 'Packages' },
              ].map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={`rounded-lg py-1.5 text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-[#e01e37] text-white shadow-sm'
                        : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* TAB 1: PROFILE / BIO */}
            {activeTab === 'about' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                    About the Instructor
                  </h3>
                  <p className="text-xs leading-relaxed text-[#c9d1d9]">
                    {instructor.description}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                    Training Delivery Formats
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(instructor.modes || [
                      'In-Person at Studio / Academy',
                      'Live 1-on-1 Interactive Stream',
                      'Home Visit on Request',
                    ]).map((mode, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-[#161b22] px-3 py-2 text-white">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px]">{mode}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {instructor.specialties && (
                  <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                      Specialties & Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialties.map((spec, i) => (
                        <span key={i} className="rounded-md border border-white/10 bg-[#161b22] px-2.5 py-1 text-[11px] text-[#f0f6fc]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CLASSES & CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-[#e01e37]" /> What You'll Learn
                </h3>
                <div className="space-y-2">
                  {(instructor.curriculum || [
                    { title: 'Foundations & Stance Balance', desc: 'Understanding core alignment, basic rhythm, and correct body positioning.' },
                    { title: 'Technical Mastery & Drills', desc: 'Repetitive muscle memory exercises, precision execution, and reaction timing.' },
                    { title: 'Advanced Flow & Performance', desc: 'Applying techniques under high pace or simulated competitive scenarios.' },
                  ]).map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-[#161b22] p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex size-4 items-center justify-center rounded-full bg-[#e01e37]/20 text-[9px] font-bold text-[#e01e37]">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-xs text-white">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#8b949e] pl-6">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: VERIFIED REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                    Student Ratings & Feedback
                  </h3>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Star className="size-3 fill-current" /> {instructor.rating.toFixed(1)} / 5.0
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(instructor.studentReviews || [
                    { name: 'Aarav S.', rating: 5, comment: 'Phenomenal instruction. Spotted my posture flaws within the first 15 minutes.', date: '2 weeks ago', tag: 'Verified Booking' },
                    { name: 'Priya M.', rating: 5, comment: 'High energy, great communication, and very accommodating with timings.', date: '1 month ago', tag: 'Verified Booking' },
                  ]).map((rev, i) => (
                    <div key={i} className="rounded-lg bg-[#161b22] p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{rev.name}</span>
                        <span className="text-[10px] text-[#8b949e]">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star key={starIdx} className="size-2.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-[11px] text-[#c9d1d9] italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CREDENTIALS & PACKAGES */}
            {activeTab === 'pricing' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-[#0d1117] p-3">
                    <span className="text-[10px] font-bold uppercase text-[#8b949e] flex items-center gap-1">
                      <Languages className="size-3 text-[#e01e37]" /> Languages
                    </span>
                    <p className="text-xs font-semibold text-white mt-1">
                      {(instructor.languages || ['English', 'Hindi']).join(' · ')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0d1117] p-3">
                    <span className="text-[10px] font-bold uppercase text-[#8b949e] flex items-center gap-1">
                      <GraduationCap className="size-3 text-[#e01e37]" /> Education
                    </span>
                    <p className="text-xs font-semibold text-white mt-1 truncate">
                      {instructor.education || 'Certified Combat Academy'}
                    </p>
                  </div>
                </div>

                {instructor.certifications && (
                  <div className="rounded-xl border border-white/10 bg-[#0d1117] p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#8b949e] flex items-center gap-1">
                      <Award className="size-3 text-[#e01e37]" /> Certifications
                    </span>
                    <div className="space-y-1.5">
                      {instructor.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-[#161b22] px-3 py-2 rounded-lg">
                          <span className="font-semibold text-white">{cert.title}</span>
                          <span className="text-[#8b949e]">{cert.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 bg-[#0d1117] p-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#8b949e] flex items-center gap-1">
                    <Layers className="size-3 text-[#e01e37]" /> Discounted Bundle Passes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(instructor.packages || [
                      { title: 'Single Session', duration: '60 min', price: instructor.price, badge: 'Standard' },
                      { title: '5-Session Pass', duration: '5 × 60 min', price: instructor.price * 4.5, badge: '10% Off' },
                    ]).map((pkg, i) => (
                      <div key={i} className="rounded-lg bg-[#161b22] p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{pkg.title}</p>
                          <p className="text-[10px] text-[#8b949e]">{pkg.duration}</p>
                        </div>
                        <span className="text-xs font-extrabold text-[#e01e37]">₹{pkg.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Bottom Footer */}
          <div className="border-t border-white/10 pt-3 flex items-center justify-between bg-[#12161f]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
              <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>100% Escrow Protection</span>
            </div>

            <button
              onClick={() => {
                onClose()
                onBook(instructor.id)
              }}
              className="rounded-full bg-[#e01e37] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#c0182f] transition active:scale-95"
            >
              Book Session (₹{instructor.price})
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
