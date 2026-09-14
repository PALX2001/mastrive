import 'server-only'

import { createClient } from '@supabase/supabase-js'

type VerificationUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}

type VerificationResult =
  | { ok: true; applicationId: string; instructorId: string; slug: string | null }
  | { ok: false; status: 400 | 403 | 404 | 503; error: string }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function normalizedEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

/**
 * Verifies and publishes only the application that belongs to the authenticated
 * email-address owner. The service role is used solely after that ownership check
 * so it never turns an untrusted request body into an authorization decision.
 */
export async function verifyInstructorApplication(
  applicationId: unknown,
  user: VerificationUser,
): Promise<VerificationResult> {
  if (typeof applicationId !== 'string' || !UUID_PATTERN.test(applicationId)) {
    return { ok: false, status: 400, error: 'A valid instructor application is required.' }
  }

  const email = normalizedEmail(user.email)
  if (!email) {
    return { ok: false, status: 403, error: 'Your verified account email is required.' }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: application, error: applicationError } = await admin
    .from('instructor_applications')
    .select('id, email, full_name, skill, sub_skills, city, user_id, status')
    .eq('id', applicationId)
    .maybeSingle()

  if (applicationError) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }

  // Do not disclose or modify another applicant's record, even to a signed-in user.
  if (!application || normalizedEmail(application.email) !== email || (application.user_id && application.user_id !== user.id)) {
    return { ok: false, status: 403, error: 'You are not allowed to verify this application.' }
  }

  if (!['pending', 'pending_verification', 'verified', 'approved'].includes(application.status)) {
    return { ok: false, status: 403, error: 'This application is not eligible for verification.' }
  }

  const { data: instructor, error: instructorError } = await admin
    .from('instructors')
    .select('id, slug')
    .eq('application_id', application.id)
    .maybeSingle()

  if (instructorError) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }
  if (!instructor) {
    return { ok: false, status: 404, error: 'Instructor profile was not found.' }
  }

  const now = new Date().toISOString()
  const nextStatus = application.status === 'approved' ? 'approved' : 'verified'

  const { error: applicationUpdateError } = await admin
    .from('instructor_applications')
    .update({ user_id: user.id, status: nextStatus, verified_at: now })
    .eq('id', application.id)

  if (applicationUpdateError) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }

  const { error: instructorUpdateError } = await admin
    .from('instructors')
    .update({
      user_id: user.id,
      is_verified: true,
      is_published: true,
      published_at: now,
      updated_at: now,
    })
    .eq('id', instructor.id)

  if (instructorUpdateError) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }

  const { error: profileUpdateError } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        full_name: application.full_name || null,
        role: 'instructor',
        skill: application.sub_skills || application.skill || null,
        city: application.city || null,
        updated_at: now,
      },
      { onConflict: 'id' },
    )

  if (profileUpdateError) {
    return { ok: false, status: 503, error: 'Instructor verification is temporarily unavailable.' }
  }

  return {
    ok: true,
    applicationId: application.id,
    instructorId: instructor.id,
    slug: instructor.slug || null,
  }
}
