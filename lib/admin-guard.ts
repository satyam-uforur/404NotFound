import { createAuthServerClient } from '@/lib/supabase/auth-server'
import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAdmin(request?: NextRequest) {
  const supabase = await createAuthServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const dataClient = createDataClient()
  const { data: profile } = await dataClient
    .from('profiles')
    .select('role, id, email, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, profile, error: null }
}

export async function requireAuth() {
  const supabase = await createAuthServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const dataClient = createDataClient()
  const { data: profile } = await dataClient
    .from('profiles')
    .select('role, id, email, full_name')
    .eq('id', user.id)
    .single()

  return { user, profile: profile || null, error: null }
}
