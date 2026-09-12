import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      tournament_id,
      tournament_name,
      participant_name,
      participant_email,
      participant_phone,
      xp_handle,
      entry_fee,
      payment_method = 'razorpay',
      payment_reference,
      user_id = null,
    } = body

    if (!tournament_id || !participant_name || !participant_email) {
      return NextResponse.json(
        { error: 'Tournament ID, name, and email are required' },
        { status: 400 }
      )
    }

    const payload = {
      tournament_id: String(tournament_id),
      tournament_name: String(tournament_name || 'Tournament'),
      user_id: user_id || null,
      participant_name: String(participant_name).trim(),
      participant_email: String(participant_email).trim().toLowerCase(),
      participant_phone: String(participant_phone || '').trim(),
      xp_handle: String(xp_handle || '').trim(),
      entry_fee: Number(entry_fee) || 0,
      payment_method: String(payment_method),
      payment_reference: String(payment_reference || `TOUR-${Date.now().toString(36).toUpperCase()}`),
      status: 'confirmed',
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert(payload)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Tournament registration insert notice:', error.message)
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      registration: data,
    })
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Tournament register API error:', err)
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to register for tournament' },
      { status: 500 }
    )
  }
}
