'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  Send, 
  CheckCircle2, 
  Lock 
} from 'lucide-react'

const FAQS = [
  {
    q: 'How does the escrow protection system work?',
    a: 'When you book a session on MASTRIVE, your payment is securely held in an escrow holding account. It is only released to the instructor after the session is successfully conducted. If the instructor cancels or no-shows, you receive an immediate 100% refund.',
  },
  {
    q: 'Can I reschedule or cancel a session?',
    a: 'Yes. You can reschedule or cancel any session up to 24 hours prior to the scheduled start time directly from your profile dashboard for a full refund or time slot change.',
  },
  {
    q: 'How are MASTRIVE instructors vetted and verified?',
    a: 'Every instructor undergoes a multi-point verification process: certification review, identity verification, background screening, and video skill assessment before earning the verified badge.',
  },
  {
    q: 'Do you require monthly subscriptions or commitments?',
    a: 'No! MASTRIVE operates strictly on a Pay-Per-Session model. You only pay for the exact 1-on-1 or group session you choose to book, with optional multi-session passes available at a discount.',
  },
  {
    q: 'How do 1-on-1 live stream sessions work?',
    a: 'When booking a live online session, a dedicated HD encrypted WebRTC streaming room link is provided in your dashboard and email. No third-party downloads required.',
  },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [ticketSent, setTicketSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    setTicketSent(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white">
      
      {/* Top Header */}
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

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 pt-4 pb-12 text-center sm:px-6">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#e01e37]/15 border border-[#e01e37]/30 text-[#e01e37] mb-4 shadow-lg shadow-[#e01e37]/20">
          <HelpCircle className="size-7" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          How can we help you?
        </h1>
        <p className="mt-3 text-sm text-[#8b949e] max-w-lg mx-auto">
          Need help with a session, instructor booking, or refund? Our dedicated concierge support team is here 24/7.
        </p>

        {/* Fast Action Contact Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://wa.me/918448261770"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12161f]/80 p-6 transition hover:border-[#e01e37] hover:bg-[#161b22]"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-3">
              <MessageSquare className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">WhatsApp Support</h3>
            <p className="text-xs text-[#8b949e] mt-1">+91 8448261770</p>
            <span className="mt-2 text-[10px] font-bold text-emerald-400">Average reply: 5 mins</span>
          </a>

          <a
            href="mailto:help@mastrive.com"
            className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12161f]/80 p-6 transition hover:border-[#e01e37] hover:bg-[#161b22]"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-[#e01e37]/15 text-[#e01e37] mb-3">
              <Mail className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Email Concierge</h3>
            <p className="text-xs text-[#8b949e] mt-1">help@mastrive.com</p>
            <span className="mt-2 text-[10px] font-bold text-[#e01e37]">Direct support queue</span>
          </a>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#12161f]/80 p-6">
            <div className="flex size-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 mb-3">
              <Lock className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Escrow Guarantee</h3>
            <p className="text-xs text-[#8b949e] mt-1">100% Refund Protection</p>
            <span className="mt-2 text-[10px] font-bold text-amber-400">Zero-risk bookings</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: FAQs + Ticket Form */}
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#12161f]/80 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-4 text-[#8b949e] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#e01e37]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#8b949e] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Submit a Support Request */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#12161f] p-6 sm:p-8 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Submit a Direct Request</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Have a specific question about an instructor, tournament, or invoice?
              </p>

              {ticketSent ? (
                <div className="py-10 text-center space-y-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Message Received!</h4>
                  <p className="text-xs text-[#8b949e]">
                    Our support concierge will respond to <strong className="text-white">{email}</strong> within 15 minutes.
                  </p>
                  <button
                    onClick={() => setTicketSent(false)}
                    className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yash Aggarwal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="yash@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Message / Issue Details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your question or session ID..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0e14] p-4 text-xs text-white outline-none focus:border-[#e01e37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e01e37] to-[#b0142b] text-xs font-bold text-white shadow-lg shadow-[#e01e37]/25 transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <Send className="size-3.5" />
                    <span>Send Message to Support</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

