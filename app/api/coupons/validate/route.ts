import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'
import { couponValidateSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = couponValidateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { code, cart_total } = parsed.data
    const supabase = createDataClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    const now = new Date()
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ error: 'Coupon not yet active' }, { status: 400 })
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: 'Coupon expired' }, { status: 400 })
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }
    if (cart_total < coupon.min_order_amount) {
      return NextResponse.json({ error: `Minimum order ₹${coupon.min_order_amount}` }, { status: 400 })
    }

    const discount = coupon.type === 'percentage'
      ? Math.round(cart_total * coupon.value / 100)
      : coupon.value

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.min(discount, cart_total),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
