'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Lock, MapPin, Video, ArrowRight, ArrowLeft, Calendar, Repeat } from 'lucide-react'

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

const DATES = [
  { day: 'THU', date: '20' },
  { day: 'FRI', date: '21' },
  { day: 'SAT', date: '22' },
  { day: 'SUN', date: '23' },
  { day: 'MON', date: '24' },
  { day: 'TUE', date: '25' },
  { day: 'WED', date: '26' },
]

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function BookingModal({ isOpen, onClose, instructor }: BookingModalProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [bookingType, setBookingType] = useState<'single' | 'monthly'>('single')
  const [mode, setMode] = useState<'in-person' | 'online'>('in-person')
  const [selectedDate, setSelectedDate] = useState('20')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [personCount, setPersonCount] = useState(1)
  const [title, setTitle] = useState('Mr.')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !instructor) return null

  const basePricePerSession = instructor.price
  const pricePerParticipant =
    bookingType === 'single'
      ? basePricePerSession
      : Math.round(basePricePerSession * 4 * 0.8)

  const totalPrice = pricePerParticipant * personCount

  const handleModalClose = () => {
    setStep(1)
    onClose()
  }

  const handleRazorpayPayment = async () => {
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
      handler: function (response: any) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`)
        handleModalClose()
      },
      prefill: {
        name: `${title} ${fullName}`,
        email: 'user@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#e52e42',
      },
    }

    const paymentObject = new (window as any).Razorpay(options)
    paymentObject.open()
  }

  // Render via React Portal straight onto body to escape local container layout flows
  return createPortal(
    <AnimatePresence>
      {isOpen && (
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
            className="relative z-10 my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12161f] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Book {instructor.name} — <span className="text-[#8b949e]">{instructor.skill}</span>
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#8b949e]">
                  <span className={`size-1.5 rounded-full ${step === 1 ? 'bg-[#e52e42]' : 'bg-white/30'}`} />
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
              <div className="space-y-6 md:col-span-7">
                {step === 1 ? (
                  <>
                    {/* Booking Type Toggle */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Booking Type
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#0d1117] p-1.5">
                        <button
                          type="button"
                          onClick={() => setBookingType('single')}
                          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                            bookingType === 'single'
                              ? 'bg-[#e52e42] text-white shadow-md'
                              : 'text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <Calendar className="size-3.5" />
                          Single Session
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingType('monthly')}
                          className={`relative flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                            bookingType === 'monthly'
                              ? 'bg-[#e52e42] text-white shadow-md'
                              : 'text-[#8b949e] hover:text-white'
                          }`}
                        >
                          <Repeat className="size-3.5" />
                          Monthly Pass
                          <span className="absolute -right-1 -top-1.5 flex h-4 items-center rounded-full bg-emerald-500 px-1.5 text-[9px] font-extrabold uppercase text-black">
                            20% OFF
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Session Mode */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Session Mode
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMode('in-person')}
                          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                            mode === 'in-person'
                              ? 'border-[#e52e42] bg-[#e52e42]/10 text-white'
                              : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <MapPin className="size-3.5 text-[#e52e42]" />
                            In-Person
                          </div>
                          <span className="mt-1 text-[10px] text-[#8b949e]">Studio / Park</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMode('online')}
                          className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                            mode === 'online'
                              ? 'border-[#e52e42] bg-[#e52e42]/10 text-white'
                              : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Video className="size-3.5 text-[#e52e42]" />
                            Live Online
                          </div>
                          <span className="mt-1 text-[10px] text-[#8b949e]">WebRTC Room</span>
                        </button>
                      </div>
                    </div>

                    {/* Select Date */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        {bookingType === 'monthly' ? 'Start Date' : 'Select Date'}
                      </span>
                      <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                        {DATES.map((item) => (
                          <button
                            key={item.date}
                            type="button"
                            onClick={() => setSelectedDate(item.date)}
                            className={`flex min-w-[50px] flex-col items-center rounded-xl border p-2.5 transition-all ${
                              selectedDate === item.date
                                ? 'border-[#e52e42] bg-[#e52e42]/10 text-white'
                                : 'border-white/10 bg-[#0d1117] text-[#8b949e] hover:border-white/20'
                            }`}
                          >
                            <span className="text-[10px] font-medium uppercase">{item.day}</span>
                            <span className="text-sm font-bold">{item.date}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Time Slot */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Select Time Slot
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`rounded-lg border py-2 text-center text-xs font-semibold transition-all ${
                              !slot.available
                                ? 'cursor-not-allowed border-white/5 bg-[#0d1117]/50 text-white/20 line-through'
                                : selectedTime === slot.time
                                ? 'border-[#e52e42] bg-[#e52e42] text-white'
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
                          className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e52e42]"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                          Title
                        </label>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e52e42]"
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
                          placeholder="e.g. 24"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e52e42]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#e52e42]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Order Summary & Action */}
              <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d1117] p-5 md:col-span-5">
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
                    <span className="font-semibold text-white">Thu, {selectedDate} Aug</span>
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

                  <div className="my-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-[11px] text-yellow-200/80">
                    <div className="flex gap-2">
                      <Lock className="size-4 shrink-0 text-yellow-500" />
                      <span>
                        Payment held securely in escrow until the session is completed — full refund if your instructor no-shows.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-xs uppercase text-[#8b949e]">Total</span>
                    <span className="text-2xl font-black text-white">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {step === 1 ? (
                    <button
                      type="button"
                      disabled={!selectedTime}
                      onClick={() => setStep(2)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e52e42] py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#d02538] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue to Details <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border border-white/10 bg-[#161b22] px-3 py-3 text-xs font-bold text-[#8b949e] transition-colors hover:text-white"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!fullName.trim() || !age}
                        onClick={handleRazorpayPayment}
                        className="w-full rounded-xl bg-[#e52e42] py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#d02538] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Confirm & Pay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}