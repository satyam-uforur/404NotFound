import { NextRequest, NextResponse } from 'next/server'
import { createDataClient } from '@/lib/supabase/data-server'
import crypto from 'crypto'

interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment?: {
      entity: {
        id: string
        status: string
        amount: number
        currency: string
        order_id?: string
        notes: {
          orderId?: string
        }
      }
    }
    order?: {
      entity: {
        id: string
        status: string
      }
    }
    refund?: {
      entity: {
        id: string
        order_id: string
        status: string
      }
    }
  }
}

function verifyRazorpayWebhook(
  signature: string,
  body: string,
  webhookSecret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  return hash === signature
}

async function restoreStockForOrder(razorpayOrderId: string) {
  const dataClient = createDataClient()

  const { data: order } = await dataClient
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', razorpayOrderId)
    .single()

  if (!order) return

  const { data: orderItems } = await dataClient
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', order.id)

  if (!orderItems) return

  for (const item of orderItems) {
    if (item.variant_id) {
      const { data: variant } = await dataClient
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant_id)
        .single()
      if (variant) {
        await dataClient
          .from('product_variants')
          .update({ stock: variant.stock + item.quantity })
          .eq('id', item.variant_id)
      }
    } else {
      const { data: product } = await dataClient
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()
      if (product) {
        await dataClient
          .from('products')
          .update({ stock: product.stock + item.quantity })
          .eq('id', item.product_id)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    const body = await request.text()
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      if (!verifyRazorpayWebhook(signature, body, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload: RazorpayWebhookPayload = JSON.parse(body)
    const dataClient = createDataClient()

    switch (payload.event) {
      case 'payment.authorized':
        console.log('Payment authorized:', payload.payload.payment?.entity.id)
        break

      case 'payment.failed': {
        console.log('Payment failed:', payload.payload.payment?.entity.id)
        const razorpayOrderId = payload.payload.payment?.entity.order_id
        if (razorpayOrderId) {
          await restoreStockForOrder(razorpayOrderId)
          await dataClient
            .from('orders')
            .update({ status: 'payment_failed', payment_status: 'failed' })
            .eq('razorpay_order_id', razorpayOrderId)
        }
        break
      }

      case 'payment.captured': {
        const razorpayPaymentId = payload.payload.payment?.entity.id
        if (razorpayPaymentId) {
          await dataClient
            .from('orders')
            .update({ payment_status: 'completed' })
            .eq('razorpay_payment_id', razorpayPaymentId)
        }
        break
      }

      case 'order.paid': {
        const razorpayOrderId = payload.payload.order?.entity.id
        if (razorpayOrderId) {
          await dataClient
            .from('orders')
            .update({ status: 'payment_confirmed', payment_status: 'completed' })
            .eq('razorpay_order_id', razorpayOrderId)

          const { data: order } = await dataClient
            .from('orders')
            .select('id, user_id, order_number, total_amount')
            .eq('razorpay_order_id', razorpayOrderId)
            .single()

          if (order) {
            const { data: profile } = await dataClient
              .from('profiles')
              .select('email, full_name')
              .eq('id', order.user_id)
              .single()

            if (profile?.email) {
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
              fetch(`${baseUrl}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'order_confirmation',
                  to: profile.email,
                  subject: `Order Confirmed - ${order.order_number}`,
                  data: {
                    customerName: profile.full_name || profile.email,
                    orderId: order.id,
                    orderNumber: order.order_number,
                    total: order.total_amount,
                  },
                }),
              }).catch(() => {})
            }
          }
        }
        break
      }

      case 'refund.created': {
        const refundOrderId = payload.payload.refund?.entity.order_id
        if (refundOrderId) {
          await dataClient
            .from('orders')
            .update({ status: 'refunded' })
            .eq('razorpay_order_id', refundOrderId)
        }
        break
      }

      default:
        console.log('Unhandled webhook event:', payload.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
