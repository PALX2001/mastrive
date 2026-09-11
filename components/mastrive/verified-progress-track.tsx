'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  Lock,
  CheckCircle2,
  Download,
  ShieldCheck,
  Clock,
  Sparkles,
  Trophy,
  ChevronRight,
} from 'lucide-react'

interface VerifiedProgressTrackProps {
  verifiedHrs?: number
  userName?: string
  userSkill?: string
  rank?: number
  xp?: number
  avatarUrl?: string
}

interface TierThreshold {
  id: string
  name: string
  hours: number
  description: string
  badge: string
}

const TIER_THRESHOLDS: TierThreshold[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    hours: 25,
    description: 'Core technique, mechanics & coach-led fundamentals',
    badge: 'Tier 1',
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    hours: 75,
    description: 'Live drills, situational sparring & technical consistency',
    badge: 'Tier 2',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    hours: 150,
    description: 'Competitive readiness, high-pressure execution & mastery',
    badge: 'Tier 3',
  },
  {
    id: 'mastery',
    name: 'Mastery',
    hours: 300,
    description: 'Elite practitioner • Eligible to coach on Mastrive',
    badge: 'Master',
  },
]

export function VerifiedProgressTrack({
  verifiedHrs = 18,
  userName = 'Learner',
  userSkill = 'Strength Training',
  rank = 2,
  xp = 1200,
}: VerifiedProgressTrackProps) {
  const [downloadingTier, setDownloadingTier] = useState<string | null>(null)

  // Max threshold is 300 hrs for Mastery
  const maxHours = 300
  const progressPercentage = Math.min(100, Math.max(0, (verifiedHrs / maxHours) * 100))

  // Find next upcoming tier
  const nextTier = TIER_THRESHOLDS.find((t) => t.hours > verifiedHrs) || TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]
  const currentTier = [...TIER_THRESHOLDS].reverse().find((t) => verifiedHrs >= t.hours)

  const cleanDisplayName = userName.replace(/\s*\(Learner\)\s*/gi, '').trim() || 'Learner'

  const handleDownloadCertificate = (tierName: string) => {
    setDownloadingTier(tierName)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Deep obsidian background
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, 1200, 800)

        // Subtle gradient border
        const grad = ctx.createLinearGradient(0, 0, 1200, 800)
        grad.addColorStop(0, '#e01e37')
        grad.addColorStop(1, '#222222')
        ctx.strokeStyle = grad
        ctx.lineWidth = 12
        ctx.strokeRect(30, 30, 1140, 740)

        // Inner highlight frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(45, 45, 1110, 710)

        // Header Title
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 34px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('MASTRIVE VERIFIED SKILL CERTIFICATE', 600, 140)

        ctx.fillStyle = '#888888'
        ctx.font = '14px sans-serif'
        ctx.fillText('OFFICIAL PRACTICE HOURS & VERIFIED COACHING RECORD', 600, 175)

        // Divider
        ctx.strokeStyle = 'rgba(224, 30, 55, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(450, 205)
        ctx.lineTo(750, 205)
        ctx.stroke()

        // Recipient
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.font = '18px sans-serif'
        ctx.fillText('This document certifies that', 600, 290)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px sans-serif'
        ctx.fillText(cleanDisplayName, 600, 360)

        // Discipline & Tier
        ctx.fillStyle = '#e01e37'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(
          `HAS COMPLETED THE ${tierName.toUpperCase()} TIER IN ${userSkill.toUpperCase()}`,
          600,
          430
        )

        // Verified hours badge
        ctx.fillStyle = '#f5f5f5'
        ctx.font = '18px sans-serif'
        ctx.fillText(`${verifiedHrs} Verified 1-on-1 Practice Hours with Certified Coaches`, 600, 480)

        // Official seal
        ctx.strokeStyle = '#e01e37'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(600, 595, 46, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px sans-serif'
        ctx.fillText('MASTRIVE', 600, 590)
        ctx.fillText('VERIFIED', 600, 605)

        ctx.fillStyle = '#666666'
        ctx.font = '13px sans-serif'
        ctx.fillText(
          `Verification Ref: MAST-CERT-${Date.now().toString(36).toUpperCase()} • Issued ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          600,
          700
        )

        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `MASTRIVE_${tierName}_Certificate_${cleanDisplayName.replace(/\s+/g, '_')}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('Certificate error:', err)
    } finally {
      setTimeout(() => setDownloadingTier(null), 800)
    }
  }

  const initials = cleanDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'LR'

  return (
    <div className="gloss-card rounded-3xl p-6 sm:p-8">
      {/* ── Top Header: Learner Info + Key Metrics ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-4">
          {/* Avatar Pill */}
          <div className="relative flex size-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-sm font-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span>{initials}</span>
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0a0a0a]">
              <span className="size-1.5 rounded-full bg-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {cleanDisplayName}
              </h3>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-semibold text-[#888]">
                {currentTier ? currentTier.name : 'Enrolled'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#777] flex items-center gap-2">
              <span className="text-[#aaa] font-medium">{userSkill}</span>
              <span className="size-1 rounded-full bg-white/20" />
              <span>Rank #{rank} in your cohort</span>
            </p>
          </div>
        </div>

        {/* Stat Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Verified Hours */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Clock className="size-4 text-[#e01e37]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-[#666] tracking-wider">Verified Hours</div>
              <div className="text-xs font-black text-white">{verifiedHrs} hrs logged</div>
            </div>
          </div>

          {/* Next Goal */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Trophy className="size-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-[#666] tracking-wider">Next Milestone</div>
              <div className="text-xs font-black text-white">{nextTier.name} ({nextTier.hours}h)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle: Clean Progress Track ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[#888] flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#e01e37]" />
            Training Progression
          </span>
          <span className="text-xs font-semibold text-[#888]">
            <strong className="text-white font-black">{verifiedHrs}</strong> / {maxHours} hrs{' '}
            <span className="text-[#666]">({Math.round(progressPercentage)}%)</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2.5 w-full rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#e01e37] via-[#e01e37] to-[#ff4d6d] shadow-[0_0_12px_rgba(224,30,55,0.4)]"
          />
        </div>

        <p className="mt-2 text-[11px] text-[#666]">
          {verifiedHrs >= maxHours ? (
            <span className="text-emerald-400 font-medium">✓ Mastery threshold achieved! You are eligible to apply as a coach.</span>
          ) : (
            <span>
              {nextTier.hours - verifiedHrs} more verified coaching hours needed to unlock <strong className="text-white">{nextTier.name} Tier</strong>.
            </span>
          )}
        </p>
      </div>

      {/* ── Bottom: 4 Structured Milestone Stage Cards ── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TIER_THRESHOLDS.map((tier) => {
          const isUnlocked = verifiedHrs >= tier.hours
          const isCurrent = nextTier.id === tier.id && !isUnlocked

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                isUnlocked
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04] shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]'
                  : isCurrent
                  ? 'border-[#e01e37]/40 bg-[#e01e37]/[0.05] shadow-[0_0_24px_rgba(224,30,55,0.1),inset_0_1px_0_rgba(224,30,55,0.2)]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                    ) : (
                      <div className="flex size-5 items-center justify-center rounded-full bg-white/[0.05] text-[#666]">
                        <Lock className="size-3" />
                      </div>
                    )}
                    <span className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-[#aaa]'}`}>
                      {tier.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#666]">
                    {tier.hours}h
                  </span>
                </div>

                <p className="mt-2.5 text-[11px] leading-relaxed text-[#777]">
                  {tier.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 border-t border-white/[0.06] pt-3 flex items-center justify-between text-[10px]">
                {isUnlocked ? (
                  <>
                    <span className="font-bold text-emerald-400">Unlocked ✓</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(tier.name)}
                      disabled={downloadingTier === tier.name}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2 py-1 font-semibold text-white transition hover:bg-white/10"
                    >
                      <Download className="size-2.5" />
                      <span>{downloadingTier === tier.name ? 'Saving...' : 'Cert'}</span>
                    </button>
                  </>
                ) : isCurrent ? (
                  <span className="font-semibold text-[#e01e37]">
                    In Progress • {tier.hours - verifiedHrs}h left
                  </span>
                ) : (
                  <span className="text-[#555]">
                    Locked • {tier.hours}h required
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
