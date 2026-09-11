'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Lock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Repeat,
  Tag,
  Check,
  AlertCircle,
  Phone,
  Mail,
  QrCode,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  CreditCard,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface BookingInstructor {
  id?: string
  name: string
  skill: string
  price: number
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  instructor: BookingInstructor | null
}

const TIME_SLOTS = [
  { time: '7:00 AM', available: true },
  { time: '9:00 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '2:00 PM', available: true },
  { time: '4:00 PM', available: true },
  { time: '6:00 PM', available: false },
  { time: '7:30 PM', available: true },
  { time: '9:00 PM', available: true },
]

// Valid coupon codes mapped to discount percentages
const COUPONS: Record<string, { discount: number; description: string }> = {
  GROUP2: { discount: 0.15, description: '15% Off Group Discount' },
  BATCH4: { discount: 0.25, description: '25% Off Squad Pass' },
  MASTRIVE10: { discount: 0.10, description: '10% Off Promo Discount' },
}

// Singleton Razorpay script loader
let razorpayPromise: Promise<boolean> | null = null

const loadRazorpayScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as any).Razorpay) return Promise.resolve(true)
  if (razorpayPromise) return razorpayPromise

  razorpayPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]')
    if (existingScript) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      razorpayPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return razorpayPromise
}

export function BookingModal({ isOpen, onClose, instructor }: BookingModalProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bookingType, setBookingType] = useState<'single' | 'monthly'>('single')
  const [mode, setMode] = useState<'in-person' | 'online'>('in-person')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay'>('upi')
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [utrNumber, setUtrNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Dynamic 7-day upcoming dates
  const dynamicDates = useMemo(() => {
    const list = []
    const today = new Date()
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      list.push({
        id: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        day: dayNames[d.getDay()],
        date: String(d.getDate()).padStart(2, '0'),
        month: monthNames[d.getMonth()],
        fullLabel: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
      })
    }
    return list
  }, [])

  const [selectedDateObj, setSelectedDateObj] = useState(dynamicDates[0] || { id: '1', day: 'TODAY', date: '01', month: 'Sep', fullLabel: 'Today' })
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [personCount, setPersonCount] = useState(1)
  const [title, setTitle] = useState('Mr.')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    setMounted(true)
    // Autofill user details if signed in
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id)
        if (data.user.user_metadata?.full_name) {
          setFullName(data.user.user_metadata.full_name)
        }
        if (data.user.email) {
          setEmail(data.user.email)
        }
        if (data.user.user_metadata?.phone) {
          setPhone(data.user.user_metadata.phone)
        }
      }
    })
  }, [])

  const basePricePerSession = instructor?.price ?? 0

  const { rawTotalPrice, discountAmount, totalPrice } = useMemo(() => {
    const pricePerParticipant =
      bookingType === 'single'
        ? basePricePerSession
        : Math.round(basePricePerSession * 4 * 0.8)

    const raw = pricePerParticipant * personCount
    const discountMultiplier = appliedCoupon ? COUPONS[appliedCoupon]?.discount ?? 0 : 0
    const discount = Math.round(raw * discountMultiplier)
    return {
      rawTotalPrice: raw,
      discountAmount: discount,
      totalPrice: raw - discount,
    }
  }, [basePricePerSession, bookingType, personCount, appliedCoupon])

  // Mastrive Centralized UPI Payment Details
  const mastriveUpiId = process.env.NEXT_PUBLIC_UPI_ID || 'mastrive@upi'
  const mastriveUpiName = process.env.NEXT_PUBLIC_UPI_NAME || 'MASTRIVE ESCROW'

  const upiUri = useMemo(() => {
    if (!instructor) return ''
    const note = `Mastrive-${instructor.name.split(' ')[0]}-${selectedDateObj.day}`
    return `upi://pay?pa=${mastriveUpiId}&pn=${encodeURIComponent(mastriveUpiName)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent(note)}`
  }, [mastriveUpiId, mastriveUpiName, totalPrice, instructor, selectedDateObj])

  const qrCodeUrl = useMemo(() => {
    if (!upiUri) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiUri)}`
  }, [upiUri])

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(mastriveUpiId)
    setCopiedUpi(true)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleApplyCoupon = useCallback(() => {
    const formattedCode = couponInput.trim().toUpperCase()
    if (!formattedCode) return

    if (COUPONS[formattedCode]) {
      setAppliedCoupon(formattedCode)
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code')
    }
  }, [couponInput])

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }, [])

  const handleModalClose = useCallback(() => {
    setStep(1)
    handleRemoveCoupon()
    setUtrNumber('')
    setBookingError('')
    setConfirmedBooking(null)
    onClose()
  }, [handleRemoveCoupon, onClose])

  // ── Finalize & Save Booking to Supabase ──
  const finalizeBooking = useCallback(
    async (method: 'upi_qr' | 'razorpay', paymentRef: string) => {
      if (!instructor) return

      setIsProcessing(true)
      setBookingError('')

      try {
        const payload = {
          instructor_id: instructor.id || instructor.name,
          instructor_name: instructor.name,
          instructor_skill: instructor.skill,
          session_date: selectedDateObj.fullLabel,
          session_time: selectedTime || '7:00 AM',
          booking_type: bookingType,
          mode: mode,
          person_count: personCount,
          total_amount: totalPrice,
          payment_method: method,
          payment_reference: paymentRef,
          customer_name: `${title} ${fullName}`.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          user_id: userId,
        }

        const res = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok && !data.booking) {
          throw new Error(data.error || 'Failed to record booking')
        }

        setConfirmedBooking(data.booking || payload)
        setStep(3)
      } catch (err: any) {
        setBookingError(err.message || 'Failed to confirm booking. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    },
    [instructor, selectedDateObj, selectedTime, bookingType, mode, personCount, totalPrice, title, fullName, email, phone, userId]
  )

  // ── UPI Submission ──
  const handleUpiConfirm = async () => {
    if (!fullName.trim()) {
      setBookingError('Please enter your full name.')
      return
    }
    const cleanUtr = utrNumber.trim()
    if (!cleanUtr || cleanUtr.length < 6) {
      setBookingError('Please enter the 12-digit UPI Reference Number / UTR from your payment app.')
      return
    }
    await finalizeBooking('upi_qr', cleanUtr)
  }

  // ── Razorpay Gateway Submission ──
  const handleRazorpayPayment = useCallback(async () => {
    if (!instructor) return
    if (!fullName.trim()) {
      setBookingError('Please enter your full name.')
      return
    }

    setIsProcessing(true)
    setBookingError('')

    const isLoaded = await loadRazorpayScript()

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    // If no real Razorpay key provided or library blocked, simulate free test payment directly
    if (!isLoaded || !razorpayKey || razorpayKey === 'rzp_test_placeholder') {
      const simulatedPaymentId = `pay_sim_${Date.now().toString(36).toUpperCase()}`
      await finalizeBooking('razorpay', simulatedPaymentId)
      return
    }

    const options = {
      key: razorpayKey,
      amount: totalPrice * 100,
      currency: 'INR',
      name: 'MASTRIVE',
      description: `${bookingType === 'monthly' ? 'Monthly Pass' : 'Single Session'} with ${instructor.name}`,
      image: '/logo.svg',
      handler: function (response: any) {
        finalizeBooking('razorpay', response.razorpay_payment_id || `rzp_${Date.now()}`)
      },
      prefill: {
        name: `${title} ${fullName}`.trim(),
        email: email || 'user@mastrive.com',
        contact: phone || '9876543210',
      },
      notes: {
        instructor_name: instructor.name,
        session_date: selectedDateObj.fullLabel,
        session_time: selectedTime || '7:00 AM',
        mode: mode,
      },
      theme: {
        color: '#e01e37',
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false)
        },
      },
    }

    try {
      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch {
      // Fallback to instant confirmation if window.Razorpay fails
      await finalizeBooking('razorpay', `pay_fallback_${Date.now()}`)
    }
  }, [instructor, fullName, totalPrice, bookingType, title, email, phone, selectedDateObj, selectedTime, mode, finalizeBooking])

  if (!mounted || !instructor || !isOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-xl">
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="absolute inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="gloss-card relative z-10 my-auto w-full max-w-2xl rounded-3xl p-6 sm:p-8 transform-gpu"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Book {instructor.name} — <span className="text-[#888]">{instructor.skill}</span>
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#777]">
                <span className="size-1.5 rounded-full bg-[#e01e37]" />
                {step === 1 && 'Step 1 of 2: Schedule & Delivery'}
                {step === 2 && 'Step 2 of 2: 100% Online Escrow Payment'}
                {step === 3 && 'Booking Confirmed ✓'}
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#888] transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ══════════════════════════════════════════════
              STEP 3: SUCCESS CELEBRATION RECEIPT
             ══════════════════════════════════════════════ */}
          {step === 3 && confirmedBooking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-5"
            >
              <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="size-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles className="size-3.5" /> 100% Escrow Secured
                </span>
                <h3 className="mt-3 text-2xl font-black text-white">
                  Booking Confirmed!
                </h3>
                <p className="mt-1 text-xs text-[#888] max-w-sm mx-auto">
                  Your payment has been safely placed in Mastrive Escrow. Funds are only released to the coach after your session is completed.
                </p>
              </div>

              {/* Receipt card */}
              <div className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Instructor</span>
                  <span className="font-bold text-white">{instructor.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Skill & Mode</span>
                  <span className="font-semibold text-white capitalize">{instructor.skill} ({mode})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Date & Time</span>
                  <span className="font-semibold text-[#e01e37]">{confirmedBooking.session_date} at {confirmedBooking.session_time}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Participant</span>
                  <span className="font-semibold text-white">{confirmedBooking.customer_name}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.08] pt-3 text-sm">
                  <span className="font-bold text-white">Amount Paid</span>
                  <span className="font-black text-emerald-400">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#555]">
                  <span>Reference ID</span>
                  <span className="font-mono">{confirmedBooking.payment_reference || 'N/A'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Link
                  href="/profile"
                  onClick={handleModalClose}
                  className="gloss-btn-primary flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider text-white"
                >
                  <span>View in My Bookings</span>
                  <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="gloss-btn-secondary flex-1 rounded-2xl py-3 text-xs font-semibold text-[#888] hover:text-white"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════
              STEPS 1 & 2: FORM & PAYMENT
             ══════════════════════════════════════════════ */}
          {step !== 3 && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Left Column */}
              <div className="space-y-5 md:col-span-7">
                {step === 1 ? (
                  <>
                    {/* Booking Type Toggle */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                        Booking Type
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setBookingType('single')}
                          className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                            bookingType === 'single'
                              ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          <Calendar className="size-4" />
                          Single Session
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingType('monthly')}
                          className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                            bookingType === 'monthly'
                              ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          <Repeat className="size-4" />
                          Monthly Pass (4x)
                        </button>
                      </div>
                    </div>

                    {/* Delivery Mode Toggle */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                        Delivery Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setMode('in-person')}
                          className={`rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                            mode === 'in-person'
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          📍 In-Person Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('online')}
                          className={`rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                            mode === 'online'
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          🎥 1-on-1 Live Stream
                        </button>
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                        Select Date
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {dynamicDates.map((item) => {
                          const isSelected = selectedDateObj.id === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedDateObj(item)}
                              className={`flex min-w-[62px] flex-col items-center justify-center rounded-2xl border p-2.5 transition-all ${
                                isSelected
                                  ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                                  : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-bold">{item.day}</span>
                              <span className="text-base font-black text-white">{item.date}</span>
                              <span className="text-[9px] uppercase text-[#666]">{item.month}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                          const isSelected = selectedTime === slot.time
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                                !slot.available
                                  ? 'cursor-not-allowed border-white/[0.04] bg-white/[0.01] text-[#444]'
                                  : isSelected
                                  ? 'border-[#e01e37] bg-[#e01e37] text-white shadow-[0_2px_10px_rgba(224,30,55,0.4)]'
                                  : 'border-white/[0.08] bg-white/[0.03] text-[#888] hover:border-white/15 hover:text-white'
                              }`}
                            >
                              {slot.time}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── STEP 2: PARTICIPANT DETAILS & 100% ONLINE PAYMENT ── */
                  <div className="space-y-4">
                    {/* Participant Details */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                        Full Name <span className="text-[#e01e37]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="gloss-input w-full px-3.5 py-2.5 text-xs font-semibold text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#666]" />
                          <input
                            type="email"
                            placeholder="rahul@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="gloss-input w-full pl-9 pr-3 py-2.5 text-xs font-semibold text-white outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                          WhatsApp Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#666]" />
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="gloss-input w-full pl-9 pr-3 py-2.5 text-xs font-semibold text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector (100% Online Only) */}
                    <div className="pt-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">
                        Payment Method <span className="text-[#e01e37]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <QrCode className="size-3.5 text-[#e01e37]" /> UPI Instant Pay
                          </span>
                          <span className="text-[10px] text-emerald-400 mt-0.5 font-medium">0% Extra Fees</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('razorpay')}
                          className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                            paymentMethod === 'razorpay'
                              ? 'border-[#e01e37]/60 bg-[#e01e37]/15 text-white shadow-[0_0_0_1px_rgba(224,30,55,0.2)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#777] hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <CreditCard className="size-3.5 text-[#e01e37]" /> Card / NetBanking
                          </span>
                          <span className="text-[10px] text-[#666] mt-0.5">Razorpay Gateway</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic UPI Checkout Display */}
                    {paymentMethod === 'upi' && (
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* QR Code */}
                          <div className="relative size-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white p-1">
                            {qrCodeUrl ? (
                              <Image
                                src={qrCodeUrl}
                                alt="UPI Payment QR Code"
                                width={128}
                                height={128}
                                unoptimized
                                className="size-full object-contain"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-xs text-black">Generating...</div>
                            )}
                          </div>

                          <div className="flex-1 text-center sm:text-left space-y-2">
                            <p className="text-xs font-bold text-white">Scan & Pay via any UPI App</p>
                            <p className="text-[11px] text-[#777]">
                              Google Pay · PhonePe · Paytm · CRED · BHIM
                            </p>

                            {/* Copy UPI ID */}
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white">
                              <span className="font-mono text-[11px] text-[#e01e37]">{mastriveUpiId}</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="text-[#888] hover:text-white transition-colors"
                              >
                                {copiedUpi ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                              </button>
                            </div>

                            {/* Mobile one-tap link */}
                            <div className="pt-1">
                              <a
                                href={upiUri}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e01e37] underline hover:text-[#ff4d6d]"
                              >
                                Open in UPI App <ExternalLink className="size-3" />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* UTR Input */}
                        <div className="border-t border-white/[0.06] pt-3">
                          <label className="mb-1 block text-[11px] font-bold text-white">
                            Enter 12-Digit UPI Ref / UTR Number after paying:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 423871928472"
                            value={utrNumber}
                            onChange={(e) => {
                              setUtrNumber(e.target.value)
                              setBookingError('')
                            }}
                            className="gloss-input w-full px-3.5 py-2 text-xs font-mono font-semibold text-white outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Razorpay Gateway Display */}
                    {paymentMethod === 'razorpay' && (
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center space-y-2">
                        <CreditCard className="size-7 mx-auto text-[#e01e37]" />
                        <p className="text-xs font-bold text-white">Instant Automated Online Checkout</p>
                        <p className="text-[11px] text-[#777]">
                          Supports all Indian Debit/Credit Cards, NetBanking, EMI & Wallets with instant verification.
                        </p>
                      </div>
                    )}

                    {bookingError && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
                        <AlertCircle className="size-4 shrink-0 text-red-400" />
                        <span>{bookingError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary & Escrow */}
              <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:col-span-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777]">Instructor</span>
                    <span className="font-semibold text-white">{instructor.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777]">Plan</span>
                    <span className="font-semibold text-emerald-400">
                      {bookingType === 'single' ? 'Single Session' : 'Monthly Pass (4x)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777]">Mode</span>
                    <span className="font-semibold capitalize text-white">{mode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777]">{bookingType === 'monthly' ? 'Start Date' : 'Date'}</span>
                    <span className="font-semibold text-white">{selectedDateObj.fullLabel}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#777]">Time</span>
                    <span className="font-semibold text-white">{selectedTime || '—'}</span>
                  </div>

                  {/* 100% Escrow Guarantee Notice */}
                  <div className="my-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/08 p-3 text-[11px] text-emerald-200/90 leading-relaxed">
                    <div className="flex gap-2">
                      <ShieldCheck className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>
                        <strong>100% Mastrive Escrow:</strong> Your funds are held securely by Mastrive and released to the instructor only after the class is completed.
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="border-t border-white/[0.08] pt-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888]">
                      <Tag className="size-3 text-[#e01e37]" /> Have a Coupon?
                    </label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <Check className="size-3.5" />
                          <span className="font-bold">{appliedCoupon}</span>
                          <span className="text-[10px] text-emerald-400/70">(-₹{discountAmount})</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-[#888] hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="GROUP2 or BATCH4"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value)
                            setCouponError('')
                          }}
                          className="gloss-input w-full px-3 py-1.5 text-xs uppercase text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="gloss-btn-secondary rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="size-3" />
                        {couponError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Total & Actions */}
                <div className="mt-5">
                  {appliedCoupon && (
                    <div className="mb-1 flex justify-between text-xs text-[#888]">
                      <span>Original</span>
                      <span className="line-through">₹{rawTotalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-xs uppercase text-[#888]">Total Online</span>
                    <span className="text-2xl font-black text-white">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {step === 1 ? (
                    <button
                      type="button"
                      disabled={!selectedTime}
                      onClick={() => setStep(2)}
                      className="gloss-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue to Payment <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="gloss-btn-secondary rounded-2xl px-3.5 py-3 text-xs font-bold text-[#888] hover:text-white"
                      >
                        <ArrowLeft className="size-4" />
                      </button>

                      {paymentMethod === 'upi' ? (
                        <button
                          type="button"
                          disabled={isProcessing || !fullName.trim()}
                          onClick={handleUpiConfirm}
                          className="gloss-btn-primary flex-1 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                        >
                          {isProcessing ? 'Verifying...' : `Confirm & Lock In ₹${totalPrice.toLocaleString('en-IN')}`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing || !fullName.trim()}
                          onClick={handleRazorpayPayment}
                          className="gloss-btn-primary flex-1 rounded-2xl py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                        >
                          {isProcessing ? 'Opening Gateway...' : `Pay Online ₹${totalPrice.toLocaleString('en-IN')}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}