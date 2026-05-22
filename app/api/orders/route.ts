import { requireAuth } from '@/lib/admin-guard'
import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) return authError!

    const dataClient = createDataClient()
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === 'true'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1

    if (admin) {
      const { data: profile } = await dataClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    let query = dataClient
      .from('orders')
      .select(
        `
        *,
        order_items(*),
        shipping_address:addresses!shipping_address_id(*),
        billing_address:addresses!billing_address_id(*)
      `
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!admin) {
      query = query.eq('user_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) return authError!

    const dataClient = createDataClient()
    const {
      items,
      shippingAddressId,
      billingAddressId,
      subtotal,
      tax,
      shippingCost,
      discount,
      totalAmount,
      couponCode,
    } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (item.variant_id) {
        const { data: variant } = await dataClient
          .from('product_variants')
          .select('stock, products(stock)')
          .eq('id', item.variant_id)
          .single()

        if (!variant || (variant.stock !== null && variant.stock < item.quantity)) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.product_name || 'variant'}` },
            { status: 400 }
          )
        }

        const { count } = await dataClient
          .from('product_variants')
          .update({ stock: variant.stock - item.quantity })
          .eq('id', item.variant_id)
          .gte('stock', item.quantity)

        if (count === 0) {
          return NextResponse.json(
            { error: `Stock reservation failed for ${item.product_name || 'variant'}` },
            { status: 409 }
          )
        }
      } else {
        const { data: product } = await dataClient
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (!product || (product.stock !== null && product.stock < item.quantity)) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.product_name || 'product'}` },
            { status: 400 }
          )
        }

        const { error: stockError } = await dataClient
          .rpc('decrement_stock', { p_id: item.product_id, qty: item.quantity })

        if (stockError) {
          const { data: updated } = await dataClient
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id)
            .gte('stock', item.quantity)
            .select()

          if (!updated || updated.length === 0) {
            return NextResponse.json(
              { error: `Stock reservation failed for ${item.product_name || 'product'}` },
              { status: 409 }
            )
          }
        }
      }
    }

    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    const { data: orderData, error: orderError } = await dataClient
      .from('orders')
      .insert([
        {
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          subtotal,
          tax,
          shipping_cost: shippingCost,
          discount,
          total_amount: totalAmount,
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId,
          coupon_code: couponCode || null,
          coupon_discount: discount || 0,
        },
      ])
      .select()
      .single()

    if (orderError) {
      for (const item of items) {
        if (item.variant_id) {
          await dataClient
            .from('product_variants')
            .rpc('increment', { stock: item.quantity })
            .eq('id', item.variant_id)
        } else {
          await dataClient
            .from('products')
            .update({ stock: dataClient.rpc('increase_stock', { p_id: item.product_id, qty: item.quantity }) })
            .eq('id', item.product_id)
        }
      }
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    const orderItems = items.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      total_price: item.total_price,
      size: item.size || null,
      color: item.color || null,
    }))

    const { error: itemsError } = await dataClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await dataClient.from('orders').delete().eq('id', orderData.id)
      for (const item of items) {
        if (item.variant_id) {
          const { data: v } = await dataClient
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single()
          if (v) {
            await dataClient
              .from('product_variants')
              .update({ stock: v.stock + item.quantity })
              .eq('id', item.variant_id)
          }
        } else {
          const { data: p } = await dataClient
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single()
          if (p) {
            await dataClient
              .from('products')
              .update({ stock: p.stock + item.quantity })
              .eq('id', item.product_id)
          }
        }
      }
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    await dataClient.from('cart_items').delete().eq('user_id', user.id)

    fetch(`${new URL(request.url).origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_confirmation',
        to: user.email,
        subject: `Order Confirmation - ${orderNumber}`,
        data: {
          customerName: user.user_metadata?.full_name || user.email,
          orderId: orderData.id,
          orderNumber,
          total: totalAmount,
          items: orderItems,
        },
      }),
    }).catch(() => {})

    return NextResponse.json(orderData, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
