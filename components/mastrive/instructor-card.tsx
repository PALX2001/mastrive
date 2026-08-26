'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { BadgeCheck, MapPin, Star, Video } from 'lucide-react'
import { motion } from 'motion/react'
import type { Instructor } from '@/lib/data'

type InstructorWithMedia = Instructor & {
  image?: string
  icon?: string
  description?: string
}

export const InstructorCard = memo(function InstructorCard({
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] transition-all duration-300 hover:border-white/25 hover:shadow-2xl will-change-transform transform-gpu"
    >
      <div>
        {/* Media / Image Container with Fixed Proportion & Perfect Ratio Fit */}
        <div className="relative h-48 w-full overflow-hidden bg-[#0d1117]/80">
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

          {instructor.image ? (
            <Image
              src={instructor.image}
              alt={instructor.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              loading="lazy"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="select-none text-4xl transition-transform duration-500 ease-out group-hover:scale-110 filter drop-shadow-md">
                {instructor.icon || '🥊'}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
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

          <p className="mt-0.5 text-xs font-medium text-[#e01e37]">
            {instructor.skill}
          </p>

          <p className="mt-2.5 text-xs leading-relaxed text-[#8b949e] line-clamp-3">
            {instructor.description || 'Experienced professional focused on practical mastery, technical training, and helping students achieve high performance goals.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8b949e]">
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
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between border-t border-white/10 pt-3">
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
    </motion.article>
  )
})