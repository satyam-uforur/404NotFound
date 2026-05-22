import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { productUpdateSchema } from '@/lib/validations'
import { sanitizeSlug } from '@/lib/sanitize'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const supabase = createDataClient()

    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug), product_variants(*, variant_images(*)), product_tags(tag)`)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const result = {
      ...data,
      tags: data.product_tags?.map((pt: any) => pt.tag) || [],
      product_tags: undefined,
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const { variants, tags, ...productData } = body

    if (productData.name && !productData.slug) {
      productData.slug = sanitizeSlug(productData.name)
    }

    const supabase = createDataClient()

    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    if (tags && Array.isArray(tags)) {
      await supabase.from('product_tags').delete().eq('product_id', id)
      if (tags.length > 0) {
        const tagRows = tags.map((tag: string) => ({ product_id: id, tag: tag.trim().toLowerCase() }))
        await supabase.from('product_tags').insert(tagRows)
      }
    }

    if (variants && Array.isArray(variants)) {
      const existingVariants = variants.filter((v: any) => v.id)
      const newVariants = variants.filter((v: any) => !v.id)

      for (const variant of existingVariants) {
        const { id: vid, variant_images, ...vData } = variant
        await supabase.from('product_variants').update(vData).eq('id', vid)
      }

      if (newVariants.length > 0) {
        const rows = newVariants.map((v: any) => {
          const { variant_images, ...vData } = v
          return { ...vData, product_id: id }
        })
        await supabase.from('product_variants').insert(rows)
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[Admin Product Update] Error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const supabase = createDataClient()

    const { error } = await supabase
      .from('products')
      .update({ is_active: false, status: 'archived' })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
