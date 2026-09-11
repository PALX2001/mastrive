import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwxhtxqvlsmspwazkaik.supabase.co'
const supabaseAnonKey = 'sb_publishable_duxFFpmuESkr6dThcJTqxQ_C1IL6vli'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing connection to Supabase...')
  
  // Test select instructors
  const { data: instData, error: instError } = await supabase.from('instructors').select('*')
  console.log('SELECT instructors:', { dataCount: instData?.length, error: instError?.message })

  // Test select instructor_applications
  const { data: appData, error: appError } = await supabase.from('instructor_applications').select('*')
  console.log('SELECT instructor_applications:', { dataCount: appData?.length, error: appError?.message })

  // Test insert into instructor_applications
  const testId = '00000000-0000-0000-0000-000000000001'
  const { data: insertData, error: insertError } = await supabase
    .from('instructor_applications')
    .insert({
      id: testId,
      full_name: 'Test Coach',
      skill: 'Boxing',
      location: 'Delhi',
      email: 'test@example.com',
      whatsapp_number: '9999999999',
      status: 'pending'
    })
    .select()

  console.log('INSERT instructor_applications:', { insertData, error: insertError?.message })
  
  if (!insertError) {
    await supabase.from('instructor_applications').delete().eq('id', testId)
    console.log('Cleaned up test row.')
  }
}

test()

