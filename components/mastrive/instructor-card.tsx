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

const getCategoryIcon = (category?: string, skill?: string) => {
  const norm = `${category || ''} ${skill || ''}`.toLowerCase()
  if (norm.includes('music') || norm.includes('guitar') || norm.includes('vocal') || norm.includes('piano')) return '🎸'
  if (norm.includes('chess') || norm.includes('code') || norm.includes('strategy') || norm.includes('tech')) return '♟️'
  if (norm.includes('yoga') || norm.includes('lifestyle') || norm.includes('wellness')) return '🧘'
  if (norm.includes('art') || norm.includes('watercolour') || norm.includes('paint')) return '🎨'
  return '🥊'
}

export const InstructorCard = memo(function InstructorCard({
  instructor,
  onBook,
  onCardClick,
  booked,
}: {
  instructor: InstructorWithMedia
  onBook: (id: string) => void
  onCardClick?: (instructor: Instructor) => void
  booked: boolean
}) {
  const isOnline = instructor.mode === 'online'
  const [imgError, setImgError] = React.useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      onClick={() => onCardClick?.(instructor)}
      className="group gloss-card gloss-card-hover flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl will-change-transform transform-gpu cursor-pointer"
    >
      <div className="flex flex-col flex-1">
        {/* Media / Image Container */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#0a0a0a]">
          {/* Tag badge */}
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {isOnline ? (
                <Video className="size-3 text-[#e01e37]" aria-hidden />
              ) : (
                <MapPin className="size-3 text-[#e01e37]" aria-hidden />
              )}
              {instructor.tag}
            </span>
          </div>

          {instructor.image && !imgError ? (
            <Image
              src={instructor.image}
              alt={instructor.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              loading="lazy"
              onError={() => setImgError(true)}
              className="object-cover object-[50%_32%] transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111] to-[#0a0a0a]">
              <span className="select-none text-4xl transition-transform duration-500 ease-out group-hover:scale-110 filter drop-shadow-md">
                {instructor.icon || getCategoryIcon(instructor.category, instructor.skill)}
              </span>
            </div>
          )}

          {/* Bottom gradient overlay for readability */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col flex-1 justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 min-h-[22px]">
              <h3 className="text-sm font-bold text-[#f5f5f5] group-hover:text-white transition-colors truncate">
                {instructor.name}
              </h3>
              {instructor.verified && (
                <BadgeCheck
                  className="size-4 shrink-0 text-[#3fb950]"
                  aria-label="Verified instructor"
                />
              )}
            </div>

            <p className="mt-0.5 text-xs font-semibold text-[#e01e37] truncate">
              {instructor.skill}
            </p>

            <p className="mt-2.5 text-xs leading-relaxed text-[#777] line-clamp-3 min-h-[3.35rem]">
              {instructor.description || 'Experienced professional focused on practical mastery, technical training, and helping students achieve high performance goals.'}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#666] pt-1">
            <span className="inline-flex items-center gap-1 font-semibold text-[#f5f5f5]">
              <Star className="size-3 fill-[#e01e37] text-[#e01e37]" aria-hidden />
              {instructor.rating.toFixed(1)}
              <span className="font-normal text-[#666]">
                ({instructor.reviews})
              </span>
            </span>
            <span className="text-[#444]">•</span>
            <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="size-3 shrink-0 text-[#555]" aria-hidden />
              <span className="truncate text-[#777]">{instructor.area}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="mx-4 mb-4 flex shrink-0 items-center justify-between border-t border-white/[0.06] pt-3">
        <p className="text-sm font-extrabold text-[#f5f5f5]">
          ₹{instructor.price.toLocaleString('en-IN')}
          <span className="text-[10px] font-normal text-[#666]">/hr</span>
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onBook(instructor.id)
          }}
          className={`rounded-full px-4 py-1.5 text-[11px] font-bold text-white transition-all active:scale-95 ${
            booked
              ? 'bg-[#3fb950] shadow-[0_2px_12px_rgba(63,185,80,0.35)]'
              : 'gloss-btn-primary'
          }`}
        >
          {booked ? 'Booked ✓' : 'Book Session'}
        </button>
      </div>
    </motion.article>
  )
})