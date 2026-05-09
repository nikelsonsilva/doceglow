import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { customer_id, items, total_amount } = await request.json();
    if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([{ customer_id, total_amount, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    if (order && items?.length) {
      const orderItems = items.map((i: any) => ({
        order_id: order.id,
        product_id: i.id,
        quantity: i.quantity,
        price_at_time: i.price,
      }));
      await supabaseAdmin.from('order_items').insert(orderItems);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, customers(name, phone), order_items(quantity, price_at_time, products(name))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
