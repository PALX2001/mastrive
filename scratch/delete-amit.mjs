import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwxhtxqvlsmspwazkaik.supabase.co'
const supabaseAnonKey = 'sb_publishable_duxFFpmuESkr6dThcJTqxQ_C1IL6vli'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function deleteAmit() {
  console.log('Searching for Amit Singh in instructors and instructor_applications...')

  // 1. Delete from instructors
  const { data: instDel, error: instErr } = await supabase
    .from('instructors')
    .delete()
    .ilike('display_name', '%amit%')
    .select()

  console.log('Deleted from instructors:', { instDel, error: instErr?.message })

  // 2. Delete from instructor_applications
  const { data: appDel, error: appErr } = await supabase
    .from('instructor_applications')
    .delete()
    .ilike('full_name', '%amit%')
    .select()

  console.log('Deleted from instructor_applications:', { appDel, error: appErr?.message })
}

deleteAmit()
