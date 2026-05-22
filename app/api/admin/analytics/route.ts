import { requireAdmin } from '@/lib/admin-guard'
import { createDataClient } from '@/lib/supabase/data-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = createDataClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'

    const now = new Date()
    let startDate = new Date()
    if (period === '7days') startDate.setDate(now.getDate() - 7)
    else if (period === '30days') startDate.setDate(now.getDate() - 30)
    else if (period === '90days') startDate.setDate(now.getDate() - 90)
    else startDate = new Date('2020-01-01')

    const [ordersRes, pendingRes, itemsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, status, payment_status, created_at')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('order_approvals')
        .select('id')
        .eq('status', 'pending'),
      supabase
        .from('order_items')
        .select('product_id, product_name, quantity'),
    ])

    const ordersData = ordersRes.data || []
    const totalRevenue = ordersData.reduce((sum, o) => {
      return o.payment_status === 'completed' ? sum + (Number(o.total_amount) || 0) : sum
    }, 0)

    const productStats: Record<string, { name: string; sold: number }> = {}
    ;(itemsRes.data || []).forEach((item: any) => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = { name: item.product_name, sold: 0 }
      }
      productStats[item.product_id].sold += item.quantity
    })
    const topProductsList = Object.values(productStats)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)

    const statusBreakdown: Record<string, number> = {}
    ordersData.forEach((o: any) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
    })

    return NextResponse.json({
      totalOrders: ordersData.length,
      totalRevenue,
      averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
      pendingApprovals: pendingRes.data?.length || 0,
      topProducts: topProductsList,
      statusBreakdown,
      period,
    })
  } catch (error) {
    console.error('[Analytics] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
