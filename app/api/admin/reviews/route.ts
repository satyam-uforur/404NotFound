import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = createDataClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const productId = searchParams.get('product_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('reviews')
      .select('*, products(id, name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status === 'pending') query = query.eq('is_approved', false)
    else if (status === 'approved') query = query.eq('is_approved', true)
    if (productId) query = query.eq('product_id', productId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
