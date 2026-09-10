'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  Lock, 
  CheckCircle2, 
  Download, 
  Award, 
  Sparkles, 
  Check, 
  Flame, 
  ShieldCheck 
} from 'lucide-react'

interface VerifiedProgressTrackProps {
  verifiedHrs?: number
  userName?: string
  userSkill?: string
  rank?: number
  xp?: number
}

interface TierThreshold {
  id: string
  name: string
  hours: number
  subtitle: string
}

const TIER_THRESHOLDS: TierThreshold[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    hours: 100,
    subtitle: 'Core Mechanics & Form',
  },
  {
    id: 'practitioner',
    name: 'Practitioner',
    hours: 250,
    subtitle: 'Advanced Live Drills',
  },
  {
    id: 'mastery',
    name: 'Mastery',
    hours: 500,
    subtitle: 'Certified Paid Instructor',
  },
]

export function VerifiedProgressTrack({
  verifiedHrs = 176,
  userName = 'Palash B.',
  userSkill = 'Muay Thai Striking',
  rank = 5,
  xp = 3640,
}: VerifiedProgressTrackProps) {
  const [downloadingTier, setDownloadingTier] = useState<string | null>(null)

  // Calculate overall percentage based on Mastery max of 500 hrs
  const progressPercentage = Math.min(100, Math.max(0, (verifiedHrs / 500) * 100))

  const handleDownloadCertificate = (tierName: string) => {
    setDownloadingTier(tierName)

    try {
      // Create a canvas to render an authentic downloadable certificate
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Dark metallic background
        ctx.fillStyle = '#0b0e14'
        ctx.fillRect(0, 0, 1200, 800)

        // Gradient border
        const grad = ctx.createLinearGradient(0, 0, 1200, 800)
        grad.addColorStop(0, '#e01e37')
        grad.addColorStop(0.5, '#a855f7')
        grad.addColorStop(1, '#06b6d4')
        ctx.strokeStyle = grad
        ctx.lineWidth = 14
        ctx.strokeRect(30, 30, 1140, 740)

        // Inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 2
        ctx.strokeRect(45, 45, 1110, 710)

        // Header Title
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 38px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('MASTRIVE VERIFIED CERTIFICATION', 600, 140)

        ctx.fillStyle = '#8b949e'
        ctx.font = '18px sans-serif'
        ctx.fillText('OFFICIAL SKILL MASTERY & VERIFIED HOURS ACCREDITATION', 600, 180)

        // Recipient
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '20px sans-serif'
        ctx.fillText('This certifies that', 600, 280)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 54px sans-serif'
        ctx.fillText(userName, 600, 350)

        // Discipline & Tier
        ctx.fillStyle = '#e01e37'
        ctx.font = 'bold 28px sans-serif'
        ctx.fillText(`Has successfully completed the ${tierName.toUpperCase()} TIER in ${userSkill.toUpperCase()}`, 600, 420)

        // Hours & Stats
        ctx.fillStyle = '#06b6d4'
        ctx.font = '22px sans-serif'
        ctx.fillText(`${verifiedHrs} VERIFIED TRAINING HOURS · ON-CHAIN REPUTATION RECORD`, 600, 480)

        // Signature / Seal
        ctx.strokeStyle = '#e01e37'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(600, 590, 50, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText('MASTRIVE', 600, 585)
        ctx.fillText('VERIFIED', 600, 600)

        ctx.fillStyle = '#8b949e'
        ctx.font = '14px sans-serif'
        ctx.fillText(`Issued on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 600, 690)

        // Convert to download link
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `MASTRIVE_${tierName}_Certificate_${userName.replace(/\s+/g, '_')}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('Certificate generation error:', err)
    } finally {
      setTimeout(() => {
        setDownloadingTier(null)
      }, 1000)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#12161f]/95 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl">
      {/* User Stats Top Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e01e37] to-[#800016] text-sm font-black text-white shadow-lg shadow-[#e01e37]/30 ring-2 ring-white/10">
            {userName.substring(0, 2).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#12161f]">
              <Check className="size-2.5 stroke-[3] text-black" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-tight">
                {userName}
              </h4>
              <span className="rounded-full bg-[#e01e37] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                YOU
              </span>
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 flex items-center gap-2">
              <span>{userSkill}</span>
              <span className="size-1 rounded-full bg-white/20" />
              <span className="text-white/70 font-medium">Rank #{rank} Globally</span>
            </p>
          </div>
        </div>

        {/* Stats Metrics Pill Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b0e14]/70 px-3.5 py-2">
            <Flame className="size-4 text-[#e01e37]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8b949e]">Total XP</div>
              <div className="text-xs font-black text-white font-mono">{xp.toLocaleString()} XP</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400/80">Verified Time</div>
              <div className="text-xs font-black text-emerald-300 font-mono">{verifiedHrs} Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Track Header */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-cyan-400" />
            Mastery & Instructor Certification Track
          </span>
        </div>
        <div className="text-xs font-mono font-bold text-cyan-400">
          {verifiedHrs} / 500 hrs ({Math.round(progressPercentage)}%)
        </div>
      </div>

      {/* Dynamic Animated Gradient Progress Bar */}
      <div className="relative mt-3 h-3.5 w-full rounded-full bg-[#0b0e14] border border-white/10 p-0.5 overflow-hidden shadow-inner">
        {/* Tier Marker Dividers on the Track */}
        <div className="absolute inset-0 pointer-events-none z-10 flex">
          {/* Foundation at 20% (100/500) */}
          <div className="absolute left-[20%] top-0 bottom-0 w-0.5 bg-white/20" />
          {/* Practitioner at 50% (250/500) */}
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-white/20" />
          {/* Mastery at 100% (500/500) */}
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/20" />
        </div>

        {/* Framer Motion Animated Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="h-full rounded-full bg-gradient-to-r from-red-600 via-purple-500 to-cyan-500 shadow-[0_0_16px_rgba(168,85,247,0.5)] relative"
        >
          {/* Shimmer light pass */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 animate-pulse" />
        </motion.div>
      </div>

      {/* Three Fixed Tier Markers Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {TIER_THRESHOLDS.map((tier) => {
          const isUnlocked = verifiedHrs >= tier.hours
          const remaining = tier.hours - verifiedHrs

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                isUnlocked
                  ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-[#12161f] to-[#12161f] shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'border-white/5 bg-[#0b0e14]/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="size-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="flex size-6 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/30">
                        <Lock className="size-3 text-[#8b949e]" />
                      </div>
                    )}

                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isUnlocked
                          ? 'text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] font-extrabold'
                          : 'text-[#8b949e] font-medium'
                      }`}
                    >
                      {tier.name}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold ${
                      isUnlocked ? 'text-cyan-300' : 'text-[#6e7681]'
                    }`}
                  >
                    {tier.hours} hrs
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-[#8b949e]">
                  {tier.subtitle}
                </p>
              </div>

              {/* Status and Action Row */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                {isUnlocked ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      <Sparkles className="size-3" /> Unlocked
                    </span>

                    {/* Small Download Certificate Icon Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(tier.name)}
                      disabled={downloadingTier === tier.name}
                      title={`Download ${tier.name} Tier Verified Certificate`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white active:scale-95 shadow-sm"
                    >
                      <Download className="size-3 text-cyan-400" />
                      <span>{downloadingTier === tier.name ? 'Saving...' : 'Certificate'}</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] font-semibold text-[#6e7681]">
                    {remaining} hrs remaining to unlock
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

