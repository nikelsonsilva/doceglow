import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/customers?phone=85997505422 - Find customer by phone
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    const { data, error } = await getSupabaseAdmin()
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(null); // Not found
    }
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/customers - Create or update customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, cep, street, number, neighborhood, city, state, complement } = body;

    // Check if customer exists
    const { data: existing } = await getSupabaseAdmin()
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      // Update
      const { data, error } = await getSupabaseAdmin()
        .from('customers')
        .update({ name, cep, street, number, neighborhood, city, state, complement })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Insert
      const { data, error } = await getSupabaseAdmin()
        .from('customers')
        .insert([{ phone, name, cep, street, number, neighborhood, city, state, complement }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
