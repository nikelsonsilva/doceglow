import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('store_settings')
      .select('*')
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return NextResponse.json(data || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...payload } = body;

    if (id) {
      const { data, error } = await getSupabaseAdmin()
        .from('store_settings')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const { data, error } = await getSupabaseAdmin()
        .from('store_settings')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
