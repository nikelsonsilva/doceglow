import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

// POST /api/stores - Create a new store (onboarding)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner_name, email, password, store_name, category, whatsapp_number } = body;

    if (!owner_name || !email || !password || !store_name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: owner_name },
    });

    if (authError) {
      if (authError.message.includes('already')) {
        return NextResponse.json({ error: 'Este email já está cadastrado. Faça login.' }, { status: 409 });
      }
      throw authError;
    }

    const userId = authData.user.id;

    // 2. Update profile
    await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: owner_name, is_admin: false });

    // 3. Generate unique slug
    let baseSlug = generateSlug(store_name);
    let slug = baseSlug;
    let attempt = 0;

    while (true) {
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // 4. Create store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([{
        owner_id: userId,
        slug,
        name: store_name,
        category,
        whatsapp_number: whatsapp_number || '',
        pix_key: '',
        primary_color: '#ec4899',
        plan: 'free',
      }])
      .select()
      .single();

    if (storeError) throw storeError;

    return NextResponse.json({ 
      store, 
      slug,
      message: 'Loja criada com sucesso!' 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
