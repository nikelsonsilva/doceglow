import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Slugs que conflitam com rotas estáticas do Next.js
const RESERVED_SLUGS = new Set([
  'login', 'cadastro', 'admin', 'api', 'sobre', 'precos',
  'termos', 'privacidade', 'contato', 'suporte', 'ajuda',
  'dashboard', 'painel', 'configuracoes', 'planos', 'checkout',
  '_next', 'favicon', 'robots', 'sitemap', 'manifest',
]);

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

function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(color);
}

// GET /api/stores?slug=xxx - Check slug availability
export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const normalized = generateSlug(slug);
  if (!normalized || normalized.length < 3) {
    return NextResponse.json({ available: false, reason: 'Slug deve ter pelo menos 3 caracteres.' });
  }
  if (RESERVED_SLUGS.has(normalized)) {
    return NextResponse.json({ available: false, reason: 'Este nome é reservado. Escolha outro.' });
  }

  const { data: existing } = await getSupabaseAdmin()
    .from('stores')
    .select('id')
    .eq('slug', normalized)
    .single();

  return NextResponse.json({
    available: !existing,
    slug: normalized,
    reason: existing ? 'Este slug já está em uso.' : null,
  });
}

// POST /api/stores - Create a new store (onboarding)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner_name, email, password, store_name, category, whatsapp_number } = body;

    if (!owner_name || !email || !password || !store_name || !category) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha precisa ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Generate + validate slug
    let baseSlug = generateSlug(store_name);
    if (!baseSlug || baseSlug.length < 3) {
      return NextResponse.json({ error: 'O nome da loja precisa gerar um slug válido (mín. 3 caracteres).' }, { status: 400 });
    }

    if (RESERVED_SLUGS.has(baseSlug)) {
      return NextResponse.json({ error: `O nome "${store_name}" é reservado. Escolha outro nome para sua loja.` }, { status: 400 });
    }

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
      if (attempt > 20) {
        return NextResponse.json({ error: 'Não foi possível gerar um slug único. Tente outro nome.' }, { status: 409 });
      }
    }

    // 2. Create auth user
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

    // 3. Update profile
    await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: owner_name, is_admin: false });

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
