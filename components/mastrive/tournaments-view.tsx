'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'
import { motion } from 'motion/react'
import { leaderboard, tournaments } from '@/lib/data'
import { TierBadge, XPMetric } from './leaderboard-tiers'

export function TournamentsView() {
  const [registered, setRegistered] = useState<Set<string>>(new Set())
  const [activeScope, setActiveScope] = useState<'state' | 'global'>('state')
  const [selectedState, setSelectedState] = useState<string>('Delhi')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const toggleRegister = (id: string) =>
    setRegistered((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Extract unique categories from data or define them explicitly
  const categories = ['All', 'Music & Arts', 'Fitness & Combat', 'Strategy & Tech', 'Lifestyle']

  const displayedLeaderboard = leaderboard.filter((item) => {
    // Filter by Category
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    
    // Filter by State / Global Scope
    if (activeScope === 'global') return matchesCategory
    const itemState = (item as any).state || 'Delhi'
    const matchesState = itemState === selectedState || item.isUser

    return matchesCategory && matchesState
  })

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-2xl">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#f0f6fc] sm:text-3xl">
          The Supply Flywheel
          <Flame className="size-6 text-[#e01e37]" aria-hidden />
        </h2>
        <p className="mt-2 text-pretty leading-relaxed text-[#8b949e]">
          Compete, climb the leaderboard, and unlock certified{' '}
          <span className="font-serif italic text-[#f0f6fc]">
            paid-instructor
          </span>{' '}
          status.
        </p>
      </div>

      {/* Event cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tournaments.map((t, idx) => {
          const isRegistered = registered.has(t.id)
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="flex flex-col rounded-2xl border border-white/10 bg-[#161b22] p-5"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#e01e37]">
                {t.category}
              </span>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[#f0f6fc]">
                {t.name}
              </h3>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[#8b949e]">Entry Fee</dt>
                  <dd className="font-medium text-[#f0f6fc]">
                    ₹{t.entryFee.toLocaleString('en-IN')}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#8b949e]">Prize Pool</dt>
                  <dd className="font-bold text-[#e01e37]">
                    ₹{t.prizePool.toLocaleString('en-IN')}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#8b949e]">Date</dt>
                  <dd className="font-medium text-[#f0f6fc]">{t.date}</dd>
                </div>
              </dl>

              <button
                onClick={() => toggleRegister(t.id)}
                className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-bold transition-all active:scale-95 ${
                  isRegistered
                    ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)] hover:bg-[#c0182f]'
                }`}
              >
                {isRegistered ? 'Registered ✓' : 'Register / Submit XP'}
              </button>
            </motion.article>
          )
        })}
      </div>

      {/* Leaderboard Section */}
      <div className="mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
              {activeScope === 'state' ? `${selectedState} State` : 'Global'} Category Leaderboard
            </h3>
            <p className="mt-1 text-xs text-[#8b949e]">
              {activeScope === 'state'
                ? `Showing regional talent and top ranks within ${selectedState}.`
                : 'Showing global top performers across all categories.'}
            </p>
          </div>

          {/* Scope Filter Toggle */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-[#161b22] p-1">
            <button
              onClick={() => setActiveScope('state')}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeScope === 'state'
                  ? 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {selectedState} 
            </button>

            <button
              onClick={() => setActiveScope('global')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeScope === 'global'
                  ? 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Global
            </button>
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-white text-[#0d0f12] font-semibold shadow-sm'
                  : 'border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-white hover:border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[#8b949e]">
                  <th className="px-4 py-3 font-semibold w-16">Rank</th>
                  <th className="px-4 py-3 font-semibold">Learner</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">XP</th>
                  <th className="px-4 py-3 text-right font-semibold">Verified Hrs</th>
                  <th className="pl-4 pr-6 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeaderboard.length > 0 ? (
                  displayedLeaderboard.map((row) => (
                    <tr
                      key={row.rank}
                      className={`border-b border-white/10 last:border-0 transition-colors ${
                        row.isUser
                          ? 'bg-[#e01e37]/10'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                            row.rank <= 3
                              ? 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)]'
                              : 'bg-white/10 text-[#8b949e]'
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#f0f6fc]">
                        {row.name}
                      </td>
                      <td className="px-4 py-3.5 text-[#8b949e]">
                        {row.category}
                      </td>
                      
                      <td className="px-4 py-3.5">
                        <XPMetric xp={row.xp} />
                      </td>
                      
                      <td className="px-4 py-3.5 text-right tabular-nums text-[#8b949e]">
                        {row.verifiedHrs}
                      </td>
                      
                      <td className="pl-4 pr-6 py-3.5 text-right">
                        <div className="flex justify-end">
                          <TierBadge xp={row.xp} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#8b949e]">
                      No rankings found for this category scope.
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