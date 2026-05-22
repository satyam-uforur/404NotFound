export const dynamic = 'force-dynamic'

import { createDataClient } from '@/lib/supabase/data-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createDataClient()

    const [bannersRes, featuredRes, latestRes, categoriesRes] = await Promise.all([
      supabase.from('banners').select('*').eq('is_active', true).order('display_order').limit(5),
      supabase.from('products').select('id, name, slug, price, mrp, image_url, images, categories(name)').eq('is_active', true).eq('featured', true).eq('status', 'active').limit(8),
      supabase.from('products').select('id, name, slug, price, mrp, image_url, images, categories(name)').eq('is_active', true).eq('status', 'active').order('created_at', { ascending: false }).limit(8),
      supabase.from('categories').select('*').eq('is_active', true).is('parent_id', null).order('display_order'),
    ])

    return NextResponse.json({
      banners: bannersRes.data || [],
      featured: featuredRes.data || [],
      latest: latestRes.data || [],
      categories: categoriesRes.data || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 })
  }
}
