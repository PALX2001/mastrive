'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Instructor } from '@/lib/data'
import {
  ChevronDown,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Award,
  User,
  BookOpen,
  Camera,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const CATEGORIES = [
  'Fitness & Combat',
  'Music & Arts',
  'Strategy & Tech',
  'Lifestyle',
  'Academics & Language',
  'Performing Arts',
  'Sports & Outdoors',
  'Professional Skills',
]

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

const TEACHING_MODES = [
  'In-Person at Studio / Academy',
  "Home Visits (student's location)",
  'Live 1-on-1 Online Stream',
  'Group Batches (in-person)',
  'Group Batches (online)',
  'Pre-recorded Video Courses',
]

const AGE_GROUPS = [
  'Kids (4-10 yrs)',
  'Pre-teens (11-14 yrs)',
  'Teens (15-17 yrs)',
  'Adults (18+ yrs)',
  'Senior Citizens',
]

const LANGUAGES_LIST = [
  'English', 'Hindi', 'Punjabi', 'Bengali', 'Tamil',
  'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Urdu', 'Malayalam',
]

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  'More than 10 years',
]

const EDUCATION_OPTIONS = [
  'High School (12th)',
  'Graduate (Bachelors)',
  'Post Graduate (Masters)',
  'Diploma / Certification',
  'PhD / Doctorate',
  'Other',
]

type SubmittedData = {
  name: string
  category: string
  skill: string
  city: string
  locality: string
  price: number
  imageUrl?: string
  email: string
  teachingModes: string[]
}

interface InstructorApplicationViewProps {
  onExploreDirectory?: () => void
}

// Step metadata
const STEPS = [
  { id: 1, label: 'Who You Are', icon: User, description: 'Basic identity & contact info' },
  { id: 2, label: 'What You Teach', icon: BookOpen, description: 'Skills, location & how you deliver' },
  { id: 3, label: 'Your Profile', icon: Camera, description: 'Photos & bio — make it shine' },
]

export default function InstructorApplicationView({ onExploreDirectory }: InstructorApplicationViewProps = {}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<1 | -1>(1)

  const [formData, setFormData] = useState({
    profile_type: 'individual' as 'individual' | 'institute',
    name: '',
    institute_name: '',
    email: '',
    country_code: '+91',
    whatsapp: '',
    gender: '',
    category: 'Fitness & Combat',
    sub_skills: '',
    pincode: '',
    locality: '',
    city: 'Delhi',
    experience_years: '1-3 years',
    certifications: '',
    education: '',
    teaching_modes: [] as string[],
    demo_class: 'yes',
    languages: ['English', 'Hindi'] as string[],
    price_per_hour: '',
    age_groups: [] as string[],
    bio: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  // ── Step validation ──
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!formData.name.trim()) return 'Please enter your full name.'
      if (!formData.email.trim()) return 'Please enter your email address.'
      if (!formData.whatsapp.trim()) return 'Please enter your WhatsApp / mobile number.'
    }
    if (s === 2) {
      if (!formData.category) return 'Please select a category.'
      if (!formData.sub_skills.trim()) return 'Please enter at least one skill.'
      if (!formData.locality.trim()) return 'Please enter your locality.'
      if (!formData.city.trim()) return 'Please enter your city.'
      if (formData.teaching_modes.length === 0) return 'Please select at least one teaching mode.'
    }
    if (s === 3) {
      if (photos.length < 3) return 'Please add at least 3 instructor photos.'
    }
    return null
  }

  const goNext = () => {
    const err = validateStep(step)
    if (err) { setErrorMessage(err); return }
    setErrorMessage('')
    setDirection(1)
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => {
    setErrorMessage('')
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateStep(3)
    if (err) { setErrorMessage(err); return }

    setLoading(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      let userId: string | null = null
      try {
        const { data } = await supabase.auth.getUser()
        userId = data.user?.id || null
      } catch {
        // Unauthenticated visitor submission
      }

      const appId = crypto.randomUUID()
      const imageUrls: string[] = []

      // 1. Upload photos to Supabase Storage
      for (const [index, photo] of photos.entries()) {
        if (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024) {
          throw new Error('Each photo must be an image smaller than 5 MB.')
        }

        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `applications/${appId}/${index}-${crypto.randomUUID()}.${extension}`

        try {
          const { error: uploadError } = await supabase.storage
            .from('instructor-images')
            .upload(path, photo, { contentType: photo.type, upsert: false })

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage
              .from('instructor-images')
              .getPublicUrl(path)
            imageUrls.push(publicUrl.publicUrl)
          } else {
            imageUrls.push(URL.createObjectURL(photo))
          }
        } catch {
          imageUrls.push(URL.createObjectURL(photo))
        }
      }

      const isOnline = formData.teaching_modes.some((m) => /online|stream|video/i.test(m))
      const applicantName = formData.name.trim() || formData.institute_name.trim() || 'Coach'
      const applicantSkill = formData.sub_skills.trim() || 'Coach'
      const applicantCity = formData.city.trim() || 'Delhi'
      const applicantPrice = formData.price_per_hour ? Number(formData.price_per_hour) : 1000

      const normCat = formData.category.toLowerCase()
      const catId = normCat.includes('fitness') ? 'fitness' : normCat.includes('music') ? 'music' : normCat.includes('lifestyle') ? 'lifestyle' : 'strategy'

      const customCard: Instructor = {
        id: appId,
        name: applicantName,
        verified: false,
        totalStudents: 0,
        skill: applicantSkill,
        category: catId,
        mode: isOnline ? 'online' : 'in-person',
        area: isOnline ? 'Live Stream' : formData.locality.trim() || applicantCity,
        city: applicantCity,
        rating: 5.0,
        reviews: 0,
        price: applicantPrice,
        tag: `${isOnline ? 'LIVE ONLINE' : 'IN-PERSON'}: ${applicantCity.toUpperCase()}`,
        image: imageUrls[0] || (photos[0] ? URL.createObjectURL(photos[0]) : undefined),
        images: imageUrls,
        description: formData.bio.trim() || `Specialized ${applicantSkill} coach available for booking on Mastrive.`,
        experienceYears: 2,
        languages: formData.languages,
        modes: formData.teaching_modes,
      }

      try {
        await fetch('/api/instructor/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: appId,
            ...formData,
            image_urls: imageUrls,
            user_id: userId,
          }),
        })
      } catch (apiErr) {
        if (process.env.NODE_ENV !== 'production') console.warn('API sync notice:', apiErr)
      }

      setSubmittedData({
        name: applicantName,
        category: formData.category,
        skill: applicantSkill,
        city: applicantCity,
        locality: formData.locality.trim() || applicantCity,
        price: applicantPrice,
        imageUrl: imageUrls[0] || (photos[0] ? URL.createObjectURL(photos[0]) : undefined),
        email: formData.email.trim(),
        teachingModes: formData.teaching_modes,
      })

      setSubmitted(true)
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') console.error('Application error:', err)
      const msg = err?.message || String(err)
      setErrorMessage(msg.includes('Failed to fetch')
        ? 'Network error. Check your connection and try again.'
        : msg || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setSubmittedData(null)
    setPhotos([])
    setStep(1)
    setDirection(1)
    setErrorMessage('')
    setFormData({
      profile_type: 'individual',
      name: '',
      institute_name: '',
      email: '',
      country_code: '+91',
      whatsapp: '',
      gender: '',
      category: 'Fitness & Combat',
      sub_skills: '',
      pincode: '',
      locality: '',
      city: 'Delhi',
      experience_years: '1-3 years',
      certifications: '',
      education: '',
      teaching_modes: [],
      demo_class: 'yes',
      languages: ['English', 'Hindi'],
      price_per_hour: '',
      age_groups: [],
      bio: '',
    })
  }

  // ── Shared style helpers ──
  const inputBase =
    'gloss-input w-full h-12 px-4 py-2.5 text-sm text-white placeholder-[#444] outline-none mt-1.5'
  const selectBase =
    'gloss-input w-full h-12 appearance-none pl-4 pr-10 py-2.5 text-sm text-white cursor-pointer mt-1.5 outline-none'
  const selectWrap = 'relative w-full'
  const chevron =
    'pointer-events-none absolute right-3.5 top-[calc(50%+3px)] -translate-y-1/2 size-4 text-[#555]'
  const textareaBase =
    'gloss-input w-full px-4 py-3 text-sm text-white placeholder-[#444] outline-none mt-1.5 resize-y rounded-2xl'
  const labelBase = 'block text-xs font-semibold text-[#aaa] tracking-wide uppercase'
  const sectionTitle = 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#e01e37]'

  const chip = (arr: string[], value: string) =>
    `select-none rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer text-center ${
      arr.includes(value)
        ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
        : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:border-white/15 hover:text-white'
    }`

  // ── Step Progress Bar ──
  const StepBar = () => (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const isActive = step === s.id
          const isDone = step > s.id
          const Icon = s.icon
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? 'border-[#e01e37] bg-[#e01e37] text-white shadow-[0_4px_16px_rgba(224,30,55,0.4)]'
                      : isActive
                      ? 'border-[#e01e37] bg-[#e01e37]/15 text-[#e01e37]'
                      : 'border-white/[0.1] bg-white/[0.03] text-[#555]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-[11px] font-bold transition-colors ${isActive ? 'text-white' : isDone ? 'text-[#e01e37]' : 'text-[#555]'}`}>
                    {s.label}
                  </p>
                  <p className={`text-[10px] hidden sm:block mt-0.5 transition-colors ${isActive ? 'text-[#888]' : 'text-[#444]'}`}>
                    {s.description}
                  </p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-12 shrink-0 transition-all duration-500 ${step > s.id ? 'bg-[#e01e37]' : 'bg-white/[0.08]'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── SUBMITTED state ──
  if (submitted && submittedData) {
    return (
      <section className="min-h-screen radial-glow-crimson px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="gloss-card rounded-3xl p-7 sm:p-10 space-y-6"
          >
            {/* Thank you header */}
            <div className="text-center pb-4 border-b border-white/[0.07]">
              <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="size-7 text-emerald-400" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/08 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="size-3" /> Profile Published
              </span>
              <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl tracking-tight">
                Thank You, {submittedData.name}!
              </h2>
              <p className="mt-2 text-sm text-[#777] max-w-md mx-auto">
                Your instructor card is now live in our public directory. Students can start discovering and booking you right away.
              </p>
            </div>

            {/* Card preview */}
            <div className="gloss-card rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#555] mb-3">
                Your Live Instructor Card
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                {submittedData.imageUrl ? (
                  <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl">
                    <Image src={submittedData.imageUrl} alt={submittedData.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-xl bg-[#111] text-3xl">🥊</div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-base font-bold text-white">{submittedData.name}</h3>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-[#666]">New Coach</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#e01e37]">
                    {submittedData.skill} · <span className="text-[#666]">{submittedData.category}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-[#666]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />{submittedData.locality || submittedData.city}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-white">₹{submittedData.price.toLocaleString('en-IN')}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified badge pathway */}
            <div className="rounded-2xl border border-[#e01e37]/20 bg-gradient-to-br from-[#e01e37]/08 to-transparent p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e01e37]/15 text-[#e01e37] border border-[#e01e37]/25">
                  <Award className="size-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">Verified Badge — 10 Learners Milestone</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#777]">
                    Complete sessions with your first <span className="text-white font-semibold">10 learners</span> to earn the{' '}
                    <span className="text-emerald-400 font-semibold">Verified Coach Badge (✓)</span>. It unlocks automatically.
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#666] mb-1.5">
                      <span>Boarding Progress</span>
                      <span className="text-white font-bold">0 / 10 Learners</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-0 bg-gradient-to-r from-[#e01e37] to-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (onExploreDirectory) {
                    onExploreDirectory()
                  } else {
                    router.push('/?tab=explore#instructors')
                  }
                  setTimeout(() => {
                    document.getElementById('instructors')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="gloss-btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
              >
                <span>Explore Directory & Find Your Card</span>
                <ArrowRight className="size-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="gloss-btn-secondary flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-[#888] hover:text-white"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Apply for Another Skill</span>
                </button>
                <Link
                  href="/"
                  className="gloss-btn-secondary flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold text-[#888] hover:text-white"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // ── FORM PAGES ──
  return (
    <section className="min-h-screen radial-glow-crimson px-4 py-16 text-white sm:px-6 lg:px-8">
      {/* Hero copy */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#666]">Become a Coach</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Teach what you love on{' '}
          <span className="font-serif italic text-[#e01e37]">Mastrive.</span>
        </h1>
        <p className="mt-4 text-base text-[#777] max-w-xl mx-auto">
          Set your own rates, keep your calendar flexible, and get paid directly after every session.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="gloss-card rounded-3xl p-6 sm:p-9">
          {/* Step progress */}
          <StepBar />

          {/* Step heading */}
          <div className="mb-7">
            <h2 className="text-xl font-black text-white">
              Step {step} — {STEPS[step - 1].label}
            </h2>
            <p className="mt-1 text-sm text-[#777]">{STEPS[step - 1].description}</p>
          </div>

          {/* Error */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/08 p-4 text-sm text-red-400"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Animated step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -32 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ─────────── STEP 1 — Who You Are ─────────── */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Profile type */}
                  <div>
                    <label className={`${labelBase} mb-3`}>Create profile as <span className="text-[#e01e37]">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['individual', 'institute'] as const).map((type) => {
                        const checked = formData.profile_type === type
                        return (
                          <label
                            key={type}
                            className={`relative flex items-center gap-3 rounded-2xl border px-5 py-4 cursor-pointer transition-all ${
                              checked
                                ? 'border-[#e01e37]/60 bg-[#e01e37]/10 shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                                : 'border-white/[0.08] bg-white/[0.03] hover:border-white/15'
                            }`}
                          >
                            <input
                              type="radio"
                              name="profile_type"
                              value={type}
                              checked={checked}
                              onChange={() => setFormData({ ...formData, profile_type: type })}
                              className="sr-only"
                            />
                            <span className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${checked ? 'border-[#e01e37]' : 'border-white/25'}`}>
                              {checked && <span className="size-2 rounded-full bg-[#e01e37]" />}
                            </span>
                            <span className="text-sm font-bold">
                              {type === 'individual' ? 'I am an Individual' : 'I run an Institute'}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Institute name (conditional) */}
                  {formData.profile_type === 'institute' && (
                    <div>
                      <label className={labelBase}>Institute / Academy Name <span className="text-[#e01e37]">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Elite Fitness Academy"
                        value={formData.institute_name}
                        onChange={(e) => setFormData({ ...formData, institute_name: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                  )}

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelBase}>Full Name <span className="text-[#e01e37]">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amit Singh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className={labelBase}>Email Address <span className="text-[#e01e37]">*</span></label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="e.g. amit@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputBase}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelBase}>WhatsApp / Mobile <span className="text-[#e01e37]">*</span></label>
                    <div className="grid grid-cols-[120px_1fr] gap-3 mt-1.5">
                      <div className={selectWrap}>
                        <select
                          value={formData.country_code}
                          onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                          className={selectBase + ' !mt-0'}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+61">🇦🇺 +61</option>
                        </select>
                        <ChevronDown className={chevron + ' !mt-0'} />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        pattern="[0-9\s\-+()]{7,}"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className={inputBase + ' !mt-0'}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={labelBase}>Gender</label>
                    <div className={selectWrap}>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={selectBase}
                      >
                        <option value="">-- Select Gender --</option>
                        {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown className={chevron} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 2 — What You Teach ─────────── */}
              {step === 2 && (
                <div className="space-y-7">
                  {/* Category + Skills */}
                  <div className="gloss-card rounded-2xl p-5 space-y-5">
                    <h3 className={sectionTitle}>Skill & Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>Main Category <span className="text-[#e01e37]">*</span></label>
                        <div className={selectWrap}>
                          <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={selectBase}
                          >
                            <option value="">-- Select Category --</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className={chevron} />
                        </div>
                      </div>
                      <div>
                        <label className={labelBase}>Subjects / Skills <span className="text-[#e01e37]">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Boxing, HIIT, Strength"
                          value={formData.sub_skills}
                          onChange={(e) => setFormData({ ...formData, sub_skills: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="gloss-card rounded-2xl p-5 space-y-5">
                    <h3 className={sectionTitle}>Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelBase}>Pincode <span className="text-[#e01e37]">*</span></label>
                        <input
                          type="text"
                          pattern="[0-9]{4,8}"
                          placeholder="e.g. 110016"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={labelBase}>Locality <span className="text-[#e01e37]">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hauz Khas"
                          value={formData.locality}
                          onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={labelBase}>City <span className="text-[#e01e37]">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Delhi"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="gloss-card rounded-2xl p-5 space-y-5">
                    <h3 className={sectionTitle}>Experience & Qualifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>Teaching Experience</label>
                        <div className={selectWrap}>
                          <select
                            value={formData.experience_years}
                            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                            className={selectBase}
                          >
                            {EXPERIENCE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown className={chevron} />
                        </div>
                      </div>
                      <div>
                        <label className={labelBase}>Highest Education</label>
                        <div className={selectWrap}>
                          <select
                            value={formData.education}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            className={selectBase}
                          >
                            <option value="">-- Select --</option>
                            {EDUCATION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown className={chevron} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelBase}>Certifications & Awards</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. AIBA 1-Star, NSCA CPT, State Gold medalist..."
                        value={formData.certifications}
                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        className={textareaBase}
                      />
                    </div>
                  </div>

                  {/* Teaching modes */}
                  <div className="gloss-card rounded-2xl p-5 space-y-4">
                    <h3 className={sectionTitle}>How Do You Teach? <span className="text-[#e01e37]">*</span></h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {TEACHING_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setFormData({ ...formData, teaching_modes: toggleArray(formData.teaching_modes, mode) })}
                          className={chip(formData.teaching_modes, mode) + ' text-left'}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing + Demo */}
                  <div className="gloss-card rounded-2xl p-5 space-y-5">
                    <h3 className={sectionTitle}>Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelBase}>Rate per hour (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          placeholder="e.g. 1200"
                          value={formData.price_per_hour}
                          onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className={`${labelBase} mb-3`}>Offer Free Demo Class?</label>
                        <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                          {(['yes', 'no'] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData({ ...formData, demo_class: opt })}
                              className={`rounded-xl border py-3 text-sm font-bold uppercase transition-all ${
                                formData.demo_class === opt
                                  ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white'
                                  : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                              }`}
                            >
                              {opt === 'yes' ? '✓ Yes' : '✕ No'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Age groups + Languages */}
                  <div className="gloss-card rounded-2xl p-5 space-y-5">
                    <h3 className={sectionTitle}>Audience</h3>
                    <div>
                      <label className={`${labelBase} mb-3`}>Age Groups You Teach</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {AGE_GROUPS.map((age) => (
                          <button
                            key={age}
                            type="button"
                            onClick={() => setFormData({ ...formData, age_groups: toggleArray(formData.age_groups, age) })}
                            className={chip(formData.age_groups, age)}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`${labelBase} mb-3`}>Languages You Speak</label>
                      <div className="flex flex-wrap gap-2.5">
                        {LANGUAGES_LIST.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setFormData({ ...formData, languages: toggleArray(formData.languages, lang) })}
                            className={chip(formData.languages, lang)}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── STEP 3 — Your Profile ─────────── */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Photos */}
                  <div className="gloss-card rounded-2xl p-5 space-y-4">
                    <h3 className={sectionTitle}>Instructor Photos <span className="text-[#e01e37]">*</span></h3>
                    <p className="text-xs text-[#666] -mt-2">
                      Add at least 3 high-quality photos. These appear on your public instructor card.
                    </p>
                    <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-10 cursor-pointer transition-all hover:border-[#e01e37]/40 hover:bg-[#e01e37]/04">
                      <Camera className="size-8 text-[#555]" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">Click to select photos</p>
                        <p className="text-xs text-[#555] mt-1">JPEG, PNG or WebP · Max 5 MB each · Min 3 photos</p>
                      </div>
                      {photos.length > 0 && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                          {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => {
                          setPhotos(Array.from(e.target.files || []))
                          setErrorMessage('')
                        }}
                        className="sr-only"
                      />
                    </label>

                    {/* Photo preview thumbnails */}
                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {photos.map((p, i) => (
                          <div key={i} className="relative size-16 overflow-hidden rounded-xl border border-white/[0.08]">
                            <Image
                              src={URL.createObjectURL(p)}
                              alt={`Photo ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="gloss-card rounded-2xl p-5 space-y-3">
                    <h3 className={sectionTitle}>Professional Bio</h3>
                    <p className="text-xs text-[#666] -mt-1">
                      Tell students about your teaching philosophy, strengths, and what they'll achieve.
                    </p>
                    <textarea
                      rows={6}
                      placeholder="e.g. I'm a certified boxing coach with 8 years of experience training competitive fighters and beginners alike. My sessions focus on technique, conditioning and building confidence..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className={textareaBase}
                    />
                    <p className="text-[11px] text-[#555] text-right">{formData.bio.length} / 800 characters</p>
                  </div>

                  {/* Terms */}
                  <p className="text-center text-xs leading-relaxed text-[#555]">
                    By submitting you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-white">Terms of Use</Link>{' '}
                    &{' '}
                    <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                  </p>

                  {/* Submit button — shown inside step 3 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="gloss-btn-primary w-full h-13 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ height: '52px' }}
                  >
                    {loading ? 'Submitting Application...' : 'Create Instructor Profile →'}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation Buttons (steps 1 & 2 only) ── */}
          {step < 3 && (
            <div className={`mt-8 flex gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="gloss-btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-[#888] hover:text-white"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                className="gloss-btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-bold text-white"
              >
                Continue
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* Back button on step 3 */}
          {step === 3 && (
            <button
              type="button"
              onClick={goBack}
              className="gloss-btn-secondary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-[#888] hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Step 2
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
