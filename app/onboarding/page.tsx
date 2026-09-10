'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Swords, 
  Palette, 
  BrainCircuit, 
  Leaf, 
  Flame, 
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CITIES = [
  'Delhi NCR',
  'Gurgaon',
  'Noida',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chandigarh',
  'Other / Online'
]

const SKILL_INTERESTS = [
  { id: 'boxing', label: 'Boxing & Sparring', category: 'Fitness', icon: Swords, color: 'from-red-500/20 to-orange-500/10' },
  { id: 'muaythai', label: 'Muay Thai Kickboxing', category: 'Fitness', icon: Flame, color: 'from-orange-500/20 to-amber-500/10' },
  { id: 'guitar', label: 'Fingerstyle & Acoustic Guitar', category: 'Music', icon: Palette, color: 'from-purple-500/20 to-indigo-500/10' },
  { id: 'watercolour', label: 'Fine Arts & Watercolour', category: 'Music', icon: Palette, color: 'from-pink-500/20 to-rose-500/10' },
  { id: 'chess', label: 'Tournament Chess Strategy', category: 'Strategy', icon: BrainCircuit, color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'coding', label: 'Competitive Coding & DSA', category: 'Strategy', icon: BrainCircuit, color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'yoga', label: 'Vinyasa Yoga & Breathwork', category: 'Lifestyle', icon: Leaf, color: 'from-emerald-500/20 to-lime-500/10' },
  { id: 'nutrition', label: 'Performance Nutrition', category: 'Lifestyle', icon: Sparkles, color: 'from-amber-500/20 to-yellow-500/10' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1: User details
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('Delhi NCR')
  const [gender, setGender] = useState('male')

  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['boxing', 'guitar'])

  // Step 3 animation progression
  const [animStage, setAnimStage] = useState<'reveal' | 'glow' | 'transition'>('reveal')

  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        if (user.user_metadata?.full_name && !fullName) {
          setFullName(user.user_metadata.full_name)
        }
        if (user.user_metadata?.phone && !phone) {
          setPhone(user.user_metadata.phone)
        }
      }
    }
    checkUser()
  }, [])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    )
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setStep(2)
  }

  const handleStep2Submit = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      if (userId) {
        // Upsert user profile
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fullName,
            phone: phone || null,
            city: city,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })
      }
    } catch (err) {
      console.warn('Profile save note:', err)
    }

    setLoading(false)
    setStep(3)

    // Trigger Step 3 Cinematic Animation sequence
    setTimeout(() => {
      setAnimStage('glow')
    }, 1200)

    setTimeout(() => {
      setAnimStage('transition')
    }, 2800)

    setTimeout(() => {
      router.push('/?welcome=true')
    }, 3800)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#080a0f] px-4 py-12 text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white overflow-hidden">
      
      {/* Dynamic Background Glow Rings */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e01e37]/25 via-[#e01e37]/5 to-transparent blur-[120px] transform-gpu"
      />
      <div 
        aria-hidden 
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-gradient-to-t from-red-950/20 via-transparent to-transparent blur-[140px] transform-gpu"
      />

      {/* Top Header Logo */}
      {step !== 3 && (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={130}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8b949e]">Step {step} of 2</span>
            <div className="flex gap-1.5">
              <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#e01e37]' : 'bg-white/10'}`} />
              <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#e01e37]' : 'bg-white/10'}`} />
            </div>
          </div>
        </header>
      )}

      {/* Main Multi-Step Box */}
      <div className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">
          
          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL & CONTACT DETAILS */}
          {/* ========================================================================= */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/10 bg-[#12161f]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl"
            >
              <div className="text-center">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/30 text-[#e01e37] mb-4 shadow-lg shadow-[#e01e37]/20">
                  <User className="size-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome to MASTRIVE
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto">
                  Let’s set up your profile so instructors and coaches can personalize your 1-on-1 experience.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="mt-8 space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                    Your Full Name <span className="text-[#e01e37]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Henderson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0e14] pl-11 pr-4 text-sm font-medium text-white placeholder-gray-600 outline-none transition focus:border-[#e01e37] focus:ring-1 focus:ring-[#e01e37]"
                    />
                  </div>
                </div>

                {/* Contact Phone & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0e14] pl-11 pr-4 text-sm font-medium text-white placeholder-gray-600 outline-none transition focus:border-[#e01e37] focus:ring-1 focus:ring-[#e01e37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Age
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                      <input
                        type="number"
                        min="10"
                        max="100"
                        placeholder="24"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0e14] pl-11 pr-4 text-sm font-medium text-white placeholder-gray-600 outline-none transition focus:border-[#e01e37] focus:ring-1 focus:ring-[#e01e37]"
                      />
                    </div>
                  </div>
                </div>

                {/* Location / City & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Primary Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#0b0e14] pl-11 pr-8 text-sm font-medium text-white outline-none transition focus:border-[#e01e37] cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c} className="bg-[#12161f] text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#0b0e14] px-4 text-sm font-medium text-white outline-none transition focus:border-[#e01e37] cursor-pointer"
                    >
                      <option value="male" className="bg-[#12161f] text-white">Male</option>
                      <option value="female" className="bg-[#12161f] text-white">Female</option>
                      <option value="non-binary" className="bg-[#12161f] text-white">Non-binary / Other</option>
                      <option value="prefer-not" className="bg-[#12161f] text-white">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!fullName.trim()}
                  className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-sm font-bold text-white shadow-xl shadow-[#e01e37]/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Continue to Interests</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: INTERESTS & PASSIONS SELECTION */}
          {/* ========================================================================= */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/10 bg-[#12161f]/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl"
            >
              <div className="text-center">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e01e37]/20 to-purple-500/10 border border-white/10 text-white mb-4 shadow-lg">
                  <Compass className="size-7 text-[#e01e37]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  What skills are you aiming to master?
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#8b949e]">
                  Select the disciplines you want to explore. You can always change this later.
                </p>
              </div>

              {/* Grid of Interests */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {SKILL_INTERESTS.map((item) => {
                  const isSelected = selectedInterests.includes(item.id)
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`group relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-[#e01e37] bg-gradient-to-r ' + item.color + ' shadow-lg shadow-[#e01e37]/15'
                          : 'border-white/[0.08] bg-[#0b0e14]/70 hover:border-white/20 hover:bg-[#0b0e14]'
                      }`}
                    >
                      <div className={`flex size-10 items-center justify-center rounded-xl transition ${
                        isSelected ? 'bg-[#e01e37] text-white' : 'bg-white/5 text-[#8b949e] group-hover:text-white'
                      }`}>
                        <Icon className="size-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
                          {item.category}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.label}
                        </p>
                      </div>

                      <div className={`flex size-5 items-center justify-center rounded-full border transition ${
                        isSelected ? 'border-[#e01e37] bg-[#e01e37] text-white' : 'border-white/20 bg-transparent'
                      }`}>
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-white/10 bg-[#0b0e14] px-5 py-3.5 text-xs font-bold text-[#8b949e] hover:text-white transition active:scale-95"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading || selectedInterests.length === 0}
                  onClick={handleStep2Submit}
                  className="flex-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-sm font-bold text-white shadow-xl shadow-[#e01e37]/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{loading ? 'Finalizing Profile...' : 'Complete & Launch'}</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CINEMATIC WELCOME SCREEN */}
          {/* ========================================================================= */}
          {step === 3 && (
            <motion.div
              key="step-3-clean"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center justify-center text-center py-12 px-4"
            >
              {/* 1. Account Verified & Ready Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="size-4" />
                  Account Verified & Ready
                </span>
              </motion.div>

              {/* 2. Welcome to [MASTRIVE Logo] */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  Welcome to
                </span>
                <Image
                  src="/logo.svg"
                  alt="MASTRIVE"
                  width={220}
                  height={50}
                  priority
                  className="h-10 sm:h-14 w-auto object-contain inline-block"
                />
              </motion.div>

              {/* 3. Sleek Glowing Red Bar */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ delay: 0.3, duration: 2.2, ease: 'easeInOut' }}
                className="mt-8 h-1 max-w-sm rounded-full bg-gradient-to-r from-transparent via-[#e01e37] to-transparent shadow-[0_0_18px_rgba(224,30,55,0.9)]"
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

