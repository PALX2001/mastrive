'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, User, Phone, Calendar, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

// Extract the main logic into a child component so we can wrap it in Suspense
function AuthContent() {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const [mode, setMode] = useState<'signin' | 'signup' | 'details'>(initialMode)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Additional Profile Details (Pre-filled with your profile context)
  const [fullName, setFullName] = useState('Palash')
  const [age, setAge] = useState('24')
  const [sex, setSex] = useState('male')
  const [phone, setPhone] = useState('+91 98765 43210')

  const supabase = createClient()

  // Sync mode if the URL parameters change
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup')
    else if (searchParams.get('mode') === 'signin') setMode('signin')
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  // Handle the first step (Email collection)
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    if (mode === 'signup') {
      // Move to details step before sending the magic link
      setMode('details')
      setMessage(null)
    } else {
      // If sign in, send the magic link/OTP immediately
      finalizeAuth()
    }
  }

  // Handle the final step (Sending OTP to Supabase)
  const finalizeAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: mode !== 'signin',
        // Pass the collected details into Supabase user metadata on signup
        data: mode === 'details' ? {
          full_name: fullName,
          age: parseInt(age),
          sex: sex,
          phone: phone,
        } : undefined
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: mode === 'details'
          ? 'A confirmation link has been sent to your email to create your account!'
          : 'A one-time login link has been sent to your email!',
      })
    }
  }

  const toggleMode = () => {
    setMessage(null)
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0f12] px-4 py-12 text-[#f0f6fc]">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={120}
              height={30}
              priority
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/instructor"
              className="hidden rounded-full border border-white/10 bg-[#161b22] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:inline-flex"
            >
              Become an Instructor
            </Link>
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setMessage(null)
              }}
              className={`text-sm font-semibold transition ${
                mode === 'signin' ? 'text-white' : 'text-[#8b949e] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setMessage(null)
              }}
              className="rounded-full bg-[#e01e37] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#c0182f]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#14171d] p-8 shadow-2xl backdrop-blur-md overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: LOGIN / SIGNUP BASE FORM */}
          {mode !== 'details' && (
            <motion.div
              key="auth-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#8b949e] transition hover:text-white"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Link>

              <div className="mt-6 flex flex-col items-center text-center">
                <Image
                  src="/logo.svg"
                  alt="MASTRIVE"
                  width={130}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h1>
                <p className="mt-1 text-xs text-[#8b949e]">
                  {mode === 'signin'
                    ? 'Welcome back to MASTRIVE'
                    : 'Join MASTRIVE and start booking sessions'}
                </p>
              </div>

              {message && (
                <div
                  className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                    message.type === 'success'
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border border-red-500/20 bg-red-500/10 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1c2128] text-sm font-semibold text-white transition hover:bg-[#252b35] disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#14171d] px-3 text-[10px] font-bold uppercase tracking-widest text-[#6e7681]">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e]">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 text-sm text-white outline-none transition focus:border-[#e01e37]"
                  />
                </div>

                <p className="text-[11px] text-[#6e7681]">
                  We'll send you a one-time code or magic link to {mode === 'signin' ? 'sign in' : 'sign up'}.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-sm font-bold text-white shadow-lg shadow-[#e01e37]/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading
                    ? 'Sending Code...'
                    : mode === 'signin'
                    ? 'Get My Code'
                    : 'Create Account'}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  <span className="size-5 rounded-full border border-[#14171d] bg-[#e01e37]" />
                  <span className="size-5 rounded-full border border-[#14171d] bg-[#3b82f6]" />
                  <span className="size-5 rounded-full border border-[#14171d] bg-[#10b981]" />
                </div>
                <span className="text-xs text-[#8b949e]">
                  <strong className="font-semibold text-white">10,000+</strong> people booked this month
                </span>
              </div>

              {/* Interactive Mode Switcher */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[11px] text-[#6e7681] transition hover:text-white"
                >
                  {mode === 'signin' ? (
                    <>
                      New here? <span className="font-semibold text-[#e01e37] underline">Sign up in seconds.</span>
                    </>
                  ) : (
                    <>
                      Already have an account? <span className="font-semibold text-[#e01e37] underline">Sign in instead.</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROFILE DETAILS FORM (Only for Signup) */}
          {mode === 'details' && (
            <motion.div
              key="auth-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setMode('signup')}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#8b949e] transition hover:text-white mb-2"
              >
                <ArrowLeft className="size-3.5" />
                Back to Email
              </button>

              <div className="mt-4 flex flex-col items-center text-center">
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#e01e37]/10 text-[#e01e37] mb-3">
                  <User className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Complete Profile
                </h1>
                <p className="mt-1 text-xs text-[#8b949e] max-w-[280px]">
                  You're almost in. We just need a few details to personalize your experience.
                </p>
              </div>

              {message && (
                <div className={`mt-4 rounded-xl p-3 text-xs font-medium border border-red-500/20 bg-red-500/10 text-red-400`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={finalizeAuth} className="mt-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e]">Full Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#e01e37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Age</label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                      <input
                        type="number"
                        required
                        placeholder="24"
                        min="13"
                        max="100"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#e01e37]"
                      />
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e]">Sex</label>
                    <select
                      required
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="mt-1.5 h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0d0f12] px-4 text-sm text-white outline-none transition focus:border-[#e01e37] cursor-pointer"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#8b949e]">Phone Number</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#e01e37]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Save & Send Magic Link'}
                  <ChevronRight className="size-4" />
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f12] flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}