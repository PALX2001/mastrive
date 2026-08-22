import Link from 'next/link'
import Image from 'next/image'
import { Info } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white px-4 py-8 sm:px-8">
      {/* Top Header - Logo Removed, Back Button Kept Right-Aligned */}
      <div className="mx-auto flex max-w-4xl items-center justify-end pb-8">
        <Link 
          href="/" 
          className="text-xs font-medium text-[#8b949e] transition-colors hover:text-white"
        >
          ← Back home
        </Link>
      </div>

      {/* Hero Section with Perfect Alignment */}
      <div className="mx-auto max-w-4xl text-center pt-8 pb-12">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#e01e37]/10 border border-[#e01e37]/20 text-[#e01e37] mb-4">
          <Info className="size-6" />
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            About
          </h1>
          <Image
            src="/logo.svg"
            alt="MASTRIVE"
            width={180}
            height={44}
            className="h-9 sm:h-12 w-auto object-contain inline-block align-baseline"
          />
        </div>
        <p className="mt-3 text-sm text-[#8b949e]">
          The premier peer-to-peer skill booking and live-streaming platform.
        </p>
      </div>

      {/* Main Content Box */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#161b22]/40 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
          <p className="text-sm leading-relaxed text-[#8b949e]">
            MASTRIVE was engineered to eliminate subscription paywalls and friction in learning. Whether you want to master physical training, arts, or technical skills through in-person sessions nearby or 1-on-1 live streams, our pay-per-session ecosystem connects you directly with top-tier verified instructors.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white mb-3">Vision & Leadership</h2>
          <p className="text-sm leading-relaxed text-[#8b949e]">
            Founded and spearheaded by <span className="text-white font-semibold">Palash</span>, MASTRIVE is driven by a commitment to uncompromising quality, meticulous design precision, and a relentless focus on the user experience. By championing a philosophy of autonomous execution and clean execution, the brand stands as a testament to what a dedicated creator can achieve when building tools that empower ambition.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold text-white mb-3">Core Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Pay-Per-Session</h3>
              <p className="text-xs text-[#8b949e]">No recurring monthly commitments or hidden subscription lock-ins.</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Verified Instructors</h3>
              <p className="text-xs text-[#8b949e]">Rigorous vetting processes to ensure top-tier teaching quality.</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Tournaments</h3>
              <p className="text-xs text-[#8b949e]">Compete on leaderboards and prove your skills in real-time challenges.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-[#8b949e]">
            Have questions or want to collaborate? Reach out directly at <a href="mailto:support@mastrive.com" className="text-[#e01e37] hover:underline">support@mastrive.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}