import { NextRequest, NextResponse } from 'next/server'

// Qikink shipping integration
// Qikink documentation: https://www.qikink.com/api

interface ShippingRequest {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
  }
  items: Array<{
    name: string
    quantity: number
    weight: number // in kg
  }>
  totalWeight: number
  totalAmount: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingRequest = await request.json()

    // Validate request
    if (
      !body.orderId ||
      !body.customerName ||
      !body.shippingAddress ||
      !body.items
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, create Qikink shipment
    // const qikinkResponse = await createQikinkShipment({
    //   order_id: body.orderId,
    //   shipper_name: '404NoTFound IN',
    //   shipper_email: 'shipping@404notfound-in.vercel.app',
    //   shipper_phone: process.env.QIKINK_SHIPPER_PHONE,
    //   receiver_name: body.customerName,
    //   receiver_email: body.customerEmail,
    //   receiver_phone: body.customerPhone,
    //   receiver_address: {
    //     address_line_1: body.shippingAddress.street,
    //     city: body.shippingAddress.city,
    //     state: body.shippingAddress.state,
    //     pin_code: body.shippingAddress.postalCode,
    //   },
    //   items: body.items,
    //   total_weight: body.totalWeight,
    //   cod_amount: body.totalAmount,
    // })

    // Mock response for development
    const mockTrackingNumber = `QIKINK${Date.now()}`
    const mockShippingLabel = `https://example.com/label/${mockTrackingNumber}.pdf`

    return NextResponse.json({
      success: true,
      orderId: body.orderId,
      trackingNumber: mockTrackingNumber,
      shippingLabel: mockShippingLabel,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      message: 'Shipment created successfully',
      // In production, return Qikink response
      // qikinkId: qikinkResponse.shipment_id,
      // qikinkTrackingUrl: qikinkResponse.tracking_url,
    })
  } catch (error) {
    console.error('Shipping creation error:', error)
    return NextResponse.json(
      { error: 'Shipping creation failed' },
      { status: 500 }
    )
  }
}
