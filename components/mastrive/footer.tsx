'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {/* Main Rounded Footer Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] p-8 sm:p-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          
          {/* Brand & Description */}
          <div className="md:col-span-5 lg:col-span-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg" // Replace with your logo path in public/ folder (e.g., /logo.svg or /logo.png)
                alt="MASTRIVE Logo"
                width={160}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#8b949e]">
              Discover and book amazing skill sessions with verified top-tier instructors nearby.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/mastrive?igsi=NTd0MTBwZjZjOG1y"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#161b22] text-[#8b949e] transition-colors hover:text-white"
              >
                <svg
                  className="size-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Legal Navigation */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-sm font-bold text-white">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#8b949e]">
              <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
              <li><Link href="/careers" className="transition-colors hover:text-white">Careers</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#8b949e] hover:text-[#f0f6fc]">Terms and Conditions</Link></li>
              <li><Link href="/refund" className="transition-colors hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Help & Contact */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-sm font-bold text-white">Help</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#8b949e]">
              <li><Link href="/support" className="transition-colors hover:text-white">Support</Link></li>
              <li><a href="mailto:help@mastrive.com" className="transition-colors hover:text-white">help@mastrive.com</a></li>
              <li className="text-[#8b949e]">+91 8448261770</li>
            </ul>
          </div>
        </div>

        {/* Divider & Bottom Row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-[#8b949e] sm:flex-row">
          <p>© 2026 MASTRIVE. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>

        {/* Giant Subtle Background Watermark Text */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[120px] font-black uppercase text-white/[0.02] select-none sm:text-[180px]"
        >
          MASTRIVE
        </div>
      </div>
    </footer>
  )
}