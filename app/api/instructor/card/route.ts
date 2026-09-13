import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const serverSupabase = await createServerSupabase()
    const { data: authData, error: authError } = await serverSupabase.auth.getUser()
    
    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to update your instructor card.' },
        { status: 401 }
      )
    }

    const user = authData.user
    const body = await req.json()
    const {
      displayName,
      skill,
      category,
      pricePerHour,
      locality,
      city,
      teachingModes,
      bio,
      experienceYears,
      imageUrls,
      isPublished,
      slug,
    } = body

    // Build database client (fallback to admin client if service key exists for reliable write)
    let dbClient = serverSupabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      dbClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwxhtxqvlsmspwazkaik.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      ) as any
    }

    const cleanedImages = Array.isArray(imageUrls)
      ? imageUrls.filter((u: any) => typeof u === 'string' && u.trim().length > 0)
      : []

    const cleanDisplayName = (displayName || user.user_metadata?.full_name || 'Instructor').trim()
    const cleanSkill = (skill || 'Coaching').trim()
    const cleanCategory = (category || 'fitness').trim().toLowerCase()
    const cleanPrice = Number(pricePerHour) > 0 ? Number(pricePerHour) : 1000
    const cleanLocality = (locality || 'Delhi').trim()
    const cleanCity = (city || 'Delhi').trim()
    const cleanModes = Array.isArray(teachingModes) && teachingModes.length > 0
      ? teachingModes
      : ['In-Person', 'Online']
    const cleanBio = (bio || '').trim()
    const cleanExp = (experienceYears || '3').toString().trim()
    const cleanPublished = isPublished !== false

    const baseSlug = cleanDisplayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'instructor'
    const finalSlug = slug || `${baseSlug}-${user.id.slice(0, 6)}`

    // Check if instructor row already exists for this user
    const { data: existingInst } = await dbClient
      .from('instructors')
      .select('id, slug, image_urls, learners_count, rating, reviews_count')
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle()

    const nowIso = new Date().toISOString()

    const instructorPayload: Record<string, any> = {
      user_id: user.id,
      display_name: cleanDisplayName,
      skill: cleanSkill,
      category: cleanCategory,
      price_per_hour: cleanPrice,
      locality: cleanLocality,
      city: cleanCity,
      teaching_modes: cleanModes,
      bio: cleanBio,
      experience_years: cleanExp,
      image_urls: cleanedImages,
      is_published: cleanPublished,
      slug: existingInst?.slug || finalSlug,
      updated_at: nowIso,
    }

    let savedInstructor = null

    if (existingInst?.id) {
      // Update existing
      const { data, error } = await dbClient
        .from('instructors')
        .update(instructorPayload)
        .eq('id', existingInst.id)
        .select('*')
        .single()

      if (error) {
        console.warn('Direct id update failed, trying user_id:', error.message)
        const { data: fallbackData, error: fallbackError } = await dbClient
          .from('instructors')
          .update(instructorPayload)
          .eq('user_id', user.id)
          .select('*')
          .single()
        if (fallbackError) throw fallbackError
        savedInstructor = fallbackData
      } else {
        savedInstructor = data
      }
    } else {
      // Insert new instructor profile
      const { data, error } = await dbClient
        .from('instructors')
        .insert({
          id: user.id,
          ...instructorPayload,
          learners_count: 0,
          is_verified: true,
          rating: 5.0,
          reviews_count: 0,
          created_at: nowIso,
        })
        .select('*')
        .single()

      if (error) {
        // Fallback upsert
        const { data: upsertData, error: upsertError } = await dbClient
          .from('instructors')
          .upsert({
            id: user.id,
            ...instructorPayload,
          }, { onConflict: 'id' })
          .select('*')
          .single()
        if (upsertError) throw upsertError
        savedInstructor = upsertData
      } else {
        savedInstructor = data
      }
    }

    // Also update profiles table for global consistency
    try {
      const primaryAvatar = cleanedImages[0] || null
      await dbClient
        .from('profiles')
        .update({
          full_name: cleanDisplayName,
          skill: cleanSkill,
          role: 'instructor',
          ...(primaryAvatar ? { avatar_url: primaryAvatar } : {}),
          updated_at: nowIso,
        })
        .eq('id', user.id)
    } catch (profErr) {
      console.warn('Profile sync note:', profErr)
    }

    return NextResponse.json({
      success: true,
      instructor: savedInstructor,
      message: 'Instructor card and media updated successfully',
    })
  } catch (error: any) {
    console.error('Save instructor card API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to save instructor card' },
      { status: 500 }
    )
  }
}

