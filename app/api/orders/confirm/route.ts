import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, razorpay_payment_id, razorpay_order_id } = body

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
      })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmed successfully',
    })
  } catch (error) {
    console.error('Order confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
