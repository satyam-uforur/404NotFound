import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, is_active, category_id, categories(name)')
      .eq('is_active', true)
      .limit(5);

    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      products: products || [],
      productError: productError?.message || null,
      categories: categories || [],
      categoryError: categoryError?.message || null,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
