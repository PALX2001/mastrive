'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Flame, X, ShieldCheck, Trophy, Filter, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { leaderboard as initialLeaderboard, tournaments, type LeaderboardEntry } from '@/lib/data'
import { TierBadge, XPMetric } from './leaderboard-tiers'
import { VerifiedProgressTrack } from './verified-progress-track'
import { createClient } from '@/lib/supabase/client'

interface Tournament {
  id: string
  name: string
  category: string
  entryFee: number
  prizePool: number
  date: string
}

const SKILLS_LIST = [
  'All Skills',
  'Fitness & Strength Coach',
  'Muay Thai Striking',
  'Kickboxing',
  'Fingerstyle Guitar',
  'Watercolour Landscapes',
  'Tournament Chess',
  'Python & DSA Bootcamp',
  'Vinyasa Yoga',
  'Piano Mastery',
  'Vocal Training',
  'Boxing',
]

const STATES_OPTIONS = [
  'Global',
  'Delhi NCR',
  'Gurgaon',
  'Mumbai',
  'Bengaluru',
  'Maharashtra',
  'Karnataka',
  'Haryana',
]

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

export function TournamentsView() {
  const [registered, setRegistered] = useState<Set<string>>(() => new Set())
  const [selectedState, setSelectedState] = useState<string>('Global')
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills')
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.full_name) {
        setUserName(data.user.user_metadata.full_name)
      } else if (data?.user?.email) {
        setUserName(data.user.email.split('@')[0])
      }
    })
  }, [])

  // Real-time live pulse XP simulation (simulating live session completions across India)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLeaderboard((prev) => {
        const randomIndex = Math.floor(Math.random() * prev.length)
        const updated = [...prev]
        const target = { ...updated[randomIndex] }
        const xpGain = Math.floor(Math.random() * 25) + 15
        target.xp += xpGain
        target.verifiedHrs += Math.random() > 0.6 ? 1 : 0
        updated[randomIndex] = target

        // Re-sort dynamically by XP and re-assign rank
        updated.sort((a, b) => b.xp - a.xp)
        return updated.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
      })
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  // Modal & Registration state
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [participant, setParticipant] = useState({
    name: '',
    email: '',
    phone: '',
    xpHandle: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const displayedLeaderboard = useMemo(() => {
    return liveLeaderboard.filter((item) => {
      // Skill filter
      let matchesSkill = true
      if (selectedSkill !== 'All Skills') {
        const itemSkill = (item.skill || item.category || '').trim().toLowerCase()
        const filterSkill = selectedSkill.trim().toLowerCase()
        matchesSkill = itemSkill.includes(filterSkill) || filterSkill.includes(itemSkill)
      }

      // State / Region filter
      let matchesState = true
      if (selectedState !== 'Global') {
        const itemState = (item.state || 'Delhi').trim().toLowerCase()
        const filterState = selectedState.trim().toLowerCase()
        if (filterState === 'delhi ncr' || filterState === 'delhi') {
          matchesState = itemState.includes('delhi') || itemState.includes('gurgaon') || !!item.isUser
        } else {
          matchesState = itemState === filterState || !!item.isUser
        }
      }

      return matchesSkill && matchesState
    })
  }, [liveLeaderboard, selectedSkill, selectedState])

  // Open Registration Modal
  const handleOpenRegistration = useCallback((t: Tournament) => {
    if (registered.has(t.id)) return
    setSelectedTournament(t)
  }, [registered])

  // Handle Form Submission -> Razorpay Checkout Trigger
  const handleProceedToPayment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTournament) return

    setIsProcessing(true)

    const isLoaded = await loadRazorpayScript()
    if (!isLoaded) {
      alert('Failed to load Razorpay payment gateway. Please check your network.')
      setIsProcessing(false)
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: selectedTournament.entryFee * 100, // Amount in paise
      currency: 'INR',
      name: 'MASTRIVE',
      description: `Registration for ${selectedTournament.name}`,
      image: '/logo.svg',
      handler: function (response: any) {
        setRegistered((prev) => new Set(prev).add(selectedTournament.id))
        setSelectedTournament(null)
        setIsProcessing(false)
        setParticipant({ name: '', email: '', phone: '', xpHandle: '' })
        alert(`Registration & Payment Successful! Payment ID: ${response.razorpay_payment_id}`)
      },
      prefill: {
        name: participant.name,
        email: participant.email,
        contact: participant.phone,
      },
      notes: {
        tournament_id: selectedTournament.id,
        xp_handle: participant.xpHandle,
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

    const razorpayWindow = new (window as any).Razorpay(options)
    razorpayWindow.open()
  }, [selectedTournament, participant])

  const currentUser = useMemo(() => {
    const userEntry = liveLeaderboard.find((item) => item.isUser)
    return {
      rank: userEntry?.rank || 2,
      name: userName || userEntry?.name || 'Your Profile',
      category: userEntry?.category || 'Fitness & Combat',
      skill: userEntry?.skill || 'Strength Training',
      state: userEntry?.state || 'Delhi',
      xp: userEntry?.xp || 1200,
      verifiedHrs: userEntry?.verifiedHrs || 18,
      status: 'rising' as const,
      isUser: true,
    }
  }, [liveLeaderboard, userName])

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 selection:bg-[#e01e37] selection:text-white">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#f0f6fc] sm:text-3xl">
            Showdowns, Leagues & Tournaments
            <Flame className="size-6 text-[#e01e37]" aria-hidden />
          </h2>
          <p className="mt-2 text-pretty leading-relaxed text-[#8b949e]">
            Test your skills in real competitions, log verified training hours, and earn your shot at becoming a certified{' '}
            <span className="font-serif italic text-[#f0f6fc]">
              paid instructor
            </span>.
          </p>
        </div>
      </div>

      {/* Tournament Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tournaments.map((t, idx) => {
          const isRegistered = registered.has(t.id)
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="flex flex-col justify-between h-full rounded-3xl border border-white/10 bg-[#12161f]/90 p-6 shadow-xl backdrop-blur-xl"
            >
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#e01e37]">
                  {t.category}
                </span>
                <h3 className="mt-2 text-lg font-bold leading-snug text-[#f0f6fc] min-h-[52px] flex items-start">
                  {t.name}
                </h3>

                <dl className="mt-4 space-y-2 text-sm border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b949e]">Entry Fee</dt>
                    <dd className="font-semibold text-[#f0f6fc]">
                      ₹{t.entryFee.toLocaleString('en-IN')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b949e]">Prize Pool</dt>
                    <dd className="font-extrabold text-[#e01e37]">
                      ₹{t.prizePool.toLocaleString('en-IN')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#8b949e]">Date</dt>
                    <dd className="font-medium text-[#f0f6fc]">{t.date}</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={() => handleOpenRegistration(t)}
                disabled={isRegistered}
                className={`mt-6 w-full rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  isRegistered
                    ? 'cursor-default border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#e01e37] text-white shadow-lg shadow-[#e01e37]/25 hover:bg-[#c0182f]'
                }`}
              >
                {isRegistered ? 'Registered ✓' : 'Register Now'}
              </button>
            </motion.article>
          )
        })}
      </div>

      {/* Registration Details & Payment Popup Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setSelectedTournament(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#141822] p-6 sm:p-7 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#e01e37]">
                    Confirm Registration
                  </span>
                  <h3 className="text-lg font-bold text-[#f0f6fc]">
                    {selectedTournament.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTournament(null)}
                  disabled={isProcessing}
                  className="rounded-full p-1.5 text-[#8b949e] hover:bg-white/10 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Tournament Summary */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-[#0b0e14] p-3.5 text-xs">
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <Trophy className="size-4 text-[#e01e37]" />
                  <span>Entry Fee</span>
                </div>
                <span className="text-base font-extrabold text-[#f0f6fc]">
                  ₹{selectedTournament.entryFee.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Detail Input Form */}
              <form onSubmit={handleProceedToPayment} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={participant.name}
                    onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2.5 text-xs text-[#f0f6fc] placeholder-[#8b949e]/50 outline-none focus:border-[#e01e37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={participant.email}
                    onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2.5 text-xs text-[#f0f6fc] placeholder-[#8b949e]/50 outline-none focus:border-[#e01e37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e]">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={participant.phone}
                      onChange={(e) => setParticipant({ ...participant, phone: e.target.value })}
                      placeholder="9876543210"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2.5 text-xs text-[#f0f6fc] placeholder-[#8b949e]/50 outline-none focus:border-[#e01e37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8b949e]">XP Handle / Game ID</label>
                    <input
                      type="text"
                      required
                      value={participant.xpHandle}
                      onChange={(e) => setParticipant({ ...participant, xpHandle: e.target.value })}
                      placeholder="@handle"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 py-2.5 text-xs text-[#f0f6fc] placeholder-[#8b949e]/50 outline-none focus:border-[#e01e37]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#e01e37]/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    <ShieldCheck className="size-4" />
                    {isProcessing ? 'Opening Payment...' : `Proceed to Pay ₹${selectedTournament.entryFee}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REAL-TIME LEADERBOARD SECTION */}
      {/* ========================================================================= */}
      <div className="mt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight text-[#f0f6fc]">
              {selectedSkill === 'All Skills' ? '' : `${selectedSkill} • `}
              {selectedState === 'Global' ? 'Global Leaderboard' : `${selectedState} Leaderboard`}
            </h3>
            <p className="mt-1 text-xs text-[#8b949e]">
              {selectedState === 'Global'
                ? 'Real learners, athletes, and creators putting in the work. Ranked by verified practice hours & tournament wins.'
                : `Verified practitioners and local talent training in ${selectedState}.`}
            </p>
          </div>

          {/* Skill Filter & Region Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Skill Filter Dropdown with Filter Icon */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#12161f] px-3.5 py-1.5 shadow-sm hover:border-white/20 transition">
              <Filter className="size-3.5 text-[#e01e37]" />
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#f0f6fc] outline-none cursor-pointer pr-1"
              >
                {SKILLS_LIST.map((sk) => (
                  <option key={sk} value={sk} className="bg-[#12161f] text-white">
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* State / Region Dropdown (Global by default) */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#12161f] px-3.5 py-1.5 shadow-sm hover:border-white/20 transition">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#f0f6fc] outline-none cursor-pointer pr-1"
              >
                {STATES_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-[#12161f] text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User Verified Hours & Mastery Progress Track */}
        <div className="mt-6">
          <VerifiedProgressTrack
            verifiedHrs={currentUser.verifiedHrs}
            userName={currentUser.name}
            userSkill={currentUser.skill}
            rank={currentUser.rank}
            xp={currentUser.xp}
          />
        </div>

        {/* Leaderboard Table Container */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#12161f]/90 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase font-bold tracking-wider text-[#8b949e] bg-[#0b0e14]/50">
                  <th className="w-16 px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Learner / Athlete</th>
                  <th className="px-4 py-3.5">Skill / Discipline</th>
                  <th className="px-4 py-3.5 text-right">XP Points</th>
                  <th className="px-4 py-3.5 text-right">Verified Hrs</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Tier Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {displayedLeaderboard.length > 0 ? (
                  displayedLeaderboard.map((row) => (
                    <tr
                      key={`${row.name}-${row.rank}`}
                      className={`transition-colors ${
                        row.isUser
                          ? 'bg-[#e01e37]/15 border-l-2 border-l-[#e01e37]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                            row.rank === 1
                              ? 'bg-[#e01e37] text-white shadow-lg shadow-[#e01e37]/40 ring-2 ring-[#e01e37]/30'
                              : row.rank === 2
                              ? 'bg-amber-500 text-black font-extrabold'
                              : row.rank === 3
                              ? 'bg-neutral-300 text-black font-extrabold'
                              : 'bg-white/10 text-[#8b949e]'
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-[#f0f6fc]">
                        <div className="flex items-center gap-2">
                          <span>{row.isUser && userName ? userName : row.name}</span>
                          {row.isUser && (
                            <span className="rounded-full bg-[#e01e37] px-2 py-0.5 text-[9px] font-extrabold text-white">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-[#f0f6fc]/80">
                        <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                          {row.skill || row.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <XPMetric xp={row.xp} />
                      </td>

                      <td className="px-4 py-4 text-right tabular-nums text-xs text-[#8b949e]">
                        {row.verifiedHrs} hrs
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="flex justify-end">
                          <TierBadge xp={row.xp} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[#8b949e]">
                      No rankings found for this skill/region filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}