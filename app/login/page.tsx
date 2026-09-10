'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, User, Mail, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup')
    else if (searchParams.get('mode') === 'signin') setMode('signin')
  }, [searchParams])

  // Check if already signed in
  useEffect(() => {
    let isMounted = true

    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!isMounted) return

        if (user) {
          const explicitNext = searchParams.get('next')
          if (explicitNext) {
            router.replace(explicitNext)
            return
          }

          // Check if instructor
          let isInstructor = user.user_metadata?.role === 'instructor' || user.app_metadata?.role === 'instructor'

          if (!isInstructor) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle()

            if (profile?.role === 'instructor') isInstructor = true
          }

          if (!isInstructor) {
            const { data: appData } = await supabase
              .from('instructor_applications')
              .select('status')
              .eq('user_id', user.id)
              .eq('status', 'approved')
              .maybeSingle()

            if (appData) isInstructor = true
          }

          if (isInstructor) {
            router.replace('/dashboard/instructor')
          } else {
            router.replace('/profile')
          }
          return
        }
      } catch (err) {
        // Continue to show login form
      } finally {
        if (isMounted) setCheckingAuth(false)
      }
    }

    checkExistingSession()

    return () => {
      isMounted = false
    }
  }, [router, searchParams, supabase])

  const handleGoogleAuth = async () => {
    setLoading(true)
    setMessage(null)
    
    // For new signups, take to onboarding flow; for signins, take to next or home
    const explicitNext = searchParams.get('next')
    const targetNext = explicitNext || (mode === 'signup' ? '/onboarding' : '/')
    const targetUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage(null)

    const explicitNext = searchParams.get('next')
    const targetNext = explicitNext || (mode === 'signup' ? '/onboarding' : '/')
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetNext)}`

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: mode === 'signup',
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: mode === 'signup'
          ? 'Verification email sent! Click the secure link in your inbox to verify your email and personalize your Mastrive profile.'
          : 'A one-time login link has been sent to your email. Check your inbox to sign in!',
      })
    }
  }

  const toggleMode = () => {
    setMessage(null)
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#080a0f] px-4 py-12 text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e01e37]/20 via-[#e01e37]/5 to-transparent blur-[140px] transform-gpu"
      />

      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 py-6 sm:px-8">
        <div className="flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={130}
              height={32}
              priority
              className="h-8 w-auto object-contain"
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
              className="rounded-full bg-[#e01e37] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#e01e37]/25 transition hover:bg-[#c0182f]"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 w-full max-w-[440px] rounded-3xl border border-white/10 bg-[#12161f]/90 p-8 sm:p-9 shadow-2xl backdrop-blur-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#8b949e] transition hover:text-white"
            >
              <ArrowLeft className="size-3.5" />
              Back to Explore
            </Link>

            <div className="mt-6 flex flex-col items-center text-center">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/30 text-[#e01e37] mb-3">
                <Sparkles className="size-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mode === 'signin' ? 'Welcome Back' : 'Join MASTRIVE'}
              </h1>
              <p className="mt-1.5 text-xs text-[#8b949e]">
                {mode === 'signin'
                  ? 'Sign in to access your sessions and bookings'
                  : 'Start learning directly with top-tier verified coaches'}
              </p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                  message.type === 'success'
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              type="button"
              className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-[#181d26] text-sm font-bold text-white shadow-md transition hover:bg-[#202733] hover:border-white/25 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#12161f] px-3 text-[10px] font-bold uppercase tracking-widest text-[#6e7681]">
                OR WITH EMAIL LINK
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6e7681]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0e14] pl-11 pr-4 text-sm font-medium text-white placeholder-gray-600 outline-none transition focus:border-[#e01e37] focus:ring-1 focus:ring-[#e01e37]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#6e7681] leading-relaxed">
                {mode === 'signup'
                  ? 'We will send you a verification link which will open the onboarding questions page.'
                  : 'We will send you a passwordless magic sign-in link to your inbox.'}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-sm font-bold text-white shadow-xl shadow-[#e01e37]/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{loading ? 'Sending Link...' : mode === 'signin' ? 'Send Sign-In Link' : 'Send Verification Email'}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-8 border-t border-white/5 pt-5 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs text-[#8b949e] transition hover:text-white"
              >
                {mode === 'signin' ? (
                  <>
                    New to MASTRIVE? <span className="font-bold text-[#e01e37] underline ml-1">Create an account.</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span className="font-bold text-[#e01e37] underline ml-1">Sign in instead.</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-white">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}