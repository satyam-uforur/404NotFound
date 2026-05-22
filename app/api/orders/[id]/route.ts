import { requireAuth, requireAdmin } from '@/lib/admin-guard'
import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile, error: authError } = await requireAuth()
    if (authError || !user) return authError!

    const { id } = await params
    const dataClient = createDataClient()

    let query = dataClient
      .from('orders')
      .select(
        `
        *,
        order_items(
          *,
          product_variants(id, size, color, sku)
        ),
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*)
      `
      )
      .eq('id', id)
      .single()

    if (profile?.role !== 'admin') {
      query = query.eq('user_id', user.id)
    }

    const { data, error } = await query

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['payment_confirmed', 'cancelled'],
  payment_confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  payment_failed: ['pending', 'cancelled'],
  refunded: [],
  cancelled: [],
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await requireAdmin()
    if (authError || !user) return authError!

    const { id } = await params
    const dataClient = createDataClient()
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const { data: order } = await dataClient
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const allowed = VALID_TRANSITIONS[order.status]
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${order.status}' to '${status}'` },
        { status: 400 }
      )
    }

    const { data, error } = await dataClient
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
