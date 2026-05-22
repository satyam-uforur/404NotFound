import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('order_number')

    if (!orderNumber) {
      return NextResponse.json({ error: 'order_number required' }, { status: 400 })
    }

    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('orders')
      .select('order_number, status, payment_status, tracking_number, estimated_delivery, created_at')
      .eq('order_number', orderNumber)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}
