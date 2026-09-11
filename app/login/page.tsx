'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowRight, Mail, MessageCircle, KeyRound, UserPlus, Sparkles } from 'lucide-react'
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
    <div className="radial-glow-crimson relative flex min-h-screen w-full overflow-hidden text-[#f5f5f5] selection:bg-[#e01e37] selection:text-white">

      {/* ── Extra depth radial glow blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-center crimson bloom */}
        <div className="absolute -top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#e01e37]/10 blur-[160px] transform-gpu" />
        {/* Bottom-right warm accent */}
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] translate-x-1/4 rounded-full bg-[#e01e37]/06 blur-[120px] transform-gpu" />
        {/* Subtle top highlight band */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ─────────────────────────────────
          LEFT PANEL — editorial + helpers
      ───────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-10 xl:p-14">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 self-start">
          <Image
            src="/logo.svg"
            alt="MASTRIVE"
            width={140}
            height={34}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Hero copy */}
        <div className="py-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight"
          >
            <span className="text-white">Welcome</span>
            <span className="font-serif italic text-[#e01e37]">Back</span>
            <span className="text-white">_</span>
            <span className="text-[#e01e37]">!</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xs text-sm leading-relaxed text-[#888]"
          >
            By entering your information, sign up and join Mastrive — your gateway to verified skill coaches.
          </motion.p>
        </div>

        {/* Helper sidebar cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
        >
          {/* Any Questions */}
          <div className="gloss-helper-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e01e37]/15 text-[#e01e37]">
                <MessageCircle className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Any Questions?</p>
                <p className="text-[11px] text-[#666]">We're here to help</p>
              </div>
            </div>
            <a
              href="mailto:help@mastrive.com"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Contact Us
            </a>
          </div>

          {/* Forgot password */}
          <div className="gloss-helper-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e01e37]/15 text-[#e01e37]">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Forgot Password?</p>
                <p className="text-[11px] text-[#666]">We use magic links — no password needed</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Click Here
            </button>
          </div>

          {/* Have Account */}
          <div className="gloss-helper-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e01e37]/15 text-[#e01e37]">
                <UserPlus className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">New to MASTRIVE?</p>
                <p className="text-[11px] text-[#666]">Create your free account</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setMode('signup'); setMessage(null) }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Sign Up
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────
          RIGHT PANEL — auth form
      ───────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-10">

        {/* Mobile logo */}
        <div className="mb-8 flex items-center justify-between w-full max-w-[440px] lg:hidden">
          <Link href="/">
            <Image src="/logo.svg" alt="MASTRIVE" width={120} height={30} priority className="h-8 w-auto" />
          </Link>
          <Link
            href="/?tab=instructor"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
          >
            Become an Instructor
          </Link>
        </div>

        {/* Desktop: top-right nav */}
        <div className="absolute right-8 top-8 hidden lg:flex items-center gap-4">
          <Link
            href="/?tab=instructor"
            className="text-xs font-semibold text-[#888] transition hover:text-white"
          >
            Become an Instructor
          </Link>
          <Link
            href="/login?mode=signup"
            className="gloss-btn-primary rounded-full px-5 py-2.5 text-xs font-bold text-white"
          >
            Sign Up
          </Link>
        </div>

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="gloss-card w-full max-w-[440px] rounded-3xl p-7 sm:p-9"
        >
          {checkingAuth ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
              <p className="text-xs text-[#888]">Verifying session...</p>
            </div>
          ) : (
            <>
              {/* Tab switcher: Sign In / Register */}
              <div className="relative flex rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1">
                <motion.span
                  layoutId="auth-tab-active"
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-[#e01e37] shadow-[0_4px_20px_rgba(224,30,55,0.4)]"
                  animate={{ left: mode === 'signin' ? '4px' : 'calc(50%)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setMessage(null) }}
                  className={`relative z-10 flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    mode === 'signin' ? 'text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setMessage(null) }}
                  className={`relative z-10 flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    mode === 'signup' ? 'text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Heading */}
                  <div className="mt-7 mb-1">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/25 text-[#e01e37] mb-4">
                      <Sparkles className="size-5" />
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight">
                      {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                    <p className="mt-1 text-xs text-[#888]">
                      {mode === 'signin'
                        ? 'Access your sessions, bookings and more.'
                        : 'Start learning with top-tier verified coaches.'}
                    </p>
                  </div>

                  {/* Status message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-5 rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                        message.type === 'success'
                          ? 'border border-emerald-500/25 bg-emerald-500/08 text-emerald-300'
                          : 'border border-red-500/25 bg-red-500/08 text-red-300'
                      }`}
                    >
                      {message.text}
                    </motion.div>
                  )}

                  {/* Google */}
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    type="button"
                    className="gloss-btn-secondary mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 active:scale-[0.98]"
                  >
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-6 flex items-center justify-center">
                    <div className="w-full border-t border-white/[0.07]" />
                    <span className="absolute rounded-full border border-white/[0.07] bg-[#111] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#555]">
                      or via email
                    </span>
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#666]">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="gloss-input h-12 w-full pl-11 pr-4 text-sm font-medium text-white placeholder-[#444] outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-[#555]">
                      {mode === 'signup'
                        ? 'We will send a verification link that opens the onboarding page.'
                        : 'We will send a passwordless magic sign-in link to your inbox.'}
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="gloss-btn-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
                    >
                      <span>
                        {loading
                          ? 'Sending...'
                          : mode === 'signin'
                          ? 'Send Sign-In Link'
                          : 'Send Verification Email'}
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                  </form>

                  {/* Back link */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/"
                      className="text-xs text-[#555] transition hover:text-[#888]"
                    >
                      ← Back to Explore
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen radial-glow-crimson flex items-center justify-center text-white">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}