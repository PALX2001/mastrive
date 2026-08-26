'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { motion } from 'motion/react'

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Top Bar for Back Home Link */}
      <div className="mx-auto flex max-w-7xl justify-end px-6 pt-4 sm:px-10">
        <Link
          href="/"
          className="text-xs font-medium text-[#8b949e] transition-colors hover:text-[#f0f6fc]"
        >
          ← Back home
        </Link>
      </div>

      {/* Background Ambient Glow - GPU Accelerated */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-28 -z-0 h-[280px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#e01e37]/35 via-[#e01e37]/15 to-transparent blur-[80px] transform-gpu opacity-60"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24">
        {/* Page Title & Badge */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center justify-center rounded-xl border border-[#e01e37]/30 bg-[#e01e37]/10 p-3 text-[#e01e37]"
          >
            <FileText className="size-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl font-extrabold tracking-tight sm:text-5xl"
          >
            Terms and Conditions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3 text-sm font-medium text-[#8b949e]"
          >
            Last Updated: August 2026
          </motion.p>
        </div>

        {/* Content Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 rounded-2xl border border-white/10 bg-[#161b22]/90 p-6 shadow-2xl backdrop-blur-md sm:p-10"
        >
          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-[#c9d1d9]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
              Last updated: August 20, 2026
            </p>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#f0f6fc]">
                Terms and Conditions of MASTRIVE
              </h2>
              <p>
                MASTRIVE operates a peer-to-peer skill booking and live stream platform exclusively for in-person sessions and interactive 1-on-1 classes. By accessing or using our platform, booking sessions, or subscribing to services, you agree to comply with and be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                1. Account Registration & Conduct
              </h3>
              <p>
                <strong className="text-white">Legal Capacity:</strong> You must be at least 18 years old or operating under parental/guardian supervision to book or host sessions on MASTRIVE.
              </p>
              <p>
                <strong className="text-white">Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your credentials and for all activities conducted through your account.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                2. Session Bookings & Payment
              </h3>
              <p>
                <strong className="text-white">Pay-Per-Session:</strong> All payments are processed on a pay-per-session basis without recurring subscription obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                3. Cancellations & Refunds
              </h3>
              <p>
                Cancellations requested at least 24 hours before a scheduled session start time are eligible for a full refund or wallet credit.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                4. Contact Information
              </h3>
              <p>
                For support, reach out to our team at{' '}
                <span className="text-[#e01e37] underline">support@mastrive.com</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}