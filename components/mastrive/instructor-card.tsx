'use client'

import Image from 'next/image'
import { BadgeCheck, MapPin, Star, Video } from 'lucide-react'
import { motion } from 'motion/react'
import type { Instructor } from '@/lib/data'

type InstructorWithMedia = Instructor & {
  image?: string
  icon?: string
}

export function InstructorCard({
  instructor,
  onBook,
  booked,
}: {
  instructor: InstructorWithMedia
  onBook: (id: string) => void
  booked: boolean
}) {
  const isOnline = instructor.mode === 'online'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] transition-all hover:border-white/20 hover:shadow-xl"
    >
      {/* Reduced height to h-28/h-32 to squeeze card proportion */}
      <div className="relative flex h-32 w-full items-center justify-center bg-[#0d1117]/80 p-3">
        {/* Tag Badge */}
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e01e37]/30 bg-[#e01e37]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e01e37] backdrop-blur-md">
            {isOnline ? (
              <Video className="size-3" aria-hidden />
            ) : (
              <MapPin className="size-3" aria-hidden />
            )}
            {instructor.tag}
          </span>
        </div>

        {/* Custom Image or Fallback Icon */}
        {instructor.image ? (
          <Image
            src={instructor.image}
            alt={instructor.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="select-none text-3xl filter drop-shadow-md">
            {instructor.icon || '🥊'}
          </span>
        )}
      </div>

      {/* Main Details Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Name & Verification */}
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#f0f6fc]">
              {instructor.name}
            </h3>
            {instructor.verified && (
              <BadgeCheck
                className="size-4 text-[#3fb950]"
                aria-label="Verified instructor"
              />
            )}
          </div>

          {/* Skill Title */}
          <p className="mt-0.5 text-xs font-medium text-[#8b949e]">
            {instructor.skill}
          </p>

          {/* Ratings & Location */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8b949e]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#f0f6fc]">
              <Star className="size-3 fill-[#e01e37] text-[#e01e37]" aria-hidden />
              {instructor.rating.toFixed(1)}
              <span className="font-normal text-[#8b949e]">
                ({instructor.reviews})
              </span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-[#8b949e]" aria-hidden />
              {instructor.area}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-sm font-extrabold text-[#f0f6fc]">
            ₹{instructor.price.toLocaleString('en-IN')}
            <span className="text-[10px] font-normal text-[#8b949e]">/hr</span>
          </p>
          <button
            onClick={() => onBook(instructor.id)}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95 ${
              booked
                ? 'bg-[#3fb950] text-white shadow-[0_2px_8px_rgba(63,185,80,0.3)]'
                : 'bg-[#e01e37] text-white shadow-[0_2px_8px_rgba(224,30,55,0.35)] hover:bg-[#c0182f]'
            }`}
          >
            {booked ? 'Booked ✓' : 'Book Session'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}