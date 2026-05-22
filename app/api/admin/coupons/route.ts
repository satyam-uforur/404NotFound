import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'
import { couponCreateSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const parsed = couponCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('coupons')
      .insert([parsed.data])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
