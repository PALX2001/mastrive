'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { 
  MessageSquare, 
  Wallet, 
  Share2, 
  CheckCircle2, 
  Clock,
  X,
  Check,
  Calendar as CalendarIcon,
  Send,
  Copy,
  Menu
} from 'lucide-react'

type DashTab = 'dash' | 'inbox' | 'calendar' | 'earnings'

const navItems: { id: DashTab; label: string }[] = [
  { id: 'dash', label: 'Dash' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'earnings', label: 'Earnings' },
]

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>('dash')
  const [isOnline, setIsOnline] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Interactive Modals & Actions
  const [activeModal, setActiveModal] = useState<'share' | 'reply' | 'reschedule' | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [selectedLearner, setSelectedLearner] = useState<string>('')

  // State for active request items
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      name: 'Vikram M.',
      service: 'Boxing 1-on-1',
      message: '"Ready for Siri Fort session at 5 PM?"',
      status: 'accepted',
      time: 'Sat 22 Oct, 5:00 PM',
    },
    {
      id: 'req-2',
      name: 'Karan P.',
      service: 'Fitness Assessment',
      message: 'Pending Request',
      status: 'pending',
      time: 'Sat 22 Oct, 10:00 AM',
    },
  ])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText('https://mastrive.com/rohits')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleAcceptRequest = useCallback((id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'accepted', message: 'Accepted · Session Confirmed' } : r))
    )
  }, [])

  const handleSendReply = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return
    setActiveModal(null)
    setReplyMessage('')
  }, [replyMessage])

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans selection:bg-[#e01e37] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 sm:px-8 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Mobile Menu Button (< md) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#161b22]/70 text-[#f0f6fc] backdrop-blur-xl transition-colors md:hidden hover:border-white/20 active:scale-95"
          >
            <Menu className="size-5" />
          </button>

          {/* Left: Official Logo */}
          <div className="flex items-center z-10">
            <Link href="/" aria-label="MASTRIVE home" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="MASTRIVE"
                width={130}
                height={32}
                priority
                className="h-7 w-auto object-contain sm:h-8"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation Pills (≥ md) */}
          <nav className="hidden h-[50px] items-center gap-1.5 rounded-full border border-white/10 bg-[#161b22]/70 p-1.5 shadow-2xl backdrop-blur-xl md:flex">
            {navItems.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex h-full items-center justify-center rounded-full px-5 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-nav-pill"
                      className="absolute inset-0 rounded-full bg-[#e01e37] shadow-[0_4px_12px_rgba(224,30,55,0.35)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right: Status Toggle & Profile */}
          <div className="flex items-center gap-3 z-10">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="flex h-[42px] sm:h-[50px] items-center gap-2 rounded-full border border-white/10 bg-[#161b22]/70 px-3 sm:px-4 shadow-2xl backdrop-blur-xl transition-colors hover:border-white/20 active:scale-95"
            >
              <span className="relative flex size-2.5 items-center justify-center">
                {isOnline && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex size-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              </span>
              <span className="text-xs font-semibold text-[#f0f6fc] hidden sm:inline">
                {isOnline ? 'Online & Accepting' : 'Offline'}
              </span>
            </button>

            <Link
              href="/profile"
              className="hidden h-[50px] items-center gap-3 rounded-full border border-white/10 bg-[#161b22]/70 px-4 shadow-2xl backdrop-blur-xl transition-colors hover:border-white/20 sm:flex"
            >
              <div className="text-right">
                <p className="text-xs font-bold leading-tight text-white">Rohit S.</p>
                <p className="text-[10px] text-[#8b949e]">Boxing & Fitness</p>
              </div>
            </Link>
          </div>

        </div>
      </header>

      {/* Dynamic Main Content Views */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'dash' && (
          <>
            {/* Banner: Referral & 0% Offer */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">
                  WELCOME BACK, <span className="text-[#e01e37]">ROHIT!</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Your <strong className="text-white">0% Commission Founding Offer</strong> is active for 67 more days.
                </p>
              </div>
              <button
                onClick={() => setActiveModal('share')}
                className="w-full md:w-auto bg-[#e01e37] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_12px_rgba(224,30,55,0.35)] active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Booking Link (mastrive.com/rohits)</span>
              </button>
            </div>

            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 transition-all hover:border-white/20">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Today's Sessions</p>
                <p className="text-2xl font-bold mt-1">4 Confirmed</p>
                <span className="text-xs text-green-400 mt-2 block">2 Delhi (In-person) · 2 Online</span>
              </div>

              <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 transition-all hover:border-white/20">
                <p className="text-xs text-gray-400 uppercase tracking-wide">This Month Earnings</p>
                <p className="text-2xl font-bold mt-1 text-white">₹42,500</p>
                <span className="text-xs text-green-400 mt-2 block">+12% from last week</span>
              </div>

              <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 transition-all hover:border-white/20">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Pending Escrow</p>
                <p className="text-2xl font-bold mt-1 text-yellow-400">₹8,500</p>
                <span className="text-xs text-gray-400 mt-2 block">3 sessions pending 24h release</span>
              </div>

              <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 transition-all hover:border-white/20">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Upcoming Events</p>
                <p className="text-2xl font-bold mt-1">1 Hosted</p>
                <span className="text-xs text-red-400 mt-2 block">12/16 slots filled</span>
              </div>
            </div>

            {/* Middle Section: Chat & Escrow Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Inbox & Requests (2 Cols) */}
              <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h2 className="font-bold flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-[#e01e37]" />
                    <span>Learner Messages & Active Requests</span>
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req.id} className="bg-[#0b0e14] border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{req.name} — {req.service}</p>
                        <p className={`text-xs ${req.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {req.status === 'pending' ? `${req.message} · ${req.time}` : req.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="bg-[#e01e37] hover:bg-red-700 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors active:scale-95"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLearner(req.name)
                                setActiveModal('reschedule')
                              }}
                              className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold text-gray-300 transition-colors active:scale-95"
                            >
                              Reschedule
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedLearner(req.name)
                              setActiveModal('reply')
                            }}
                            className="bg-[#e01e37] hover:bg-red-700 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors active:scale-95"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Escrow Payments Checklist (1 Col) */}
              <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 space-y-4">
                <h2 className="font-bold flex items-center space-x-2 border-b border-gray-800 pb-3">
                  <Wallet className="w-5 h-5 text-[#e01e37]" />
                  <span>Payment Escrow Status</span>
                </h2>

                <div className="space-y-3">
                  <div className="bg-[#0b0e14] border border-green-900/50 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">₹2,000 — Vikram M.</p>
                      <p className="text-xs text-green-400">Held in Escrow (Paid)</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>

                  <div className="bg-[#0b0e14] border border-yellow-900/50 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">₹1,500 — Ananya S.</p>
                      <p className="text-xs text-yellow-400">Session Done (Release in 4h)</p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {activeTab === 'inbox' && (
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-[#e01e37] mx-auto opacity-80" />
            <h2 className="text-xl font-bold">Learner Inbox</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Direct chat threads with your active learners and pending inquiries will appear here.
            </p>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <CalendarIcon className="w-12 h-12 text-[#e01e37] mx-auto opacity-80" />
            <h2 className="text-xl font-bold">Session Calendar</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Manage your availability slots, sync Google Calendar, and view upcoming bookings.
            </p>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <Wallet className="w-12 h-12 text-[#e01e37] mx-auto opacity-80" />
            <h2 className="text-xl font-bold">Earnings & Payouts</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Track detailed payout history, request instant escrow withdrawals, and view financial reports.
            </p>
          </div>
        )}
      </main>

      {/* Interactive Action Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <X className="size-5" />
              </button>

              {activeModal === 'share' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Share Booking Link</h3>
                  <p className="text-xs text-gray-400">
                    Share your personalized profile link with clients to book sessions directly.
                  </p>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b0e14] p-3">
                    <input
                      readOnly
                      value="https://mastrive.com/rohits"
                      className="w-full bg-transparent text-xs text-gray-200 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 rounded-lg bg-[#e01e37] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'reply' && (
                <form onSubmit={handleSendReply} className="space-y-4">
                  <h3 className="text-lg font-bold">Reply to {selectedLearner || 'Learner'}</h3>
                  <textarea
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e14] p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#e01e37]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-[#e01e37] px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                    >
                      <Send className="size-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'reschedule' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Reschedule Request</h3>
                  <p className="text-xs text-gray-400">
                    Select a new time slot to propose to {selectedLearner || 'the learner'}.
                  </p>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0e14] p-3 text-sm text-white outline-none focus:border-[#e01e37]"
                  />
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full rounded-xl bg-[#e01e37] py-2.5 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Propose New Time
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#0d1117] p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between pb-6">
                <Image
                  src="/logo.svg"
                  alt="MASTRIVE"
                  width={110}
                  height={26}
                  priority
                  className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#161b22] text-[#8b949e] hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 py-4">
                {navItems.map((item) => {
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-start rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-[#e01e37] text-white shadow-[0_4px_12px_rgba(224,30,55,0.35)]'
                          : 'text-[#8b949e] hover:bg-white/5 hover:text-[#f0f6fc]'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}