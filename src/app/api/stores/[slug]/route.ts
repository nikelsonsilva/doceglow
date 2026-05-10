import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// GET /api/stores/[slug] - Get store public info
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data, error } = await getSupabaseAdmin()
      .from('stores')
      .select('id, slug, name, category, logo_url, primary_color, whatsapp_number, pix_key, active')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/stores/[slug] - Update store settings (owner only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { name, logo_url, primary_color, whatsapp_number, pix_key, category } = body;

    const { data, error } = await getSupabaseAdmin()
      .from('stores')
      .update({ 
        ...(name && { name }),
        ...(logo_url !== undefined && { logo_url }),
        ...(primary_color && { primary_color }),
        ...(whatsapp_number !== undefined && { whatsapp_number }),
        ...(pix_key !== undefined && { pix_key }),
        ...(category && { category }),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
