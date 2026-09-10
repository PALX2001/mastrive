'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Briefcase, 
  Sparkles, 
  MapPin, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Rocket, 
  Code, 
  Users, 
  Shield 
} from 'lucide-react'

interface Role {
  id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  requirements: string[]
}

const ROLES: Role[] = [
  {
    id: 'fe-lead',
    title: 'Lead Frontend & Real-Time Web Engineer',
    department: 'Engineering',
    type: 'Full-Time',
    location: 'Delhi NCR / Remote (India)',
    description: 'Lead the core Next.js 15, WebRTC, and Framer Motion architectures of MASTRIVE to build the fastest peer-to-peer skill marketplace in the world.',
    requirements: [
      'Deep expertise with React 19, Next.js App Router, and TypeScript',
      'Track record building high-performance 60FPS fluid animations and WebRTC streams',
      'Obsession with micro-interactions, responsive polish, and zero-compromise UX'
    ]
  },
  {
    id: 'scout-lead',
    title: 'Creator & Instructor Network Lead',
    department: 'Growth & Operations',
    type: 'Full-Time',
    location: 'Delhi / Gurgaon',
    description: 'Onboard the top 1% of combat fighters, master musicians, grandmasters, and lifestyle coaches across India.',
    requirements: [
      'Proven background in talent management, studio partnerships, or sports scouting',
      'Exceptional relationship-building skills with high-performing individuals',
      'Data-driven approach to community density and supply flywheel growth'
    ]
  },
  {
    id: 'growth-lead',
    title: 'Global Brand & Growth Strategist',
    department: 'Marketing',
    type: 'Full-Time',
    location: 'Delhi / Remote',
    description: 'Drive high-octane viral campaigns, tournament spectacles, and cultural storytelling that turns MASTRIVE into a category-defining global powerhouse.',
    requirements: [
      'Hands-on experience growing consumer tech or sports platforms',
      'Deep pulse on youth culture, fitness, martial arts, and music subcultures',
      'Unconventional, high-impact marketing execution skills'
    ]
  }
]

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [applied, setApplied] = useState(false)
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [applicantPortfolio, setApplicantPortfolio] = useState('')

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    setApplied(true)
    setTimeout(() => {
      setApplied(false)
      setSelectedRole(null)
      setApplicantName('')
      setApplicantEmail('')
      setApplicantPortfolio('')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white">
      
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="MASTRIVE"
            width={120}
            height={30}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b949e] transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="mx-auto max-w-4xl px-4 pt-4 pb-16 text-center sm:px-6">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/30 text-[#e01e37] mb-4 shadow-lg shadow-[#e01e37]/20">
          <Rocket className="size-7" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Build the Vanguard of Skill Mastery
        </h1>
        <p className="mt-3 text-sm text-[#8b949e] max-w-lg mx-auto">
          We are assembling an elite team of builders, creators, and operators to make MASTRIVE an unbeatable global brand.
        </p>
      </div>

      {/* Values Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#12161f]/80 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#e01e37]/20 text-[#e01e37] mb-4">
              <Sparkles className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Uncompromising Quality</h3>
            <p className="mt-2 text-xs text-[#8b949e] leading-relaxed">
              We do not ship mediocre work. Every pixel, line of code, and instructor partnership is held to world-class standards.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#12161f]/80 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
              <Code className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Autonomous Velocity</h3>
            <p className="mt-2 text-xs text-[#8b949e] leading-relaxed">
              Zero bureaucracy. We empower individuals who own their domain end-to-end and deliver rapid, high-impact results.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#12161f]/80 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
              <Users className="size-5" />
            </div>
            <h3 className="text-base font-bold text-white">Creator First</h3>
            <p className="mt-2 text-xs text-[#8b949e] leading-relaxed">
              Our economic engine directly enriches independent masters, coaches, and creators with 0% platform extraction fees.
            </p>
          </div>
        </div>
      </div>

      {/* Open Roles Section */}
      <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <h2 className="text-2xl font-black text-white mb-6">Open Positions</h2>
        
        <div className="space-y-4">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-white/10 bg-[#12161f]/90 p-6 transition hover:border-[#e01e37]/50 hover:bg-[#161b22] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e01e37]">
                  {role.department}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{role.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#8b949e]">
                  <span className="flex items-center gap-1"><MapPin className="size-3 text-[#e01e37]" /> {role.location}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3 text-[#e01e37]" /> {role.type}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRole(role)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e01e37] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#c0182f] active:scale-95 transition shrink-0"
              >
                <span>View & Apply</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#141822] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-[#8b949e] hover:bg-white/10 hover:text-white transition"
            >
              <X className="size-5" />
            </button>

            {applied ? (
              <div className="py-8 text-center space-y-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Application Received!</h3>
                <p className="text-xs text-[#8b949e]">
                  Our founding team will review your profile and reach out within 24 hours.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e01e37]">
                  {selectedRole.department}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedRole.title}</h3>
                <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">{selectedRole.description}</p>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <h4 className="text-xs font-bold text-white mb-2">Key Requirements:</h4>
                  <ul className="space-y-1.5 text-xs text-[#8b949e]">
                    {selectedRole.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#e01e37]">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleApply} className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Henderson"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">GitHub / Portfolio / LinkedIn URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/alex"
                      value={applicantPortfolio}
                      onChange={(e) => setApplicantPortfolio(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-3.5 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] py-3 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98] transition"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

