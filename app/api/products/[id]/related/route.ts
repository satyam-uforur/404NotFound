import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createDataClient()

    const { data: product } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', id)
      .single()

    if (!product) return NextResponse.json({ products: [] })

    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, mrp, image_url, images, categories(name)')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', id)
      .limit(8)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ products: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
  }
}
