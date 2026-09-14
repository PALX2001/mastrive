import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { verifyInstructorApplication } from '@/lib/instructor-verification'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const applicationId = body?.applicationId
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Instructor application is required' },
        { status: 400 }
      )
    }

    const serverSupabase = await createServerSupabase()
    const { data: authData, error: authError } = await serverSupabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sign in to verify your instructor application.' }, { status: 401 })
    }

    const verification = await verifyInstructorApplication(applicationId, authData.user)
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error }, { status: verification.status })
    }

    return NextResponse.json({
      success: true,
      applicationId: verification.applicationId,
      instructorId: verification.instructorId,
      slug: verification.slug,
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
