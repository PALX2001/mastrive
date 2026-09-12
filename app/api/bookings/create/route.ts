import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateBookingPrice } from '@/lib/pricing'
import { instructors as fallbackInstructors } from '@/lib/data'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co'
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_duxFFpmuESkr6dThcJTqxQ_C1IL6vli'

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const body = await req.json()
    const {
      instructor_id = '',
      instructor_name = 'Coach',
      instructor_skill = 'Specialist',
      session_date = '',
      session_time = '',
      booking_type = 'single',
      mode = 'in-person',
      person_count = 1,
      total_amount = 0,
      payment_method = 'upi_qr',
      payment_reference = '',
      customer_name = '',
      customer_email = '',
      customer_phone = '',
      coupon_code = '',
      user_id = null,
    } = body

    // 1. Validate required fields
    if (!customer_name?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }
    if (!session_date?.trim() || !session_time?.trim()) {
      return NextResponse.json({ error: 'Session date and time are required' }, { status: 400 })
    }

    // 2. Fetch official instructor price from database or fallback dataset
    let officialRate = 1000
    try {
      if (instructor_id) {
        const { data: instData } = await supabase
          .from('instructors')
          .select('price_per_hour')
          .eq('id', instructor_id)
          .maybeSingle()

        if (instData?.price_per_hour) {
          officialRate = Number(instData.price_per_hour)
        }
      }

      if (officialRate === 1000 && instructor_name) {
        const fallback = fallbackInstructors.find(
          (i) => i.id === instructor_id || i.name.toLowerCase() === instructor_name.toLowerCase()
        )
        if (fallback?.price) {
          officialRate = fallback.price
        }
      }
    } catch {
      // Keep default officialRate
    }

    // 3. Centralized Price & Commission Recalculation on Server
    const pricing = calculateBookingPrice({
      instructorRate: officialRate,
      bookingType: booking_type === 'monthly' ? 'monthly' : 'single',
      personCount: Number(person_count) || 1,
      couponCode: coupon_code,
    })

    // 4. Validate that client submitted price matches recalculated price (within ₹2 for rounding)
    const clientPrice = Number(total_amount) || 0
    if (clientPrice > 0 && Math.abs(clientPrice - pricing.finalTotalPrice) > 2) {
      return NextResponse.json(
        {
          error: `Price discrepancy detected. Recalculated total is ₹${pricing.finalTotalPrice}. Please refresh and try again.`,
          expectedPrice: pricing.finalTotalPrice,
        },
        { status: 400 }
      )
    }

    // 5. Determine booking status based on payment verification
    // For manual UPI payments with UTR, status is 'payment_pending' until verified in escrow
    const cleanRef = String(payment_reference || '').trim()
    const bookingStatus =
      payment_method === 'upi_qr'
        ? 'payment_pending'
        : cleanRef && !cleanRef.startsWith('pay_sim_')
        ? 'confirmed'
        : 'payment_pending'

    const bookingId = crypto.randomUUID()

    const bookingPayload = {
      id: bookingId,
      user_id: user_id || null,
      instructor_id: String(instructor_id),
      instructor_name: String(instructor_name),
      instructor_skill: String(instructor_skill),
      session_date: String(session_date),
      session_time: String(session_time),
      booking_type: String(booking_type),
      mode: String(mode),
      person_count: pricing.personCount,
      total_amount: pricing.finalTotalPrice,
      platform_fee: pricing.platformFee + pricing.taxes,
      instructor_payout: pricing.instructorPayout,
      payment_method: String(payment_method),
      payment_reference: cleanRef || `MAST-${Date.now().toString(36).toUpperCase()}`,
      status: bookingStatus,
      customer_name: String(customer_name).trim(),
      customer_email: String(customer_email || '').trim(),
      customer_phone: String(customer_phone || '').trim(),
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Database insert error:', error.message)
      }
      return NextResponse.json(
        { success: false, error: 'Database rejected booking: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: data,
      pricing,
    })
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Booking API error:', err)
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process booking' },
      { status: 500 }
    )
  }
}
