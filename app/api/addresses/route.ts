import { createDataClient } from '@/lib/supabase/data-server';
import { requireAuth } from '@/lib/admin-guard';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  const supabase = createDataClient();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { first_name, last_name, phone, email, street_address, city, state, postal_code, country, type, is_default } = body;
    
    // Support either full_name or first_name+last_name
    const full_name = body.full_name || `${first_name || ''} ${last_name || ''}`.trim();

    if (!full_name || !phone || !email || !street_address || !city || !state || !postal_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createDataClient();
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: user.id,
        full_name,
        phone,
        email,
        street_address,
        city,
        state,
        postal_code,
        country: country || 'India',
        type: type || 'shipping',
        is_default: is_default || false,
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
