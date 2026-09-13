import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawEmail = body?.email
    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    const email = rawEmail.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email format' },
        { status: 400 }
      )
    }

    // Determine client to use
    let dbClient: any = await createServerSupabase()
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      dbClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
    }

    // 1. Query profiles table
    const { data: profile, error: profileErr } = await dbClient
      .from('profiles')
      .select('id, email, full_name, role, phone, city')
      .eq('email', email)
      .maybeSingle()

    if (profileErr) {
      console.warn('[check-account] Profile check note:', profileErr.message)
    }

    if (profile) {
      return NextResponse.json({
        exists: true,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role || 'user',
          phone: profile.phone || null,
          city: profile.city || null,
          isInstructor: profile.role === 'instructor',
        },
      })
    }

    // 2. Query instructor_applications table as fallback
    const { data: application } = await dbClient
      .from('instructor_applications')
      .select('id, email, full_name, status, user_id, whatsapp_number, city')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (application) {
      return NextResponse.json({
        exists: true,
        user: {
          id: application.user_id || null,
          email: application.email,
          fullName: application.full_name,
          role: 'instructor',
          phone: application.whatsapp_number || null,
          city: application.city || null,
          isInstructor: true,
        },
      })
    }

    return NextResponse.json({
      exists: false,
      user: null,
    })
  } catch (error: any) {
    console.error('[check-account] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to check account' },
      { status: 500 }
    )
  }
}

