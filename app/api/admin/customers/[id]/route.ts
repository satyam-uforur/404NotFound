import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const supabase = createDataClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 404 })

    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, payment_status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', id)

    return NextResponse.json({ ...profile, orders: orders || [], addresses: addresses || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}
