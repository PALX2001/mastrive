'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchApplications = async () => {
      try {
        const { data } = await supabase
          .from('instructor_applications')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (isMounted && data) setApps(data)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Error loading applications:', err)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchApplications()

    return () => {
      isMounted = false
    }
  }, [])

  const handleApprove = async (id: string, userId: string | null) => {
    const supabase = createClient()
    // 1. Mark application as approved
    await supabase.from('instructor_applications').update({ status: 'approved' }).eq('id', id)
    
    // 2. Update user profile role if linked
    if (userId) {
      await supabase.from('profiles').update({ role: 'instructor' }).eq('id', userId)
    }

    const { data } = await supabase
      .from('instructor_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setApps(data)
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] p-8 text-white">
      <h1 className="text-2xl font-bold">Instructor Applications</h1>
      {loading ? (
        <p className="mt-4 text-xs text-[#8b949e]">Loading applications...</p>
      ) : (
        <div className="mt-6 space-y-4">
          {apps.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#14171d] p-4">
              <div>
                <p className="font-bold">{item.full_name} <span className="text-xs font-normal text-[#8b949e]">({item.skill})</span></p>
                <p className="text-xs text-[#8b949e]">{item.location} • WhatsApp: {item.whatsapp_number}</p>
                <p className="mt-1 text-xs text-gray-400">{item.experience}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {item.status}
                </span>
                {item.status !== 'approved' && (
                  <button 
                    onClick={() => handleApprove(item.id, item.user_id)}
                    className="rounded-lg bg-[#e52e42] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c0182f]"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}