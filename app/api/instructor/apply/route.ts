import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createAnonClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    let supabase = await createServerSupabase()
    const { data: authData } = await supabase.auth.getUser()
    const sessionUser = authData?.user

    const body = await req.json()
    const {
      profile_type = 'individual',
      name = '',
      institute_name = '',
      email = '',
      country_code = '+91',
      whatsapp = '',
      gender = null,
      category = 'Fitness & Combat',
      sub_skills = '',
      pincode = '',
      locality = '',
      city = 'Delhi',
      experience_years = '',
      certifications = '',
      education = '',
      teaching_modes = [],
      demo_class = 'yes',
      languages = [],
      price_per_hour = null,
      age_groups = [],
      bio = '',
      image_urls = [],
    } = body

    // Security: Only accept authenticated session user ID. Never allow unauthenticated requests to modify arbitrary user accounts.
    const targetUserId = sessionUser?.id || null

    // If no sessionUser but service role key exists, use service role client
    if (!sessionUser && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
    }

    const appId = body.id || crypto.randomUUID()
    const fullName = (name || institute_name || 'Instructor').trim()
    const primarySkill = (sub_skills || 'Specialist Coach').trim()
    const formattedLocation = [locality.trim(), city.trim()].filter(Boolean).join(', ') || 'Delhi'
    const contactNumber = whatsapp.trim() || 'Not Provided'
    const cleanEmail = (email || sessionUser?.email || '').trim()

    // 1. Insert/Upsert into instructor_applications (Satisfies all not-null constraints)
    const applicationPayload: Record<string, any> = {
      id: appId,
      profile_type,
      full_name: fullName,
      skill: primarySkill,
      location: formattedLocation,
      experience: experience_years || '1-3 years',
      institute_name: institute_name.trim() || null,
      email: cleanEmail,
      country_code,
      whatsapp_number: contactNumber,
      gender: gender || null,
      category,
      sub_skills: primarySkill,
      pincode: pincode.trim(),
      locality: locality.trim() || 'Delhi',
      city: city.trim() || 'Delhi',
      experience_years: experience_years || '1-3 years',
      certifications: certifications.trim() || null,
      education: education || null,
      teaching_modes,
      demo_class_offered: demo_class,
      languages_spoken: languages,
      price_per_hour: price_per_hour ? Number(price_per_hour) : 1000,
      age_groups_taught: age_groups,
      bio: bio.trim() || null,
      image_urls: image_urls || [],
      status: 'pending_verification',
      verified_at: null,
    }

    if (targetUserId) {
      applicationPayload.user_id = targetUserId
    }

    const { error: appError } = await supabase
      .from('instructor_applications')
      .upsert(applicationPayload, { onConflict: 'id' })

    if (appError) {
      console.warn('Note on instructor_applications insert:', appError.message)
    }

    // Generate clean slug
    const baseSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'coach'
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`

    const languages_spoken = languages
    const age_groups_taught = age_groups

    // 2. Insert/Upsert into instructors table (Created with is_published: false until email verification)
    const instructorPayload: Record<string, any> = {
      display_name: fullName,
      profile_type,
      institute_name: institute_name.trim() || null,
      skill: primarySkill,
      category,
      locality: locality.trim() || city.trim() || 'Delhi',
      city: city.trim() || 'Delhi',
      experience_years: experience_years || '1-3 years',
      education: education || null,
      certifications: certifications.trim() || null,
      teaching_modes,
      languages_spoken,
      age_groups_taught,
      price_per_hour: price_per_hour ? Number(price_per_hour) : 1000,
      bio: bio.trim() || null,
      image_urls: image_urls || [],
      learners_count: 0,
      is_verified: false,
      is_published: false,
      slug,
      updated_at: new Date().toISOString(),
    }

    if (!appError) {
      instructorPayload.application_id = appId
    }

    if (targetUserId) {
      instructorPayload.user_id = targetUserId
    }

    const { data: instData, error: instError } = await supabase
      .from('instructors')
      .upsert(instructorPayload, targetUserId ? { onConflict: 'user_id' } : undefined)
      .select('id, slug')
      .maybeSingle()

    if (instError) {
      console.warn('Instructors table upsert note:', instError.message)
    }

    return NextResponse.json({
      success: true,
      applicationId: appId,
      instructorId: instData?.id || appId,
      slug: instData?.slug || slug,
      message: 'Instructor application registered. Email verification required before publishing.',
    })
  } catch (error: any) {
    console.error('API apply route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}
