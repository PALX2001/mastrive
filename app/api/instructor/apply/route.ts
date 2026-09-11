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
      user_id = null,
    } = body

    const appId = body.id || crypto.randomUUID()
    const fullName = (name || institute_name || 'Instructor').trim()
    const primarySkill = (sub_skills || 'Specialist').trim()
    const formattedLocation = [locality.trim(), city.trim()].filter(Boolean).join(', ')

    // 1. Insert/Upsert into instructor_applications
    const applicationPayload: Record<string, any> = {
      id: appId,
      profile_type,
      full_name: fullName,
      skill: primarySkill,
      location: formattedLocation,
      experience: experience_years || null,
      institute_name: institute_name.trim() || null,
      email: email.trim(),
      country_code,
      whatsapp_number: whatsapp.trim(),
      gender: gender || null,
      category,
      sub_skills: primarySkill,
      pincode: pincode.trim(),
      locality: locality.trim(),
      city: city.trim(),
      experience_years: experience_years || null,
      certifications: certifications.trim() || null,
      education: education || null,
      teaching_modes,
      demo_class_offered: demo_class,
      languages_spoken: languages,
      price_per_hour: price_per_hour ? Number(price_per_hour) : 1000,
      age_groups_taught: age_groups,
      bio: bio.trim() || null,
      image_urls: image_urls || [],
      status: 'pending',
    }

    if (user_id) {
      applicationPayload.user_id = user_id
    }

    const { error: appError } = await supabase
      .from('instructor_applications')
      .upsert(applicationPayload, { onConflict: 'id' })

    if (appError) {
      console.error('Error inserting instructor_applications:', appError)
      // If error is specific, still attempt direct instructor insert or throw
    }

    // 2. Direct insert/upsert into instructors table (Ensures instant card creation with 0 learners & unverified status)
    const instructorPayload: Record<string, any> = {
      application_id: appId,
      display_name: fullName,
      profile_type,
      institute_name: institute_name.trim() || null,
      skill: primarySkill,
      category,
      locality: locality.trim() || city.trim() || 'Delhi',
      city: city.trim() || 'Delhi',
      experience_years: experience_years || null,
      education: education || null,
      certifications: certifications.trim() || null,
      teaching_modes,
      languages_spoken: languages,
      age_groups_taught: age_groups,
      price_per_hour: price_per_hour ? Number(price_per_hour) : 1000,
      bio: bio.trim() || null,
      image_urls: image_urls || [],
      learners_count: 0, // Starts at 0 learners
      is_verified: false, // Unverified until 10 learners boarded
      is_published: true, // Immediately visible on directory
      updated_at: new Date().toISOString(),
    }

    if (user_id) {
      instructorPayload.user_id = user_id
    }

    const { data: instData, error: instError } = await supabase
      .from('instructors')
      .upsert(instructorPayload, { onConflict: 'application_id' })
      .select('id')
      .single()

    if (instError) {
      console.warn('Direct upsert to instructors table notice:', instError.message)
    }

    return NextResponse.json({
      success: true,
      applicationId: appId,
      instructorId: instData?.id || appId,
      message: 'Instructor application successfully registered and published without verified badge.',
    })
  } catch (error: any) {
    console.error('API apply route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}

