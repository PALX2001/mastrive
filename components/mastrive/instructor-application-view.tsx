'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  ChevronDown, 
  CheckCircle2, 
  MapPin, 
  Video, 
  Sparkles, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  RefreshCw,
  Award
} from 'lucide-react'

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
  'Home Visits (student\'s location)',
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

export default function InstructorApplicationView() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (photos.length < 3) {
      setErrorMessage('Please add at least 3 instructor photos.')
      return
    }

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
          }
        } catch {
          // If storage upload fails due to network, generate preview url
          imageUrls.push(URL.createObjectURL(photo))
        }
      }

      // 2. Submit via API route (bypasses RLS issues on client side)
      const res = await fetch('/api/instructor/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appId,
          ...formData,
          image_urls: imageUrls,
          user_id: userId,
        }),
      })

      const result = await res.json()
      if (!res.ok && result.error) {
        throw new Error(result.error)
      }

      // Store summary for Thank You presentation
      setSubmittedData({
        name: formData.name.trim() || formData.institute_name.trim() || 'Coach',
        category: formData.category,
        skill: formData.sub_skills.trim() || 'Instructor',
        city: formData.city.trim() || 'Delhi',
        locality: formData.locality.trim() || 'Delhi',
        price: formData.price_per_hour ? Number(formData.price_per_hour) : 1000,
        imageUrl: imageUrls[0] || (photos[0] ? URL.createObjectURL(photos[0]) : undefined),
        email: formData.email.trim(),
        teachingModes: formData.teaching_modes,
      })

      setSubmitted(true)
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Application submission error:', err)
      }

      const detailedMsg = err?.message || err?.error_description || String(err)

      if (detailedMsg.includes('Failed to fetch')) {
        setErrorMessage(
          'Network error: Unable to connect to server. Check your connection or disable ad blockers.'
        )
      } else {
        setErrorMessage(detailedMsg || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setSubmittedData(null)
    setPhotos([])
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

  const inputBase =
    'w-full h-11 rounded-lg border border-white/10 bg-[#0d1117] px-4 py-2.5 text-[13.5px] text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42] mt-1.5'

  const selectBase =
    'w-full h-11 appearance-none rounded-lg border border-white/10 bg-[#0d1117] pl-4 pr-10 py-2.5 text-[13.5px] text-white transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42] cursor-pointer mt-1.5'

  const selectWrapBase = 'relative w-full'

  const chevronBase =
    'pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8b949e] mt-1'

  const textareaBase =
    'w-full rounded-lg border border-white/10 bg-[#0d1117] px-4 py-3 text-[13.5px] text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42] mt-1.5 resize-y'

  const labelBase = 'block text-[12px] font-semibold text-[#c9d1d9] tracking-tight'

  const sectionTitleBase =
    'text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-[#e52e42]'

  const chipOption =
    (arr: string[], value: string) =>
      `relative select-none rounded-lg border px-3 py-2 text-[11px] font-semibold transition-all cursor-pointer ${
        arr.includes(value)
          ? 'border-[#e52e42] bg-[#e52e42]/15 text-white shadow-[0_0_0_1px_rgba(229,46,66,0.25)]'
          : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20 hover:text-white'
      }`

  return (
    <section className="min-h-screen bg-[#0b0b0b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
          BECOME A COACH
        </p>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Teach what you love on <span className="font-serif italic text-[#e52e42]">Mastrive.</span>
        </h1>

        <p className="mt-4 text-base text-[#8b949e] sm:text-lg max-w-xl mx-auto">
          Connect with driven students in your city or online. Set your own rates, keep your calendar flexible, and get paid directly after every session.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-[#12161f] p-6 shadow-2xl sm:p-8">
          {submitted && submittedData ? (
            <div className="py-2 text-left space-y-6">
              {/* Thank you Header */}
              <div className="text-center pb-2 border-b border-white/10">
                <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <CheckCircle2 className="size-7 text-emerald-400" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles className="size-3" /> Profile Published
                </span>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl tracking-tight">
                  Thank You for Applying, {submittedData.name}!
                </h2>
                <p className="mt-2 text-sm text-[#8b949e] max-w-lg mx-auto">
                  We are thrilled to welcome you to Mastrive. Your details are saved and your instructor card has been automatically created in our public directory.
                </p>
              </div>

              {/* Live Preview of Created Instructor Card */}
              <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e] mb-3">
                  Your Live Instructor Card Preview
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-white/10 bg-[#161b22] p-4">
                  {submittedData.imageUrl ? (
                    <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
                      <Image
                        src={submittedData.imageUrl}
                        alt={submittedData.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c222d] to-[#0d1117] text-3xl">
                      🥊
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-bold text-white">
                        {submittedData.name}
                      </h3>
                      {/* No verified badge initially */}
                      <span className="rounded-md border border-white/10 bg-[#0d1117] px-2 py-0.5 text-[10px] font-semibold text-[#8b949e]">
                        New Coach
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-[#e01e37]">
                      {submittedData.skill} • <span className="text-[#8b949e]">{submittedData.category}</span>
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-[#8b949e]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-[#8b949e]" />
                        {submittedData.locality || submittedData.city}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-white">
                        ₹{submittedData.price.toLocaleString('en-IN')}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pathway to Verified Badge Card */}
              <div className="rounded-xl border border-[#e01e37]/25 bg-gradient-to-br from-[#e01e37]/10 via-[#12161f] to-[#12161f] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e01e37]/20 text-[#e01e37] border border-[#e01e37]/30 mt-0.5">
                    <Award className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">
                      Verified Badge Unlock (10 Learners)
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#8b949e]">
                      Your instructor profile is listed and open for bookings! To earn the official <span className="text-emerald-400 font-semibold">Verified Coach Badge (✓)</span>, onboard and complete sessions with your first <span className="text-white font-semibold">10 learners</span>. The badge unlocks automatically once you reach this milestone.
                    </p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#8b949e] mb-1.5">
                        <span>Boarding Progress</span>
                        <span className="text-white font-bold">0 / 10 Learners</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
                        <div className="h-full w-0 bg-gradient-to-r from-[#e01e37] to-emerald-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/#instructors"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e52e42] py-3 text-[13px] font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(229,46,66,0.3)] transition-all hover:bg-[#d02538] active:scale-[0.99]"
                >
                  <span>Explore Directory &amp; Find Your Card</span>
                  <ArrowRight className="size-4" />
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0d1117] py-2.5 text-xs font-semibold text-[#8b949e] transition-colors hover:border-white/20 hover:text-white"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Apply for Another Skill</span>
                  </button>

                  <Link
                    href="/"
                    className="flex items-center justify-center rounded-lg border border-white/10 bg-[#0d1117] py-2.5 text-xs font-semibold text-[#8b949e] transition-colors hover:border-white/20 hover:text-white"
                  >
                    Back to Homepage
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* SECTION 1 — Profile Type (UrbanPro-style radio) */}
              <div>
                <label className={`${labelBase} mb-2`}>
                  Create Profile As <span className="text-[#e52e42]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['individual', 'institute'] as const).map((type) => {
                    const checked = formData.profile_type === type
                    return (
                      <label
                        key={type}
                        className={`relative flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-all min-h-[44px] ${
                          checked
                            ? 'border-[#e52e42] bg-[#e52e42]/10 shadow-[0_0_0_1px_rgba(229,46,66,0.25)]'
                            : 'border-white/10 bg-[#0d1117] hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="profile_type"
                          value={type}
                          checked={checked}
                          onChange={() =>
                            setFormData({ ...formData, profile_type: type })
                          }
                          className="sr-only"
                        />
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                            checked
                              ? 'border-[#e52e42]'
                              : 'border-white/25'
                          }`}
                        >
                          {checked && (
                            <span className="size-2 rounded-full bg-[#e52e42]" />
                          )}
                        </span>
                        <span className="text-[12.5px] font-bold capitalize leading-tight">
                          {type === 'individual' ? 'I am an Individual' : 'I run an Institute'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 2 — Basic Identity */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>
                  Basic Details
                </h3>

                {formData.profile_type === 'institute' && (
                  <div>
                    <label className={labelBase}>
                      Institute / Academy Name <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required={formData.profile_type === 'institute'}
                      placeholder="e.g. Elite Fitness Academy"
                      value={formData.institute_name}
                      onChange={(e) =>
                        setFormData({ ...formData, institute_name: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Full Name <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Singh"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      Email Address <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amit@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelBase}>Code</label>
                    <div className={selectWrapBase}>
                      <select
                        value={formData.country_code}
                        onChange={(e) =>
                          setFormData({ ...formData, country_code: e.target.value })
                        }
                        className={selectBase}
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <ChevronDown className={chevronBase} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelBase}>
                      WhatsApp / Mobile Number <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      pattern="[0-9\s\-+()]{7,}"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Gender</label>
                  <div className={selectWrapBase}>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className={selectBase}
                    >
                      <option value="">-- Select Gender --</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className={chevronBase} />
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Skill & Teaching Category */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>
                  What You Teach
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Main Category <span className="text-[#e52e42]">*</span>
                    </label>
                    <div className={selectWrapBase}>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className={selectBase}
                      >
                        <option value="">-- Select Main Category --</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className={chevronBase} />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>
                      Subjects / Skills (comma separated) <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boxing, Strength Training, HIIT"
                      value={formData.sub_skills}
                      onChange={(e) =>
                        setFormData({ ...formData, sub_skills: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelBase}>
                      Pincode <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{4,8}"
                      placeholder="e.g. 110016"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      Locality <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hauz Khas"
                      value={formData.locality}
                      onChange={(e) =>
                        setFormData({ ...formData, locality: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>
                      City <span className="text-[#e52e42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 — Experience & Credentials */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>
                  Experience & Qualifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Total Teaching Experience
                    </label>
                    <div className={selectWrapBase}>
                      <select
                        value={formData.experience_years}
                        onChange={(e) =>
                          setFormData({ ...formData, experience_years: e.target.value })
                        }
                        className={selectBase}
                      >
                        <option value="">-- Select Experience --</option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className={chevronBase} />
                    </div>
                  </div>
                  <div>
                    <label className={labelBase}>
                      Highest Education
                    </label>
                    <div className={selectWrapBase}>
                      <select
                        value={formData.education}
                        onChange={(e) =>
                          setFormData({ ...formData, education: e.target.value })
                        }
                        className={selectBase}
                      >
                        <option value="">-- Select Qualification --</option>
                        {EDUCATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className={chevronBase} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>
                    Certifications, Awards & Achievements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List any relevant certifications, degrees, awards, or competitive achievements... (e.g. AIBA 1-Star, NSCA CPT, State Gold)"
                    value={formData.certifications}
                    onChange={(e) =>
                      setFormData({ ...formData, certifications: e.target.value })
                    }
                    className={textareaBase}
                  />
                </div>
              </div>

              {/* SECTION 5 — Delivery Modes & Availability */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>
                  Delivery & Pricing
                </h3>

                <div>
                  <label className={`${labelBase} mb-2`}>
                    How do you teach? (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {TEACHING_MODES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            teaching_modes: toggleArray(formData.teaching_modes, mode),
                          })
                        }
                        className={chipOption(formData.teaching_modes, mode) + ' text-left min-h-[40px] text-[12px]'}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Rate per hour (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      placeholder="e.g. 1200"
                      value={formData.price_per_hour}
                      onChange={(e) =>
                        setFormData({ ...formData, price_per_hour: e.target.value })
                      }
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={`${labelBase} mb-2`}>
                      Offer Free Demo Class?
                    </label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                      {(['yes', 'no'] as const).map((opt) => {
                        const checked = formData.demo_class === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, demo_class: opt })
                            }
                            className={`rounded-lg border px-3 py-2.5 text-[12.5px] font-bold uppercase transition-all min-h-[44px] ${
                              checked
                                ? 'border-[#e52e42] bg-[#e52e42]/15 text-white'
                                : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {opt === 'yes' ? '✓ Yes' : '✕ No'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`${labelBase} mb-2`}>
                    Age Groups You Teach
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AGE_GROUPS.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            age_groups: toggleArray(formData.age_groups, age),
                          })
                        }
                        className={chipOption(formData.age_groups, age) + ' min-h-[40px] text-[12px]'}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`${labelBase} mb-2`}>
                    Languages You Speak
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {LANGUAGES_LIST.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            languages: toggleArray(formData.languages, lang),
                          })
                        }
                        className={chipOption(formData.languages, lang) + ' min-h-[40px] text-[12px]'}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 6 — Instructor Photos */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>Instructor Photos</h3>
                <div>
                  <label className={labelBase}>
                    Add at least 3 photos <span className="text-[#e52e42]">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    required
                    onChange={(event) => {
                      const selected = Array.from(event.target.files || [])
                      setPhotos(selected)
                      setErrorMessage('')
                    }}
                    className="mt-1.5 block w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-[#0d1117] px-4 py-3 text-xs text-[#8b949e] file:mr-4 file:rounded-md file:border-0 file:bg-[#e52e42] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:border-white/35"
                  />
                  <p className="mt-2 text-[11.5px] text-[#8b949e]">
                    {photos.length} selected · JPEG, PNG, or WebP · up to 5 MB each · minimum 3 photos
                  </p>
                </div>
              </div>

              {/* SECTION 7 — Short Bio */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#0d1117]/50 p-5">
                <h3 className={sectionTitleBase}>
                  About You
                </h3>
                <div>
                  <label className={labelBase}>
                    Professional Bio (3-5 lines)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell students & our team about yourself, your teaching philosophy, unique strengths, and what students will achieve by training with you..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={textareaBase}
                  />
                  <p className="mt-1.5 text-[11.5px] text-[#8b949e]">
                    {formData.bio.length} / 800 characters
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#e52e42] text-[13.5px] font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(229,46,66,0.3)] transition-all hover:bg-[#d02538] hover:shadow-[0_6px_20px_rgba(229,46,66,0.4)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? 'Submitting Application...' : 'Create Instructor Profile'}
              </button>

              <p className="text-center text-[12px] leading-relaxed text-[#8b949e]">
                By submitting you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white">
                  Terms of Use
                </Link>{' '}
                &{' '}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy Policy
                </Link>
                . We use these details only to assess your application and contact you about Mastrive.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
