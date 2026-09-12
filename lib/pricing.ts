// ==============================================================================
// MASTRIVE: Centralized Pricing Engine & Commission Calculator
// Single source of truth for all booking price calculations across client and server.
// ==============================================================================

export const COUPONS: Record<string, { discount: number; description: string }> = {
  GROUP2: { discount: 0.15, description: '15% Off Group Discount' },
  BATCH4: { discount: 0.25, description: '25% Off Squad Pass' },
  MASTRIVE10: { discount: 0.10, description: '10% Off Promo Discount' },
}

// Platform commission rate (15% platform expenses, matchmaking, escrow & support)
export const PLATFORM_FEE_RATE = 0.15

// Standard GST / Tax on platform services (18% on the platform convenience fee)
export const TAX_RATE_ON_PLATFORM_FEE = 0.18

export interface PricingBreakdown {
  instructorRate: number // Instructor's base hourly rate
  bookingType: 'single' | 'monthly'
  personCount: number
  sessionCount: number
  instructorSubtotal: number // Gross payout to instructor before any platform discounts
  platformFee: number // Platform booking expenses & escrow commission
  taxes: number // GST / Taxes on booking expenses
  rawTotalPrice: number // Price before coupon
  discountAmount: number // Coupon discount
  finalTotalPrice: number // Final amount the learner pays
  instructorPayout: number // Final payout allocated to instructor
  couponCode?: string
}

/**
 * Calculates the exact transparent price breakdown for any instructor rate and booking setup.
 * Instructors can set their rate in any range (e.g. ₹300/hr, ₹1,200/hr, ₹5,000/hr).
 * Platform automatically adds booking expenses and taxes for platform commission.
 */
export function calculateBookingPrice({
  instructorRate,
  bookingType = 'single',
  personCount = 1,
  couponCode,
}: {
  instructorRate: number
  bookingType?: 'single' | 'monthly'
  personCount?: number
  couponCode?: string | null
}): PricingBreakdown {
  const cleanRate = Math.max(0, Number(instructorRate) || 1000)
  const cleanPersonCount = Math.max(1, Number(personCount) || 1)

  // Monthly pass is 4 sessions with a 20% learner bundle discount on the instructor portion
  const sessionCount = bookingType === 'monthly' ? 4 : 1
  const sessionMultiplier = bookingType === 'monthly' ? 4 * 0.8 : 1

  // 1. Instructor's base subtotal
  const instructorSubtotal = Math.round(cleanRate * sessionMultiplier * cleanPersonCount)

  // 2. Booking expenses & platform commission (15% on instructor service)
  const platformFee = Math.round(instructorSubtotal * PLATFORM_FEE_RATE)

  // 3. Taxes & regulatory fee (18% GST on platform services)
  const taxes = Math.round(platformFee * TAX_RATE_ON_PLATFORM_FEE)

  // 4. Undiscounted total to customer
  const rawTotalPrice = instructorSubtotal + platformFee + taxes

  // 5. Coupon Discount
  let discountAmount = 0
  const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : null
  if (cleanCoupon && COUPONS[cleanCoupon]) {
    discountAmount = Math.round(rawTotalPrice * COUPONS[cleanCoupon].discount)
  }

  // 6. Final payable total
  const finalTotalPrice = Math.max(0, rawTotalPrice - discountAmount)

  // 7. Guaranteed instructor payout
  const instructorPayout = instructorSubtotal

  return {
    instructorRate: cleanRate,
    bookingType,
    personCount: cleanPersonCount,
    sessionCount,
    instructorSubtotal,
    platformFee,
    taxes,
    rawTotalPrice,
    discountAmount,
    finalTotalPrice,
    instructorPayout,
    couponCode: cleanCoupon || undefined,
  }
}
