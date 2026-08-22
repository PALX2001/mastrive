import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          Privacy <span className="text-[#e01e37]">Policy</span>
        </h1>
        <p className="mt-2 text-xs text-[#8b949e]">
          Last Updated: August 2026
        </p>
      </div>

      {/* Main Content Box */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#161b22]/40 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-8 text-sm leading-relaxed text-[#8b949e]">
        <div>
          <h2 className="text-lg font-bold text-white mb-2">1. Introduction</h2>
          <p>
            Welcome to MASTRIVE. We respect your privacy and are committed to protecting your personal data. This privacy policy informs you as to how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">2. Data We Collect</h2>
          <p className="mb-3">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Identity Data:</strong> Includes first name, last name, username or similar identifier.</li>
            <li><strong className="text-white">Contact Data:</strong> Includes email address and phone numbers.</li>
            <li><strong className="text-white">Transaction Data:</strong> Includes details about payments and bookings made through the platform.</li>
            <li><strong className="text-white">Technical Data:</strong> Includes internet protocol (IP) address, browser type and version, time zone setting, and operating system.</li>
          </ul>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: where we need to perform the contract we are about to enter into or have entered into with you, where it is necessary for our legitimate interests, and where we need to comply with a legal obligation.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="text-lg font-bold text-white mb-2">5. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at <a href="mailto:support@mastrive.com" className="text-[#e01e37] hover:underline">support@mastrive.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}