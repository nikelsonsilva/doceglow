import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/stores/[slug]/products - Public: list active products for a store
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Get store
    const { data: store, error: storeErr } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/stores/[slug]/products - Admin: create product
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
    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .insert([{ ...body, store_id: store.id }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/stores/[slug]/products - Admin: update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await getSupabaseAdmin()
      .from('products')
      .update(updateData)
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

// DELETE /api/stores/[slug]/products - Admin: delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await getSupabaseAdmin()
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', store.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
