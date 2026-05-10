import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/stores/[slug]/customers/orders?phone=xxx
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

    // Find customer
    const { data: customer } = await getSupabaseAdmin()
      .from('customers')
      .select('id')
      .eq('store_id', store.id)
      .eq('phone', phone)
      .single();

    if (!customer) return NextResponse.json([]);

    // Get orders with items
    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*, order_items(quantity, price_at_time, products(name))')
      .eq('store_id', store.id)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
