import { NextRequest, NextResponse } from 'next/server'

interface EmailRequest {
  type: 'order_confirmation' | 'shipment_update' | 'order_approval' | 'newsletter'
  to: string
  subject: string
  data: Record<string, any>
}

const BRAND_BG = '#0a0a0a'
const BRAND_CARD = '#141414'
const BRAND_ACCENT = '#e53935'
const BRAND_TEXT = '#f5f5f5'
const BRAND_MUTED = '#888888'

function wrapInBrandLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND_TEXT};">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_BG};padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:${BRAND_CARD};border-radius:12px;overflow:hidden;">
              <tr>
                <td style="background-color:${BRAND_ACCENT};padding:24px 32px;text-align:center;">
                  <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:2px;color:#fff;">404NOTFOUND</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #222;text-align:center;">
                  <p style="margin:0;color:${BRAND_MUTED};font-size:12px;">
                    &copy; ${new Date().getFullYear()} 404NotFoundIN. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function getOrderConfirmationTemplate(data: any): string {
  const itemsHtml = (data.items || []).map(
    (item: any) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #222;color:${BRAND_TEXT};">${item.product_name || ''}</td>
        <td style="padding:10px 0;border-bottom:1px solid #222;color:${BRAND_TEXT};text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #222;color:${BRAND_TEXT};text-align:right;">₹${item.total_price || item.price_per_unit}</td>
      </tr>
    `
  ).join('')

  return wrapInBrandLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_ACCENT};">Order Confirmed!</h2>
    <p style="margin:0 0 24px;color:${BRAND_MUTED};">Thank you for shopping with us, <strong style="color:${BRAND_TEXT};">${data.customerName}</strong>!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:2px solid ${BRAND_ACCENT};color:${BRAND_MUTED};font-weight:600;font-size:12px;text-transform:uppercase;">Item</td>
        <td style="padding:10px 0;border-bottom:2px solid ${BRAND_ACCENT};color:${BRAND_MUTED};font-weight:600;font-size:12px;text-transform:uppercase;text-align:center;">Qty</td>
        <td style="padding:10px 0;border-bottom:2px solid ${BRAND_ACCENT};color:${BRAND_MUTED};font-weight:600;font-size:12px;text-transform:uppercase;text-align:right;">Price</td>
      </tr>
      ${itemsHtml}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 0;color:${BRAND_MUTED};">Order Number</td>
        <td style="padding:12px 0;color:${BRAND_TEXT};text-align:right;font-weight:600;">${data.orderNumber || data.orderId}</td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:2px solid ${BRAND_ACCENT};"></td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-size:18px;font-weight:700;color:${BRAND_TEXT};">Total</td>
        <td style="padding:12px 0;font-size:18px;font-weight:700;color:${BRAND_ACCENT};text-align:right;">₹${data.total}</td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:${BRAND_MUTED};font-size:14px;">We'll notify you when your order is on its way.</p>
  `)
}

function getShipmentUpdateTemplate(data: any): string {
  return wrapInBrandLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_ACCENT};">Your Order is On Its Way!</h2>
    <p style="margin:0 0 24px;color:${BRAND_MUTED};">Great news, <strong style="color:${BRAND_TEXT};">${data.customerName}</strong>!</p>

    <div style="background-color:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;color:${BRAND_MUTED};font-size:12px;text-transform:uppercase;font-weight:600;">Tracking Number</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND_ACCENT};">${data.trackingNumber || 'N/A'}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;color:${BRAND_MUTED};">Order</td>
        <td style="padding:8px 0;color:${BRAND_TEXT};text-align:right;font-weight:600;">#${data.orderId}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:${BRAND_MUTED};">Estimated Delivery</td>
        <td style="padding:8px 0;color:${BRAND_TEXT};text-align:right;font-weight:600;">${data.estimatedDelivery || 'Soon'}</td>
      </tr>
    </table>
  `)
}

function getOrderApprovalTemplate(data: any): string {
  return wrapInBrandLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_ACCENT};">Order Approved!</h2>
    <p style="margin:0 0 24px;color:${BRAND_MUTED};">Hey <strong style="color:${BRAND_TEXT};">${data.customerName}</strong>,</p>

    <p style="margin:0 0 16px;color:${BRAND_TEXT};line-height:1.6;">
      Great news! Your order <strong style="color:${BRAND_ACCENT};">#${data.orderId}</strong> has been approved and is being prepared for shipment.
    </p>

    <div style="background-color:#1a1a1a;border-radius:8px;padding:16px;text-align:center;">
      <p style="margin:0;color:${BRAND_ACCENT};font-weight:600;font-size:16px;">We'll notify you once it ships!</p>
    </div>
  `)
}

function getNewsletterTemplate(data: any): string {
  return wrapInBrandLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND_TEXT};">${data.title}</h2>
    <p style="margin:0 0 24px;color:${BRAND_MUTED};line-height:1.6;">${data.content}</p>
    <a href="${data.ctaLink || '#'}" style="display:inline-block;background-color:${BRAND_ACCENT};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
      ${data.ctaText || 'Shop Now'}
    </a>
  `)
}

function selectTemplate(type: string, data: any): string {
  switch (type) {
    case 'order_confirmation':
      return getOrderConfirmationTemplate(data)
    case 'shipment_update':
      return getShipmentUpdateTemplate(data)
    case 'order_approval':
      return getOrderApprovalTemplate(data)
    case 'newsletter':
      return getNewsletterTemplate(data)
    default:
      return wrapInBrandLayout('<p style="color:#f5f5f5;">Email content</p>')
  }
}

async function sendWithResend(to: string, subject: string, html: string) {
  const { default: Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: '404NotFoundIN <noreply@404notfound.in>',
    to,
    subject,
    html,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()

    if (!body.to || !body.type || !body.subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const htmlContent = selectTemplate(body.type, body.data)

    if (process.env.RESEND_API_KEY) {
      try {
        const response = await sendWithResend(body.to, body.subject, htmlContent)
        return NextResponse.json({
          success: true,
          message: `Email sent to ${body.to}`,
          id: (response as any)?.id,
        })
      } catch (resendError) {
        console.error('Resend error, falling back to console:', resendError)
      }
    }

    console.log(`[Email] to: ${body.to}, subject: ${body.subject}, type: ${body.type}`)

    return NextResponse.json({
      success: true,
      message: `Email logged (Resend not configured) for ${body.to}`,
    })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Email sending failed' },
      { status: 500 }
    )
  }
}
