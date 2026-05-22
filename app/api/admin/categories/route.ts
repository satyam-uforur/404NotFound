import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { categoryCreateSchema } from '@/lib/validations'
import { sanitizeSlug } from '@/lib/sanitize'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, parent:categories(id, name, slug)')
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const parsed = categoryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = parsed.data
    if (!data.slug) data.slug = sanitizeSlug(data.name)

    const supabase = createDataClient()
    const { data: created, error } = await supabase
      .from('categories')
      .insert([data])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
