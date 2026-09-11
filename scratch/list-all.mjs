import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwxhtxqvlsmspwazkaik.supabase.co'
const supabaseAnonKey = 'sb_publishable_duxFFpmuESkr6dThcJTqxQ_C1IL6vli'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listAll() {
  const { data: inst } = await supabase.from('instructors').select('id, display_name, skill')
  console.log('Instructors in DB:', inst)

  const { data: apps } = await supabase.from('instructor_applications').select('id, full_name, skill')
  console.log('Applications in DB:', apps)
}

listAll()
