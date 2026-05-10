import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/stores/[slug]/customers?phone=xxx - Lookup customer
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const phone = new URL(request.url).searchParams.get('phone');
    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { data, error } = await getSupabaseAdmin()
      .from('customers')
      .select('*')
      .eq('store_id', store.id)
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return NextResponse.json(data || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/stores/[slug]/customers - Create or update customer
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await request.json();
    const { phone, ...rest } = body;

    if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 });

    // Check if customer exists for this store
    const { data: existing } = await getSupabaseAdmin()
      .from('customers')
      .select('id')
      .eq('store_id', store.id)
      .eq('phone', phone)
      .single();

    if (existing) {
      // Update
      const { data, error } = await getSupabaseAdmin()
        .from('customers')
        .update(rest)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Insert
      const { data, error } = await getSupabaseAdmin()
        .from('customers')
        .insert([{ ...rest, phone, store_id: store.id }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
