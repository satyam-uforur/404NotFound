import { createDataClient } from '@/lib/supabase/data-server'
import { requireAdmin } from '@/lib/admin-guard'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  try {
    const supabase = createDataClient()

    const { data: lowStock } = await supabase
      .from('products')
      .select('id, name, sku, stock, low_stock_threshold, image_url')
      .lt('stock', 5)
      .eq('is_active', true)
      .order('stock', { ascending: true })

    const { data: outOfStock } = await supabase
      .from('products')
      .select('id, name, sku, stock, image_url')
      .eq('stock', 0)
      .eq('is_active', true)

    const { data: recentLogs } = await supabase
      .from('inventory_logs')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      lowStock: lowStock || [],
      outOfStock: outOfStock || [],
      recentLogs: recentLogs || [],
      summary: {
        lowStockCount: lowStock?.length || 0,
        outOfStockCount: outOfStock?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
