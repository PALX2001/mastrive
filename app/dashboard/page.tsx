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

        // Check user_metadata first
        if (user.user_metadata?.role === 'instructor') {
          router.replace('/dashboard/instructor')
          return
        }

        // Check profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role === 'instructor') {
          router.replace('/dashboard/instructor')
          return
        }

        // Check approved application
        const { data: appData } = await supabase
          .from('instructor_applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle()

        if (appData) {
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
