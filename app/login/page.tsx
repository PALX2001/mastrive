'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Mail,
  MessageCircle,
  KeyRound,
  UserPlus,
  Sparkles,
  User,
  Phone,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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
  'Other / Online',
]

const SKILL_GOALS = [
  'Boxing & Sparring',
  'Muay Thai Kickboxing',
  'Tournament Chess',
  'Fingerstyle Guitar',
  'Fine Arts & Watercolour',
  'Competitive Coding',
  'Vinyasa Yoga',
  'Performance Nutrition',
]

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'

  // View state
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [step, setStep] = useState<'form' | 'otp_verification'>('form')

  // Form fields
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Delhi NCR')
  const [goal, setGoal] = useState('Boxing & Sparring')

  // OTP field
  const [otpCode, setOtpCode] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  // Feedback & Loading
  const [loading, setLoading] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)
  const [accountBanner, setAccountBanner] = useState<{
    type: 'exists' | 'not_found'
    text: string
  } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const supabase = createClient()
  const otpInputRef = useRef<HTMLInputElement>(null)
  const lastCheckedEmailRef = useRef<string>('')

  // Sync mode with searchParams
  useEffect(() => {
    const qMode = searchParams.get('mode')
    if (qMode === 'signup') setMode('signup')
    else if (qMode === 'signin') setMode('signin')
  }, [searchParams])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  // Auto-focus OTP input when switching to verification step
  useEffect(() => {
    if (step === 'otp_verification') {
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 200)
    }
  }, [step])

  // Check if already signed in
  useEffect(() => {
    let isMounted = true

    const checkExistingSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!isMounted) return

        if (user) {
          const rawNext = searchParams.get('next')
          const safeNext =
            rawNext &&
            rawNext.startsWith('/') &&
            !rawNext.startsWith('//') &&
            !rawNext.includes('\\')
              ? rawNext
              : null
          if (safeNext) {
            router.replace(safeNext)
            return
          }

          // Check if instructor
          let isInstructor =
            user.user_metadata?.role === 'instructor' ||
            user.app_metadata?.role === 'instructor'

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
              .in('status', ['approved', 'verified'])
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
      } catch {
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

  // Helper: check account existence via backend API
  const checkAccountExistence = async (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return null
    }

    try {
      setCheckingAccount(true)
      const res = await fetch('/api/auth/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      if (!res.ok) return null
      const data = await res.json()
      lastCheckedEmailRef.current = cleanEmail
      return data as {
        exists: boolean
        user?: {
          fullName?: string
          role?: string
          isInstructor?: boolean
        }
      }
    } catch {
      return null
    } finally {
      setCheckingAccount(false)
    }
  }

  // Handle email input blur validation check
  const handleEmailBlur = async () => {
    const clean = email.trim().toLowerCase()
    if (!clean || !clean.includes('@') || !clean.includes('.')) return
    if (clean === lastCheckedEmailRef.current) return

    const check = await checkAccountExistence(clean)
    if (!check) return

    if (check.exists) {
      if (mode === 'signup') {
        setAccountBanner({
          type: 'exists',
          text: `An account already exists for ${clean}. Switched to Sign In.`,
        })
        setMode('signin')
        if (check.user?.fullName && !fullName) {
          setFullName(check.user.fullName)
        }
      } else {
        setAccountBanner({
          type: 'exists',
          text: check.user?.fullName
            ? `Welcome back, ${check.user.fullName}! Ready to sign in.`
            : 'Account verified. Ready to sign in.',
        })
      }
    } else {
      if (mode === 'signin') {
        setAccountBanner({
          type: 'not_found',
          text: `No account found for ${clean}. Please complete the details below to register!`,
        })
        setMode('signup')
      } else {
        setAccountBanner(null)
      }
    }
  }

  // Google OAuth
  const handleGoogleAuth = async () => {
    setLoading(true)
    setMessage(null)
    setAccountBanner(null)

    const rawNext = searchParams.get('next')
    const safeNext =
      rawNext &&
      rawNext.startsWith('/') &&
      !rawNext.startsWith('//') &&
      !rawNext.includes('\\')
        ? rawNext
        : null
    const targetNext = safeNext || (mode === 'signup' ? '/onboarding' : '/')
    const targetUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      targetNext
    )}`

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

  // Submit Sign In or Sign Up
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return

    setLoading(true)
    setMessage(null)

    // Run account check if not already checked for this exact email
    let check = null
    if (cleanEmail !== lastCheckedEmailRef.current) {
      check = await checkAccountExistence(cleanEmail)
    }

    // Validation Check 1: User tried to Register, but already has an account
    if (mode === 'signup' && check?.exists) {
      setLoading(false)
      setMode('signin')
      setAccountBanner({
        type: 'exists',
        text: `You already have an account with ${cleanEmail}! Please sign in below.`,
      })
      setMessage({
        type: 'info',
        text: 'Account found. Click "Send Sign-In Code" to log in.',
      })
      return
    }

    // Validation Check 2: User tried to Sign In, but does NOT have an account
    if (mode === 'signin' && check && !check.exists) {
      setLoading(false)
      setMode('signup')
      setAccountBanner({
        type: 'not_found',
        text: `No account exists with ${cleanEmail}. Please fill in the details below to create your account.`,
      })
      setMessage({
        type: 'info',
        text: 'Please enter your name and phone number to complete your free registration.',
      })
      return
    }

    // Validation Check 3: For signup, ensure necessary details are valid
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setLoading(false)
        setMessage({ type: 'error', text: 'Please enter your full name.' })
        return
      }
      if (phone.trim() && phone.replace(/\D/g, '').length < 10) {
        setLoading(false)
        setMessage({
          type: 'error',
          text: 'Please enter a valid 10-digit mobile number.',
        })
        return
      }
    }

    const explicitNext = searchParams.get('next')
    const safeNext =
      explicitNext &&
      explicitNext.startsWith('/') &&
      !explicitNext.startsWith('//') &&
      !explicitNext.includes('\\')
        ? explicitNext
        : null
    const targetNext = safeNext || (mode === 'signup' ? '/profile?welcome=true' : '/')
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      targetNext
    )}`

    const userMetadata: Record<string, any> = {}
    if (fullName.trim()) userMetadata.full_name = fullName.trim()
    if (phone.trim()) userMetadata.phone = phone.trim()
    if (city.trim()) userMetadata.city = city.trim()
    if (goal.trim()) userMetadata.interests = [goal.trim()]

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: mode === 'signup',
        data: Object.keys(userMetadata).length > 0 ? userMetadata : undefined,
      },
    })

    setLoading(false)

    if (error) {
      let friendlyError = error.message
      if (
        error.message.includes('Signups not allowed for otp') ||
        error.message.includes('otp_disabled')
      ) {
        setMode('signup')
        setAccountBanner({
          type: 'not_found',
          text: `No account found for ${cleanEmail}. Please complete the registration details below to join.`,
        })
        friendlyError =
          'No account exists with this email yet. Please register below with your name and details.'
      } else if (error.message.includes('rate_limit')) {
        friendlyError =
          'Too many verification requests. Please wait a minute before requesting another code.'
      }
      setMessage({ type: 'error', text: friendlyError })
    } else {
      // Transition to OTP code entry step
      setStep('otp_verification')
      setResendCountdown(45)
      setMessage({
        type: 'success',
        text:
          mode === 'signup'
            ? `We sent a 6-digit verification code & link to ${cleanEmail}. Enter the code below to launch your account!`
            : `A 6-digit sign-in code & magic link have been sent to ${cleanEmail}. Enter your code below!`,
      })
    }
  }

  // Handle direct 6-Digit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    const cleanToken = otpCode.trim()

    if (!cleanToken || cleanToken.length < 6) {
      setMessage({
        type: 'error',
        text: 'Please enter the complete 6-digit verification code.',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    })

    if (error) {
      setLoading(false)
      let friendlyError = error.message
      if (
        error.message.includes('Token has expired') ||
        error.message.includes('invalid') ||
        error.message.includes('Token is invalid')
      ) {
        friendlyError =
          'The 6-digit code is incorrect or has expired. Please check your latest email or click "Resend Code".'
      }
      setMessage({ type: 'error', text: friendlyError })
      return
    }

    // Success! Update profile data if registering
    const sessionUser = data?.user
    if (sessionUser) {
      try {
        const cleanName =
          fullName.trim() ||
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.name ||
          null

        await supabase.from('profiles').upsert(
          {
            id: sessionUser.id,
            email: sessionUser.email,
            full_name: cleanName,
            phone: phone.trim() || sessionUser.user_metadata?.phone || null,
            city: city.trim() || sessionUser.user_metadata?.city || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (upsertErr) {
        console.warn('Profile sync warning:', upsertErr)
      }
    }

    setMessage({
      type: 'success',
      text: 'Verified successfully! Redirecting...',
    })

    // Route user appropriately
    const rawNext = searchParams.get('next')
    const safeNext =
      rawNext &&
      rawNext.startsWith('/') &&
      !rawNext.startsWith('//') &&
      !rawNext.includes('\\')
        ? rawNext
        : null

    setTimeout(() => {
      if (safeNext) {
        router.replace(safeNext)
      } else if (mode === 'signup') {
        router.replace('/profile?welcome=true')
      } else {
        router.replace('/profile')
      }
    }, 600)
  }

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return

    setLoading(true)
    setMessage(null)

    const explicitNext = searchParams.get('next')
    const safeNext =
      explicitNext &&
      explicitNext.startsWith('/') &&
      !explicitNext.startsWith('//') &&
      !explicitNext.includes('\\')
        ? explicitNext
        : null
    const targetNext = safeNext || (mode === 'signup' ? '/profile?welcome=true' : '/')
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      targetNext
    )}`

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: mode === 'signup',
      },
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setResendCountdown(45)
      setMessage({
        type: 'success',
        text: `Fresh verification code sent to ${cleanEmail}!`,
      })
    }
  }

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode)
    setStep('form')
    setMessage(null)
    setAccountBanner(null)
    setOtpCode('')
  }

  return (
    <div className="radial-glow-crimson relative flex min-h-screen w-full overflow-hidden text-[#f5f5f5] selection:bg-[#e01e37] selection:text-white">
      {/* ── Extra depth radial glow blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#e01e37]/10 blur-[160px] transform-gpu" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] translate-x-1/4 rounded-full bg-[#e01e37]/06 blur-[120px] transform-gpu" />
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
            <span className="text-white">Master</span>
            <br />
            <span className="font-serif italic text-[#e01e37]">Anything</span>
            <span className="text-white">_</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-sm text-sm leading-relaxed text-[#888]"
          >
            Access top-tier verified combat, strategy, and creative coaches for
            1-on-1 sessions. Track your verified hours and climb the national
            leaderboards.
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
                <p className="text-xs font-bold text-white">Need Assistance?</p>
                <p className="text-[11px] text-[#666]">Chat with support anytime</p>
              </div>
            </div>
            <a
              href="mailto:help@mastrive.com"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Contact Us
            </a>
          </div>

          {/* Secure verification notice */}
          <div className="gloss-helper-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Passwordless &amp; Secure</p>
                <p className="text-[11px] text-[#666]">Direct 6-digit code or magic link</p>
              </div>
            </div>
            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              Verified
            </span>
          </div>

          {/* Become instructor */}
          <div className="gloss-helper-card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#e01e37]/15 text-[#e01e37]">
                <UserPlus className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Are You a Coach?</p>
                <p className="text-[11px] text-[#666]">Earn ₹1,000–₹5,000/hr teaching</p>
              </div>
            </div>
            <Link
              href="/?tab=instructor"
              className="rounded-lg border border-[#e01e37]/30 bg-[#e01e37]/10 px-3 py-1.5 text-[11px] font-semibold text-[#e01e37] transition hover:bg-[#e01e37]/20"
            >
              Apply
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────
          RIGHT PANEL — auth form
      ───────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:px-10">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center justify-between w-full max-w-[460px] lg:hidden">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="MASTRIVE"
              width={120}
              height={30}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/?tab=instructor"
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
          >
            Become a Coach
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
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="gloss-btn-primary rounded-full px-5 py-2.5 text-xs font-bold text-white"
          >
            {mode === 'signin' ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="gloss-card w-full max-w-[460px] rounded-3xl p-7 sm:p-9"
        >
          {checkingAuth ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
              <p className="text-xs text-[#888]">Verifying session...</p>
            </div>
          ) : step === 'otp_verification' ? (
            /* ─────────────────────────────────────────────────────────────
               STEP 2: 6-DIGIT OTP VERIFICATION
            ───────────────────────────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#888] hover:text-white transition"
              >
                <ArrowLeft className="size-3.5" />
                <span>Edit email address</span>
              </button>

              <div>
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                  <ShieldCheck className="size-6" />
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  Enter Verification Code
                </h2>
                <p className="mt-1.5 text-xs text-[#888] leading-relaxed">
                  We sent a 6-digit code and secure link to{' '}
                  <span className="font-bold text-white">{email}</span>. Enter
                  the code below to verify immediately.
                </p>
              </div>

              {/* Status banner */}
              {message && (
                <div
                  className={`rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                    message.type === 'success'
                      ? 'border border-emerald-500/25 bg-emerald-500/08 text-emerald-300'
                      : message.type === 'info'
                      ? 'border border-blue-500/25 bg-blue-500/08 text-blue-300'
                      : 'border border-red-500/25 bg-red-500/08 text-red-300'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                    6-Digit Code
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtpCode(val)
                    }}
                    className="gloss-input h-14 w-full text-center font-mono text-2xl font-black tracking-[0.4em] text-white placeholder-[#333] outline-none transition focus:border-[#e01e37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="gloss-btn-primary flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-xl shadow-[#e01e37]/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Verify &amp; Enter</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend & alternative link actions */}
              <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-3 text-center">
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <span>Didn't receive the code?</span>
                  {resendCountdown > 0 ? (
                    <span className="font-mono text-[#666]">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleResendOtp}
                      className="inline-flex items-center gap-1 font-bold text-[#e01e37] hover:underline"
                    >
                      <RefreshCw className="size-3" />
                      <span>Resend code</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed">
                  Tip: You can also click the login link inside the email to
                  authenticate instantly.
                </p>
              </div>
            </motion.div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               STEP 1: LOGIN / REGISTRATION FORM WITH VALIDATION
            ───────────────────────────────────────────────────────────── */
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
                  onClick={() => switchMode('signin')}
                  className={`relative z-10 flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    mode === 'signin' ? 'text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
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
                  <div className="mt-7 mb-2">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/25 text-[#e01e37] mb-3">
                      <Sparkles className="size-5" />
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight">
                      {mode === 'signin'
                        ? 'Sign in to your account'
                        : 'Create your Mastrive account'}
                    </h2>
                    <p className="mt-1 text-xs text-[#888]">
                      {mode === 'signin'
                        ? 'Access your sessions, bookings, and dashboard.'
                        : 'Start learning with top-tier verified coaches.'}
                    </p>
                  </div>

                  {/* Smart Account Validation Banner */}
                  {accountBanner && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                        accountBanner.type === 'exists'
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {accountBanner.type === 'exists' ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                      )}
                      <span>{accountBanner.text}</span>
                    </motion.div>
                  )}

                  {/* General Status message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 rounded-2xl p-3.5 text-xs font-medium leading-relaxed ${
                        message.type === 'success'
                          ? 'border border-emerald-500/25 bg-emerald-500/08 text-emerald-300'
                          : message.type === 'info'
                          ? 'border border-blue-500/25 bg-blue-500/08 text-blue-300'
                          : 'border border-red-500/25 bg-red-500/08 text-red-300'
                      }`}
                    >
                      {message.text}
                    </motion.div>
                  )}

                  {/* Google 1-Click Auth */}
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    type="button"
                    className="gloss-btn-secondary mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-2xl text-xs sm:text-sm font-bold text-white disabled:opacity-50 active:scale-[0.98]"
                  >
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {mode === 'signin'
                        ? 'Continue with Google'
                        : 'Sign up with Google'}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-5 flex items-center justify-center">
                    <div className="w-full border-t border-white/[0.07]" />
                    <span className="absolute rounded-full border border-white/[0.07] bg-[#111] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#555]">
                      or continue with email
                    </span>
                  </div>

                  {/* Email & Details Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-3.5">
                    {/* Email Field (Always visible) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                          Email Address <span className="text-[#e01e37]">*</span>
                        </label>
                        {checkingAccount && (
                          <span className="text-[10px] text-[#888] animate-pulse">
                            Checking account...
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="yourname@gmail.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (accountBanner) setAccountBanner(null)
                          }}
                          onBlur={handleEmailBlur}
                          className="gloss-input h-12 w-full pl-11 pr-4 text-sm font-medium text-white placeholder-[#444] outline-none transition focus:border-[#e01e37]"
                        />
                      </div>
                    </div>

                    {/* Registration Fields: Necessary Details */}
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3.5 pt-1"
                      >
                        {/* Full Name */}
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                            Full Name <span className="text-[#e01e37]">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                            <input
                              type="text"
                              required={mode === 'signup'}
                              placeholder="e.g. Rahul Sharma"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="gloss-input h-12 w-full pl-11 pr-4 text-sm font-medium text-white placeholder-[#444] outline-none transition focus:border-[#e01e37]"
                            />
                          </div>
                        </div>

                        {/* Phone / WhatsApp */}
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                            Phone / WhatsApp Number{' '}
                            <span className="text-[#666] font-normal lowercase">
                              (for session bookings)
                            </span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="gloss-input h-12 w-full pl-11 pr-4 text-sm font-medium text-white placeholder-[#444] outline-none transition focus:border-[#e01e37]"
                            />
                          </div>
                        </div>

                        {/* City / Location & Primary Goal */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                              City / Region
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                              <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="gloss-input h-12 w-full pl-10 pr-4 text-xs font-medium text-white outline-none cursor-pointer appearance-none bg-[#0c0d12]"
                              >
                                {CITIES.map((c) => (
                                  <option key={c} value={c} className="bg-[#111] text-white">
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                              Focus Skill
                            </label>
                            <div className="relative">
                              <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#555]" />
                              <select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="gloss-input h-12 w-full pl-10 pr-4 text-xs font-medium text-white outline-none cursor-pointer appearance-none bg-[#0c0d12]"
                              >
                                {SKILL_GOALS.map((g) => (
                                  <option key={g} value={g} className="bg-[#111] text-white">
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <p className="text-[11px] leading-relaxed text-[#666] pt-1">
                      {mode === 'signup'
                        ? 'We will send a 6-digit code and instant access link to your email.'
                        : 'We will send a 6-digit sign-in code and magic link to your email.'}
                    </p>

                    <button
                      type="submit"
                      disabled={loading || checkingAccount}
                      className="gloss-btn-primary mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span>
                            {mode === 'signin'
                              ? 'Send Sign-In Code'
                              : 'Create Account & Send Code'}
                          </span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch mode footer */}
                  <div className="mt-5 text-center text-xs text-[#888]">
                    {mode === 'signin' ? (
                      <span>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('signup')}
                          className="font-bold text-white hover:text-[#e01e37] transition underline underline-offset-4"
                        >
                          Register now
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('signin')}
                          className="font-bold text-white hover:text-[#e01e37] transition underline underline-offset-4"
                        >
                          Sign in
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Back to Explore */}
                  <div className="mt-4 text-center">
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
    <Suspense
      fallback={
        <div className="min-h-screen radial-glow-crimson flex items-center justify-center text-white">
          <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}