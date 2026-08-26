'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InstructorApplicationView() {
  const [formData, setFormData] = useState({
    name: '',
    skill: '',
    whatsapp: '',
    location: '',
    experience: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      let userId: string | null = null
      try {
        const { data } = await supabase.auth.getUser()
        userId = data.user?.id || null
      } catch {
        // Unauthenticated visitor submission
      }

      // Build payload cleanly without forced null values if absent
      const payload: Record<string, any> = {
        full_name: formData.name.trim(),
        skill: formData.skill.trim(),
        whatsapp_number: formData.whatsapp.trim(),
        location: formData.location.trim(),
        experience: formData.experience.trim(),
        status: 'pending',
      }

      if (userId) {
        payload.user_id = userId
      }

      // Perform insert
      const { error } = await supabase
        .from('instructor_applications')
        .insert([payload])

      if (error) throw error

      setSubmitted(true)
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Application submission error:', err)
      }

      const detailedMsg = err?.message || err?.error_description || String(err)

      if (detailedMsg.includes('Failed to fetch')) {
        setErrorMessage(
          'Network error: Unable to connect to Supabase. Check your connection or disable ad blockers.'
        )
      } else {
        setErrorMessage(detailedMsg || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#0b0b0b] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8b949e]">
          FOR INSTRUCTORS
        </p>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Teach on <span className="font-serif italic text-[#e52e42]">Mastrive.</span>
        </h1>

        <p className="mt-4 text-base text-[#8b949e] sm:text-lg">
          Connect with students near you. Set your own price per session.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-[#12161f] p-6 shadow-2xl sm:p-8">
          {submitted ? (
            <div className="py-8 text-center">
              <h3 className="text-xl font-bold text-white">Application Received!</h3>
              <p className="mt-2 text-sm text-[#8b949e]">
                We will review your details and contact you on WhatsApp shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  What do you teach?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boxing, Guitar, Pottery"
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  WhatsApp number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  Which part of Delhi are you based in?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hauz Khas, Gurgaon, West Delhi"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9]">
                  A bit about your experience (optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="How long have you been teaching, any certifications, batch sizes you usually take..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition-colors focus:border-[#e52e42] focus:outline-none focus:ring-1 focus:ring-[#e52e42]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#e52e42] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d02538] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>

              <p className="text-center text-[11px] leading-tight text-[#8b949e]">
                We use these details only to assess your application and contact you about Mastrive.{' '}
                <Link href="/privacy" className="underline hover:text-white">
                  Privacy & Policy
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}