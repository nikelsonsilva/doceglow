import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const pathname = request.nextUrl.pathname;

  // Match /{slug}/admin patterns
  const adminMatch = pathname.match(/^\/([^/]+)\/admin/);
  const apiAdminMatch = pathname.match(/^\/api\/stores\/([^/]+)\/(products|orders|customers)/);
  
  // Only protect admin pages and write APIs
  if (!adminMatch) return response;

  const slug = adminMatch[1];
  
  // Skip non-admin slugs
  if (['api', 'login', 'cadastro', '_next', 'favicon'].includes(slug)) return response;

  // Auth client (with cookies to read user session)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user owns this store
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: store } = await adminClient
    .from('stores')
    .select('id, owner_id')
    .eq('slug', slug)
    .single();

  if (!store || store.owner_id !== user.id) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/:slug/admin/:path*'],
};
