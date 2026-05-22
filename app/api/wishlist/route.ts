import { createDataClient } from '@/lib/supabase/data-server'
import { requireAuth } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(id, name, slug, price, mrp, image_url, categories(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId } = await request.json()
    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{ user_id: user.id, product_id: productId }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId } = await request.json()
    const supabase = createDataClient()
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
