'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Lock, ArrowRight, ArrowLeft, Calendar, Repeat, Tag, Check, AlertCircle, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface BookingInstructor {
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
  const [step, setStep] = useState<1 | 2>(1)
  const [bookingType, setBookingType] = useState<'single' | 'monthly'>('single')
  const [mode, setMode] = useState<'in-person' | 'online'>('in-person')
  
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
    onClose()
  }, [handleRemoveCoupon, onClose])

  const handleRazorpayPayment = useCallback(async () => {
    if (!instructor) return

    const isLoaded = await loadRazorpayScript()

    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.')
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: totalPrice * 100,
      currency: 'INR',
      name: 'MASTRIVE',
      description: `${bookingType === 'monthly' ? 'Monthly Pass' : 'Single Session'} with ${instructor.name} (${personCount} participant)`,
      image: '/logo.svg',
      handler: function (response: any) {
        alert(`Booking Confirmed & Payment Successful! Payment ID: ${response.razorpay_payment_id}`)
        handleModalClose()
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
    }

    const paymentObject = new (window as any).Razorpay(options)
    paymentObject.open()
  }, [instructor, totalPrice, bookingType, personCount, title, fullName, email, phone, selectedDateObj, selectedTime, mode, handleModalClose])

  if (!mounted || !instructor || !isOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
        {/* Backdrop Click Layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="absolute inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 my-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-[#12161f] p-6 shadow-2xl backdrop-blur-xl sm:p-8 transform-gpu"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Book {instructor.name} — <span className="text-[#8b949e]">{instructor.skill}</span>
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#8b949e]">
                <span className={`size-1.5 rounded-full ${step === 1 ? 'bg-[#e01e37]' : 'bg-white/30'}`} />
                Step {step} of 2: {step === 1 ? 'Schedule & Mode' : 'Participant Details'}
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#161b22] text-[#8b949e] transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Grid Layout */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Left Column: Form Controls */}
            <div className="space-y-5 md:col-span-7">
              {step === 1 ? (
                <>
                  {/* Booking Type Toggle */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                      Booking Type
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0d1117] p-1.5">
                      <button
                        type="button"
                        onClick={() => setBookingType('single')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                          bookingType === 'single'
                            ? 'bg-[#e01e37] text-white shadow-md'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        <Calendar className="size-3.5" />
                        Single Session
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingType('monthly')}
                        className={`relative flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                          bookingType === 'monthly'
                            ? 'bg-[#e01e37] text-white shadow-md'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        <Repeat className="size-3.5" />
                        Monthly Pass
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                          20% OFF
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                      Session Format
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0d1117] p-1.5">
                      <button
                        type="button"
                        onClick={() => setMode('in-person')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                          mode === 'in-person'
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        Studio / In-Person
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('online')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                          mode === 'online'
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        Live 1-on-1 Stream
                      </button>
                    </div>
                  </div>

                  {/* Upcoming Date Picker */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                      Select Date ({selectedDateObj.month})
                    </span>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {dynamicDates.map((item) => {
                        const isSelected = selectedDateObj.id === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedDateObj(item)}
                            className={`flex min-w-[58px] flex-col items-center rounded-2xl border py-2.5 transition-all ${
                              isSelected
                                ? 'border-[#e01e37] bg-[#e01e37] text-white shadow-lg shadow-[#e01e37]/30'
                                : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{item.day}</span>
                            <span className="text-base font-extrabold">{item.date}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                      Available Time Slots
                    </span>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-xl border py-2 text-center text-xs font-semibold transition-all ${
                            !slot.available
                              ? 'cursor-not-allowed border-white/5 bg-[#0d1117]/50 text-white/20 line-through'
                              : selectedTime === slot.time
                              ? 'border-[#e01e37] bg-[#e01e37] text-white shadow-md'
                              : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Persons
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={personCount}
                        onChange={(e) => setPersonCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Title
                      </label>
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Mx.">Mx.</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="24"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                      Full Name <span className="text-[#e01e37]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8b949e]" />
                        <input
                          type="email"
                          placeholder="rahul@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#0d1117] pl-9 pr-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        WhatsApp Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#8b949e]" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#0d1117] pl-9 pr-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e01e37]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Order Summary & Action */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1117] p-5 md:col-span-5">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Instructor</span>
                  <span className="font-semibold text-white">{instructor.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Plan</span>
                  <span className="font-semibold text-emerald-400">
                    {bookingType === 'single' ? 'Single Session' : 'Monthly Pass (4x)'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Mode</span>
                  <span className="font-semibold capitalize text-white">{mode}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">{bookingType === 'monthly' ? 'Start Date' : 'Date'}</span>
                  <span className="font-semibold text-white">{selectedDateObj.fullLabel}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Time</span>
                  <span className="font-semibold text-white">{selectedTime || '—'}</span>
                </div>
                {step === 2 && (
                  <div className="flex justify-between border-t border-white/5 pt-2 text-xs">
                    <span className="text-[#8b949e]">Participants</span>
                    <span className="font-semibold text-white">
                      {personCount}x ({title} {fullName || 'Guest'})
                    </span>
                  </div>
                )}

                <div className="my-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-200/90">
                  <div className="flex gap-2">
                    <Lock className="size-4 shrink-0 text-emerald-400" />
                    <span>
                      100% Escrow Protected: Funds released only after the session. Full refund on cancellation.
                    </span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="border-t border-white/10 pt-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">
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
                        className="text-[11px] text-[#8b949e] hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. GROUP2 or BATCH4"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value)
                            setCouponError('')
                          }}
                          className="w-full rounded-xl border border-white/10 bg-[#161b22] px-3 py-1.5 text-xs uppercase text-white outline-none focus:border-[#e01e37]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="rounded-xl border border-white/10 bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e01e37] hover:border-[#e01e37]"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                          <AlertCircle className="size-3" />
                          {couponError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {appliedCoupon && (
                  <div className="mb-1 flex justify-between text-xs text-[#8b949e]">
                    <span>Original</span>
                    <span className="line-through">₹{rawTotalPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-xs uppercase text-[#8b949e]">Total</span>
                  <span className="text-2xl font-black text-white">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {step === 1 ? (
                  <button
                    type="button"
                    disabled={!selectedTime}
                    onClick={() => setStep(2)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e01e37] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#e01e37]/30 transition-all hover:bg-[#c0182f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to Details <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl border border-white/10 bg-[#161b22] px-3.5 py-3 text-xs font-bold text-[#8b949e] transition-colors hover:text-white active:scale-95"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={!fullName.trim()}
                      onClick={handleRazorpayPayment}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#e01e37]/30 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirm & Pay ₹{totalPrice.toLocaleString('en-IN')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}