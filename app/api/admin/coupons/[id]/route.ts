import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { couponCreateSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = couponCreateSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('coupons')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
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
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
