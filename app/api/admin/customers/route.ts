import { createDataClient } from '@/lib/supabase/data-server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    // 1. Initialize Auth Admin Client
    const authSupabase = createClient(
      process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.AUTH_SUPABASE_SERVICE_ROLE_KEY!
    )
    const dataClient = createDataClient()

    // 2. Fetch users
    const { data: { users }, error: authUserError } = await authSupabase.auth.admin.listUsers()
    if (authUserError) return NextResponse.json({ error: authUserError.message }, { status: 400 })

    // 3. Fetch profiles from Data Supabase
    const { data: profiles, error: profileError } = await dataClient
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
    
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

    // 4. Merge
    const profileMap = new Map(profiles?.map(p => [p.id, p]))
    const customers = users.map(user => ({
      id: user.id,
      email: user.email,
      ...profileMap.get(user.id),
    }))

    return NextResponse.json(customers)
  } catch (error) {
    console.error('[Customers] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
