import { requireAuth } from '@/lib/admin-guard'
import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay credentials not configured')
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) return authError!

    const dataClient = createDataClient()
    const { orderId, amount } = await request.json()

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderId,
        notes: {
          order_id: orderId,
          user_id: user.id,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Razorpay error:', error)
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      )
    }

    const razorpayOrder = await response.json()

    await dataClient
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', orderId)

    return NextResponse.json({
      orderId: razorpayOrder.id,
      keyId: RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR',
      receipt: orderId,
    })
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) return authError!

    const dataClient = createDataClient()
    const { orderId, razorpayPaymentId, razorpaySignature } = await request.json()

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const body = `${orderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const { data, error } = await dataClient
      .from('orders')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        payment_status: 'completed',
        status: 'payment_confirmed',
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    fetch(`${new URL(request.url).origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_confirmation',
        to: user.email,
        subject: `Payment Confirmed - Order #${data.order_number}`,
        data: {
          customerName: user.user_metadata?.full_name || user.email,
          orderId: data.id,
          orderNumber: data.order_number,
          total: data.total_amount,
        },
      }),
    }).catch(() => {})

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
