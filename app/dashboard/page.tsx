'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const supabase = createClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login?next=/dashboard')
          return
        }

        // 1. Check user_metadata first
        if (user.user_metadata?.role === 'instructor' || user.app_metadata?.role === 'instructor') {
          router.replace('/dashboard/instructor')
          return
        }

        // 2. Explicit check for verified instructors
        if (user.email?.toLowerCase() === '2001palash@gmail.com') {
          router.replace('/dashboard/instructor')
          return
        }

        // 3. Check profiles table by id, or by email
        let { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile && user.email) {
          const { data: pEmail } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', user.email)
            .maybeSingle()
          if (pEmail) profile = pEmail
        }

        if (profile?.role === 'instructor') {
          router.replace('/dashboard/instructor')
          return
        }

        // 4. Check approved application or instructors table
        const { data: appData } = await supabase
          .from('instructor_applications')
          .select('id')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle()

        if (appData) {
          router.replace('/dashboard/instructor')
          return
        }

        const { data: instData } = await supabase
          .from('instructors')
          .select('id')
          .or(`id.eq.${user.id},user_id.eq.${user.id}`)
          .maybeSingle()

        if (instData) {
          router.replace('/dashboard/instructor')
          return
        }

        // Default for non-instructors
        router.replace('/profile')
      } catch (err) {
        router.replace('/profile')
      }
    }

    checkRoleAndRedirect()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0f12] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[#e01e37] border-t-transparent" />
        <p className="text-xs text-[#8b949e]">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
