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
      .from('cart_items')
      .select('*, products(id, name, price, mrp, image_url, images, stock), product_variants(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { productId, quantity = 1, size, color, variant_id } = await request.json()
    const supabase = createDataClient()

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('variant_id', variant_id || null)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data[0])
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: user.id,
        product_id: productId,
        quantity,
        variant_id: variant_id || null,
        size: size || null,
        color: color || null,
      }])
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
