import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle()

          const metaName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null

          // Only assign full_name if real name is provided; never dump raw email usernames like 2001palash into database
          finalFullName = existingProfile?.full_name || metaName || null

          await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                full_name: finalFullName,
                email: user.email,
                // NOTE: profiles table has no avatar_url column — avatar lives in auth.user_metadata only
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            )
        } catch (profErr) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[auth/callback] Base profile upsert notice:', profErr)
          }
        }

        // ——— POST VERIFICATION HOOK: Link instructor application + set role ———
        try {
          // Prefer explicit app_id from magic-link params, then fall back to user metadata
          const appId = instructorAppId || (user.user_metadata?.instructor_app_id as string | undefined)

          if (appId) {
            // Attach verified user id to the application row, promote status to 'verified'
            await supabase
              .from('instructor_applications')
              .update({
                user_id: user.id,
                verified_at: new Date().toISOString(),
                status: user.user_metadata?.role === 'instructor' ? 'approved' : 'verified',
              })
              .eq('id', appId)

            // Upsert profile with instructor role
            const profileName =
              user.user_metadata?.full_name ||
              finalFullName ||
              'Instructor'

            await supabase
              .from('profiles')
              .upsert(
                {
                  id: user.id,
                  full_name: profileName,
                  email: user.email,
                  role: 'instructor',
                  phone: user.user_metadata?.whatsapp_number || null,
                  city: user.user_metadata?.city || null,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              )
          }
        } catch (syncErr) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[auth/callback] Profile sync notice:', syncErr)
          }
        }

        // Check instructor role across multiple indicators
        let isInstructor = user.user_metadata?.role === 'instructor' || user.app_metadata?.role === 'instructor'

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

        if (!isInstructor && instructorAppId) {
          isInstructor = true
        }

        if (!isInstructor) {
          // Check approved instructor applications
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
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${targetPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
        } else {
          return NextResponse.redirect(`${origin}${targetPath}`)
        }
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
