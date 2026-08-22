'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import {
  instructors,
  type CategoryId,
} from '@/lib/data'
import { InstructorCard } from './instructor-card'
import { BookingModal, type BookingInstructor } from './booking-modal'

export function InstructorDirectory({
  activeCategory,
  query,
}: {
  activeCategory: CategoryId
  query: string
}) {
  const [selectedInstructor, setSelectedInstructor] = useState<BookingInstructor | null>(null)

  const handleBookClick = (id: string) => {
    const instructor = instructors.find((i) => i.id === id)
    if (instructor) {
      setSelectedInstructor({
        name: instructor.name,
        skill: instructor.skill,
        price: instructor.price,
      })
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return instructors.filter((i) => {
      if (activeCategory !== 'all' && i.category !== activeCategory) return false
      if (q && !`${i.skill} ${i.name}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [activeCategory, query])

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Results count */}
      <p className="text-sm text-[#8b949e]">
        {filtered.length} instructor{filtered.length === 1 ? '' : 's'} available
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((instructor) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                onBook={handleBookClick}
                booked={false}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#161b22] p-12 text-center">
          <p className="text-sm text-[#8b949e]">
            No instructors match your search. Try a different category or keyword.
          </p>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={Boolean(selectedInstructor)}
        onClose={() => setSelectedInstructor(null)}
        instructor={selectedInstructor}
      />
    </section>
  )
}