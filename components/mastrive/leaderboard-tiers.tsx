import React, { memo } from 'react'
import { Diamond, Crown, Star, Shield } from 'lucide-react'

// Sleeker, darker pills with high-contrast glowing dots
export const getTierDetails = (xp: number) => {
  if (xp >= 5000) {
    return {
      name: 'Diamond',
      style: 'border-cyan-900/50 bg-cyan-950/30 text-cyan-400',
      dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      icon: Diamond,
    }
  }
  if (xp >= 3500) {
    return {
      name: 'Gold',
      style: 'border-amber-900/50 bg-amber-950/30 text-amber-400',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      icon: Crown,
    }
  }
  if (xp >= 1500) {
    return {
      name: 'Silver',
      style: 'border-neutral-700/50 bg-neutral-800/30 text-neutral-300',
      dot: 'bg-neutral-300 shadow-[0_0_8px_rgba(212,212,216,0.8)]',
      icon: Star,
    }
  }
  return {
    name: 'Bronze',
    style: 'border-orange-900/50 bg-orange-950/30 text-orange-400',
    dot: 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    icon: Shield,
  }
}

export const TierBadge = memo(function TierBadge({ xp }: { xp: number }) {
  const tier = getTierDetails(xp)
  const Icon = tier.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold tracking-widest ${tier.style}`}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      <span className="uppercase">{tier.name}</span>
    </div>
  )
})

export const XPMetric = memo(function XPMetric({ xp }: { xp: number }) {
  const tier = getTierDetails(xp)
  
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="font-mono text-sm font-medium text-[#f0f6fc]">
        {xp.toLocaleString()} <span className="text-[#8b949e] text-[11px] font-sans font-normal ml-0.5">XP</span>
      </span>
      {/* Premium minimal glowing dot instead of a chunky shape */}
      <div className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
    </div>
  )
})