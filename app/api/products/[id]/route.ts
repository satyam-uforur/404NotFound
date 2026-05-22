import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createDataClient()

    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug), product_variants(*, variant_images(*)), product_tags(tag)`)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const result = {
      ...data,
      tags: data.product_tags?.map((pt: any) => pt.tag) || [],
      product_tags: undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
