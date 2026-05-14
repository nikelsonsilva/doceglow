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

    // For products with options, load their option groups + options
    const productsWithOptions = data?.filter(p => p.has_options) || [];
    if (productsWithOptions.length > 0) {
      const productIds = productsWithOptions.map(p => p.id);
      
      const { data: groups } = await getSupabaseAdmin()
        .from('product_option_groups')
        .select('*, product_options(*)')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true });

      // Attach groups to their products
      const groupsByProduct = new Map<string, any[]>();
      groups?.forEach(g => {
        const list = groupsByProduct.get(g.product_id) || [];
        // Sort options within each group
        g.product_options?.sort((a: any, b: any) => a.sort_order - b.sort_order);
        list.push(g);
        groupsByProduct.set(g.product_id, list);
      });

      data?.forEach(p => {
        if (p.has_options) {
          (p as any).option_groups = groupsByProduct.get(p.id) || [];
        }
      });
    }

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
    const { option_groups, ...productData } = body;

    const supabase = getSupabaseAdmin();

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert([{ ...productData, store_id: store.id, has_options: !!option_groups?.length }])
      .select()
      .single();

    if (error) throw error;

    // Create option groups + options if provided
    if (option_groups?.length) {
      for (const group of option_groups) {
        const { data: createdGroup, error: groupError } = await supabase
          .from('product_option_groups')
          .insert([{
            product_id: product.id,
            name: group.name,
            min_select: group.min_select ?? 0,
            max_select: group.max_select ?? 1,
            price_mode: group.price_mode ?? 'add',
            sort_order: group.sort_order ?? 0,
          }])
          .select()
          .single();

        if (groupError) throw groupError;

        if (group.options?.length) {
          const optionsToInsert = group.options.map((opt: any, idx: number) => ({
            group_id: createdGroup.id,
            name: opt.name,
            extra_price: opt.extra_price ?? 0,
            sort_order: idx,
            active: true,
          }));

          const { error: optError } = await supabase
            .from('product_options')
            .insert(optionsToInsert);

          if (optError) throw optError;
        }
      }
    }

    return NextResponse.json(product, { status: 201 });
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
    const { id, option_groups, ...updateData } = body;

    const supabase = getSupabaseAdmin();

    // If option_groups provided, update has_options flag
    if (option_groups !== undefined) {
      updateData.has_options = !!option_groups?.length;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('store_id', store.id)
      .select()
      .single();

    if (error) throw error;

    // If option_groups provided, replace all groups + options
    if (option_groups !== undefined) {
      // Delete existing groups (cascade deletes options)
      await supabase
        .from('product_option_groups')
        .delete()
        .eq('product_id', id);

      // Re-create groups + options
      if (option_groups?.length) {
        for (const group of option_groups) {
          const { data: createdGroup, error: groupError } = await supabase
            .from('product_option_groups')
            .insert([{
              product_id: id,
              name: group.name,
              min_select: group.min_select ?? 0,
              max_select: group.max_select ?? 1,
              price_mode: group.price_mode ?? 'add',
              sort_order: group.sort_order ?? 0,
            }])
            .select()
            .single();

          if (groupError) throw groupError;

          if (group.options?.length) {
            const optionsToInsert = group.options.map((opt: any, idx: number) => ({
              group_id: createdGroup.id,
              name: opt.name,
              extra_price: opt.extra_price ?? 0,
              sort_order: idx,
              active: true,
            }));

            const { error: optError } = await supabase
              .from('product_options')
              .insert(optionsToInsert);

            if (optError) throw optError;
          }
        }
      }
    }

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
