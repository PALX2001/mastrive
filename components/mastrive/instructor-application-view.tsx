'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown } from 'lucide-react'

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

export default function InstructorApplicationView() {
  const [formData, setFormData] = useState({
    profile_type: 'individual' as 'individual' | 'institute',
    name: '',
    institute_name: '',
    email: '',
    country_code: '+91',
    whatsapp: '',
    gender: '',
    category: '',
    sub_skills: '',
    pincode: '',
    locality: '',
    city: 'Delhi',
    experience_years: '',
    certifications: '',
    education: '',
    teaching_modes: [] as string[],
    demo_class: 'yes',
    languages: [] as string[],
    price_per_hour: '',
    age_groups: [] as string[],
    bio: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
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

      const payload: Record<string, any> = {
        profile_type: formData.profile_type,
        full_name: formData.name.trim(),
        // Keep the legacy columns populated while the new public-card trigger
        // uses the richer fields below.
        skill: formData.sub_skills.trim(),
        location: [formData.locality.trim(), formData.city.trim()].filter(Boolean).join(', '),
        experience: formData.experience_years || null,
        institute_name: formData.institute_name.trim() || null,
        email: formData.email.trim(),
        country_code: formData.country_code,
        whatsapp_number: formData.whatsapp.trim(),
        gender: formData.gender || null,
        category: formData.category,
        sub_skills: formData.sub_skills.trim(),
        pincode: formData.pincode.trim(),
        locality: formData.locality.trim(),
        city: formData.city.trim(),
        experience_years: formData.experience_years || null,
        certifications: formData.certifications.trim() || null,
        education: formData.education || null,
        teaching_modes: formData.teaching_modes,
        demo_class_offered: formData.demo_class,
        languages_spoken: formData.languages,
        price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : null,
        age_groups_taught: formData.age_groups,
        bio: formData.bio.trim() || null,
        status: 'pending',
      }

      if (userId) {
        payload.user_id = userId
      }

      const { error, data } = await supabase
        .from('instructor_applications')
        .insert([payload])
        .select('id, email')
        .single()

      if (error) throw error

      const appId = data?.id
      const appEmail = data?.email || formData.email.trim()

      if (!appId) {
        throw new Error('Your application was saved without an identifier. Please try again.')
      }

      const imageUrls: string[] = []
      for (const [index, photo] of photos.entries()) {
        if (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024) {
          throw new Error('Each photo must be an image smaller than 5 MB.')
        }

        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `applications/${appId}/${index}-${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('instructor-images')
          .upload(path, photo, { contentType: photo.type, upsert: false })

        if (uploadError) throw uploadError

        const { data: publicUrl } = supabase.storage
          .from('instructor-images')
          .getPublicUrl(path)
        imageUrls.push(publicUrl.publicUrl)
      }

      const { error: imageUpdateError } = await supabase
        .from('instructor_applications')
        .update({ image_urls: imageUrls })
        .eq('id', appId)

      if (imageUpdateError) throw imageUpdateError

      const redirectBase =
        typeof window !== 'undefined' ? window.location.origin : ''

      const redirectWithParams = new URL(`${redirectBase}/auth/callback`)
      redirectWithParams.searchParams.set('next', '/dashboard/instructor')
      if (appId) {
        redirectWithParams.searchParams.set('instructor_app_id', appId)
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: appEmail,
        options: {
          emailRedirectTo: redirectWithParams.toString(),
          shouldCreateUser: true,
          data: {
            full_name: formData.name.trim(),
            role: 'instructor',
            instructor_app_id: appId,
            whatsapp_number: formData.whatsapp.trim(),
            city: formData.city.trim(),
          },
        },
      })

      if (otpError) {
        // Email might fail to send in dev; still mark application as received
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'OTP email send failed (likely an environment issue), but application saved:',
            otpError
          )
        } else {
          throw new Error(
            `Application saved, but verification email failed to send: ${otpError.message}`
          )
        }
      }

      setConfirmationEmail(appEmail)
      setSubmitted(true)
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Application submission error:', err)
      }

      const detailedMsg = err?.message || err?.error_description || String(err)

      if (detailedMsg.includes('Failed to fetch')) {
        setErrorMessage(
          'Network error: Unable to connect to Supabase. Check your connection or disable ad blockers.'
        )
      } else {
        setErrorMessage(detailedMsg || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
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
          {submitted ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <svg viewBox="0 0 24 24" className="size-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Application Submitted!
              </h3>
              <p className="mt-2 text-sm text-[#8b949e]">
                We've received your profile details. A verification link has been sent to:
              </p>
              <div className="mt-3 inline-block rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2 text-[13.5px] font-bold text-white tracking-tight">
                {confirmationEmail}
              </div>
              <p className="mt-5 text-xs text-[#8b949e] leading-relaxed max-w-md mx-auto">
                Click the link in that email to verify your identity &amp; be redirected straight to
                your <span className="font-semibold text-white">Instructor Dashboard</span> where
                your details (name, category, bio, pricing) are already pre-filled.
              </p>
              <p className="mt-3 text-[11px] text-[#6e7681]">
                (If it doesn't arrive in the next 2 minutes, check Spam / Promotions folder.)
              </p>
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
