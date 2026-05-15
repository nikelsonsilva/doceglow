import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// POST /api/stores/[slug]/orders - Create order
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = getSupabaseAdmin();

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { customer_id, items, total_amount } = await request.json();
    if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 });

    // Validate stock before creating order
    if (items?.length) {
      const productIds = items.map((i: any) => i.id);
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock')
        .in('id', productIds);

      if (products) {
        for (const item of items) {
          const prod = products.find((p: any) => p.id === item.id);
          if (prod && prod.stock !== null && prod.stock < item.quantity) {
            return NextResponse.json(
              { error: `Estoque insuficiente para "${prod.name}". Disponível: ${prod.stock}` },
              { status: 400 }
            );
          }
        }
      }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{ customer_id, total_amount, status: 'pending', store_id: store.id }])
      .select()
      .single();

    if (error) throw error;

    if (order && items?.length) {
      const orderItems = items.map((i: any) => ({
        order_id: order.id,
        product_id: i.id,
        quantity: i.quantity,
        price_at_time: i.unitPrice || i.price,
        selected_options: i.selectedOptions || null,
      }));
      await supabase.from('order_items').insert(orderItems);

      // Decrement stock for products that track it
      for (const item of items) {
        try {
          await supabase.rpc('decrement_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity,
          });
        } catch {
          // Graceful: if RPC doesn't exist yet or stock is NULL, skip
        }
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/stores/[slug]/orders - Admin: list orders
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*, customers(id, name, phone, street, number, neighborhood, city, state), order_items(quantity, price_at_time, selected_options, products(name))')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/stores/[slug]/orders - Admin: update order status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .update({ status })
      .eq('id', id)
      .eq('store_id', store.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
