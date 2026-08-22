import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f0f6fc] selection:bg-[#e01e37] selection:text-white px-4 py-8 sm:px-8">
      {/* Top Header - Back Button Right-Aligned */}
      <div className="mx-auto flex max-w-4xl items-center justify-end pb-8">
        <Link 
          href="/" 
          className="text-xs font-medium text-[#8b949e] transition-colors hover:text-white"
        >
          ← Back home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl text-center pt-4 pb-12">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#e01e37]/10 border border-[#e01e37]/20 text-[#e01e37] mb-4">
          <RotateCcw className="size-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          Refund <span className="text-[#e01e37]">Policy</span>
        </h1>
        <p className="mt-2 text-xs text-[#8b949e]">
          Last Updated: August 2026
        </p>
      </div>

      {/* Main Content Box */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#161b22]/40 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-8 text-sm leading-relaxed text-[#8b949e]">
        <div>
          <h2 className="text-lg font-bold text-white mb-2">1. Overview</h2>
          <p>
            Because MASTRIVE operates on a peer-to-peer, pay-per-session model without recurring subscription lock-ins, all bookings are handled individually between users and instructors. This policy outlines the conditions under which cancellations and refunds are granted.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">2. Cancellations by Users</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">More than 24 Hours Notice:</strong> If you cancel a session at least 24 hours before the scheduled start time, you are eligible for a full refund to your original payment method or instant wallet credit.</li>
            <li><strong className="text-white">Less than 24 Hours Notice:</strong> Cancellations made within 24 hours of the session start time are generally non-refundable, as the instructor&apos;s time has been reserved. Exceptions may be reviewed case-by-case.</li>
          </ul>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">3. Instructor Cancellations</h2>
          <p>
            In the rare event that an instructor cancels a session or fails to show up for an in-person meeting or live-stream, you will receive an automatic 100% full refund credited directly back to your MASTRIVE wallet or payment account within 3 to 5 business days.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">4. Requesting a Refund</h2>
          <p>
            To request a refund or dispute a transaction, please reach out to our support team with your booking ID and details at <a href="mailto:support@mastrive.com" className="text-[#e01e37] hover:underline">support@mastrive.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}