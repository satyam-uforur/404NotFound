export const dynamic = 'force-dynamic'

import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { productCreateSchema } from '@/lib/validations'
import { sanitizeSlug } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  try {
    const supabase = createDataClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const rawSort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const pageParam = parseInt(searchParams.get('page') || '1')
    const offset = parseInt(searchParams.get('offset') || String((pageParam - 1) * limit))
    const productType = searchParams.get('type')
    const tag = searchParams.get('tag')
    const status = searchParams.get('status') || 'active'

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      'newest': { column: 'created_at', ascending: false },
      'price-low': { column: 'price', ascending: true },
      'price-high': { column: 'price', ascending: false },
      'name': { column: 'name', ascending: true },
      'created_at': { column: 'created_at', ascending: false },
    }
    const sort = sortMap[rawSort] || sortMap['newest']

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug), product_variants(*)', { count: 'exact' })
      .eq('is_active', true)
      .order(sort.column, { ascending: sort.ascending })
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      const normalizedCat = category.toLowerCase().replace(/\s+/g, '-')
      const { data: categoryBySlug } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', normalizedCat)
        .single()

      if (categoryBySlug) {
        query = query.eq('category_id', categoryBySlug.id)
      } else {
        const { data: categoryByName } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', category)
          .single()
        if (categoryByName) {
          query = query.eq('category_id', categoryByName.id)
        }
      }
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (productType) {
      query = query.eq('product_type', productType)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (tag) {
      const { data: tagProducts } = await supabase
        .from('product_tags')
        .select('product_id')
        .eq('tag', tag.toLowerCase())
      if (tagProducts && tagProducts.length > 0) {
        query = query.in('id', tagProducts.map(tp => tp.product_id))
      } else if (tag) {
        return NextResponse.json({ products: [], total: 0, limit, offset })
      }
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      products: data,
      total: count,
      page: pageParam,
      limit,
      offset,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { variants, tags, ...productData } = body

    if (!productData.slug && productData.name) {
      productData.slug = sanitizeSlug(productData.name)
    }

    const parsed = productCreateSchema.safeParse(productData)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const supabase = createDataClient()

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([parsed.data])
      .select()
      .single()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 })
    }

    if (tags && tags.length > 0) {
      const tagRows = tags.map((tag: string) => ({
        product_id: product.id,
        tag: tag.trim().toLowerCase(),
      }))
      await supabase.from('product_tags').insert(tagRows)
    }

    if (variants && variants.length > 0) {
      const variantRows = variants.map((v: any) => ({
        ...v,
        product_id: product.id,
      }))
      await supabase.from('product_variants').insert(variantRows)
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('[Products] Create error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
