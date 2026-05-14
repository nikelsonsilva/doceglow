import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// POST /api/auth/login - Login and return session + store slug
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Sign in with email/password
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Get user's store
    const { data: store } = await getSupabaseAdmin()
      .from('stores')
      .select('slug, name')
      .eq('owner_id', authData.user.id)
      .single();

    // Build response with session cookies in the format @supabase/ssr expects
    const res = NextResponse.json({
      session: authData.session,
      user: authData.user,
      store: store || null,
    });

    // Set cookies that @supabase/ssr createServerClient can read
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const cookieOptions = {
      path: '/',
      maxAge,
      httpOnly: false,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    };

    // The supabase SSR client expects cookies with the project ref prefix
    // Format: sb-<ref>-auth-token (chunked for large tokens)
    const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').match(/\/\/([^.]+)/)?.[1] || 'app';
    const sessionData = JSON.stringify(authData.session);
    
    // Supabase SSR stores session as chunked cookies: sb-<ref>-auth-token.0, .1, etc.
    const chunkSize = 3500; // Cookie size limit safety
    const chunks = [];
    for (let i = 0; i < sessionData.length; i += chunkSize) {
      chunks.push(sessionData.slice(i, i + chunkSize));
    }

    if (chunks.length === 1) {
      res.cookies.set(`sb-${ref}-auth-token`, chunks[0], cookieOptions);
    } else {
      chunks.forEach((chunk, i) => {
        res.cookies.set(`sb-${ref}-auth-token.${i}`, chunk, cookieOptions);
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
