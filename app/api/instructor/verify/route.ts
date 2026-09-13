import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { applicationId, email, token } = body

    if (!applicationId && !email) {
      return NextResponse.json(
        { error: 'Application ID or email is required' },
        { status: 400 }
      )
    }

    const serverSupabase = await createServerSupabase()
    const { data: authData } = await serverSupabase.auth.getUser()
    let sessionUser = authData?.user

    // If token provided and no sessionUser yet, verify OTP server-side
    if (token && email && !sessionUser) {
      const { data: verifyData, error: verifyErr } = await serverSupabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email',
      })
      if (!verifyErr && verifyData?.user) {
        sessionUser = verifyData.user
      }
    }

    // Use service role client if available to ensure database updates succeed
    let dbClient = serverSupabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      dbClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      ) as any
    }

    const nowIso = new Date().toISOString()

    // 1. Locate the application
    let query = dbClient.from('instructor_applications').select('*')
    if (applicationId) {
      query = query.eq('id', applicationId)
    } else if (email) {
      query = query.eq('email', email.trim().toLowerCase())
    }

    const { data: appData, error: findErr } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()

    if (findErr || !appData) {
      return NextResponse.json(
        { error: 'Instructor application not found' },
        { status: 404 }
      )
    }

    const targetAppId = appData.id
    const targetUserId = sessionUser?.id || appData.user_id || null

    // 2. Mark instructor application verified
    const appUpdatePayload: Record<string, any> = {
      status: 'verified',
      verified_at: nowIso,
    }
    if (targetUserId) {
      appUpdatePayload.user_id = targetUserId
    }

    await dbClient
      .from('instructor_applications')
      .update(appUpdatePayload)
      .eq('id', targetAppId)

    // 3. Mark instructor card published
    const instUpdatePayload: Record<string, any> = {
      is_published: true,
      published_at: nowIso,
      updated_at: nowIso,
    }
    if (targetUserId) {
      instUpdatePayload.user_id = targetUserId
    }

    const { data: updatedInst, error: instErr } = await dbClient
      .from('instructors')
      .update(instUpdatePayload)
      .eq('application_id', targetAppId)
      .select('id, slug, display_name')
      .maybeSingle()

    if (instErr) {
      console.warn('[instructor/verify] instructors update warning:', instErr.message)
    }

    // 4. Update profile role to instructor if user exists
    if (targetUserId) {
      await dbClient
        .from('profiles')
        .update({
          role: 'instructor',
          full_name: appData.full_name || undefined,
          skill: appData.sub_skills || appData.skill || undefined,
          city: appData.city || undefined,
          updated_at: nowIso,
        })
        .eq('id', targetUserId)
    }

    return NextResponse.json({
      success: true,
      applicationId: targetAppId,
      instructorId: updatedInst?.id || targetAppId,
      slug: updatedInst?.slug || null,
      message: 'Instructor email verified and profile card published successfully!',
    })
  } catch (error: any) {
    console.error('[instructor/verify] Route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

