import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyInstructorApplication } from '@/lib/instructor-verification'

function authErrorRedirect(origin: string, reason: string) {
  const errorUrl = new URL('/auth/auth-code-error', origin)
  errorUrl.searchParams.set('reason', reason)
  return NextResponse.redirect(errorUrl)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const instructorAppId = searchParams.get('instructor_app_id')
  
  // Default fallback if no explicit requested route is passed
  let next = searchParams.get('next')

  // Open Redirect Defense
  if (next && (!next.startsWith('/') || next.startsWith('//'))) {
    next = null
  }

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handled when called from Server Components
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // ——— Ensure base profile exists in Supabase profiles table for complete transparency ———
        let finalFullName: string | null = null
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('full_name, phone, city')
            .eq('id', user.id)
            .maybeSingle()

          const metaName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null

          const metaPhone = user.user_metadata?.phone || null
          const metaCity = user.user_metadata?.city || null

          // Only assign full_name if real name is provided; never dump raw email usernames like 2001palash into database
          finalFullName = existingProfile?.full_name || metaName || null
          const finalPhone = existingProfile?.phone || metaPhone || null
          const finalCity = existingProfile?.city || metaCity || null

          await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                full_name: finalFullName,
                email: user.email,
                phone: finalPhone,
                city: finalCity,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            )
        } catch (profErr) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[auth/callback] Base profile upsert notice:', profErr)
          }
        }

        // Complete email verification only after the signed-in account's email has
        // been matched to this exact application by the server-side verification helper.
        let verifiedApplication = false
        if (instructorAppId) {
          try {
            const verification = await verifyInstructorApplication(instructorAppId, user)
            verifiedApplication = verification.ok
          } catch (syncErr) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[auth/callback] Instructor verification notice:', syncErr)
            }
          }
        }

        if (!verifiedApplication && instructorAppId && process.env.NODE_ENV !== 'production') {
          console.warn('[auth/callback] Instructor application was not verified for this account.')
        }

        // Check instructor role from trusted app metadata or persisted server data.
        let isInstructor = user.app_metadata?.role === 'instructor' || verifiedApplication

        if (!isInstructor) {
          // Fetch role from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.role === 'instructor') {
            isInstructor = true
          }
        }

        if (!isInstructor) {
          // Check applications already verified for this authenticated user.
          const { data: application } = await supabase
            .from('instructor_applications')
            .select('status')
            .eq('user_id', user.id)
            .in('status', ['approved', 'verified'])
            .maybeSingle()

          if (application) {
            isInstructor = true
          }
        }

        // Determine destination
        let targetPath = next

        if (isInstructor) {
          targetPath = '/dashboard/instructor'
        } else if (!targetPath || targetPath === '/dashboard' || targetPath === '/profile' || targetPath === '/') {
          // If the user has no verified full_name, direct them to /onboarding so they can set their real name
          if (!finalFullName) {
            targetPath = '/onboarding'
          } else {
            targetPath = targetPath || '/profile'
          }
        }

        // Domain origin resolution
        // Security: Validate forwardedHost against allowed domains to prevent Host Header Injection
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isAllowedHost = Boolean(
          forwardedHost && (
            forwardedHost === 'mastrive.vercel.app' ||
            forwardedHost.endsWith('.vercel.app') ||
            forwardedHost === 'mastrive.com' ||
            forwardedHost === 'www.mastrive.com' ||
            forwardedHost.endsWith('.mastrive.com') ||
            forwardedHost.startsWith('localhost') ||
            forwardedHost.startsWith('127.0.0.1')
          )
        )
        
        if (forwardedHost && isAllowedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
        }
        return NextResponse.redirect(`${origin}${targetPath}`)
      }
    }

    const errorCode = error?.code || 'code_exchange_failed'
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[auth/callback] Failed to exchange auth code:', errorCode)
    }
    return authErrorRedirect(origin, errorCode)
  }

  return authErrorRedirect(origin, 'missing_code')
}
