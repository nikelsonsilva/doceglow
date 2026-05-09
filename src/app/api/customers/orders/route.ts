import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/customers/orders?phone=85997505422
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    // Find customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (!customer) return NextResponse.json([]);

    // Fetch orders with items + product details
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, total_amount, status, created_at,
        order_items (
          quantity, price_at_time,
          products ( id, name, price, image_url, category )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return NextResponse.json(orders || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
