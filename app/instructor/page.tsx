'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import InstructorApplicationView from '@/components/mastrive/instructor-application-view'

export default function InstructorPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkInstructor = async () => {
      const supabase = createClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!isMounted) return

        if (user) {
          if (user.user_metadata?.role === 'instructor' || user.app_metadata?.role === 'instructor') {
            router.replace('/dashboard/instructor')
            return
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.role === 'instructor') {
            router.replace('/dashboard/instructor')
            return
          }

          const { data: application } = await supabase
            .from('instructor_applications')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .maybeSingle()

          if (application) {
            router.replace('/dashboard/instructor')
            return
          }
        }
      } catch (err) {
        // Fallback to application form
      } finally {
        if (isMounted) setChecking(false)
      }
    }

    checkInstructor()

    return () => {
      isMounted = false
    }
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">
        <div className="size-6 animate-spin rounded-full border-2 border-[#e52e42] border-t-transparent" />
      </div>
    )
  }

  return <InstructorApplicationView />
}