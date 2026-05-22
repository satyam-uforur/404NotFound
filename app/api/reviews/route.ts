import { createDataClient } from '@/lib/supabase/data-server'
import { requireAuth } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { reviewCreateSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!productId) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 })
    }

    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const { data: stats } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)

    const avgRating = stats && stats.length > 0
      ? stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      : 0

    return NextResponse.json({ reviews: data || [], averageRating: Math.round(avgRating * 10) / 10, totalReviews: stats?.length || 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = reviewCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const supabase = createDataClient()

    const { data: existingOrder } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', parsed.data.product_id)
      .limit(1)

    const isVerified = existingOrder && existingOrder.length > 0

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...parsed.data, user_id: user.id, is_verified_purchase: isVerified }])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
