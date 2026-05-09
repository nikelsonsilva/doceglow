import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side only client with service_role key - bypasses RLS
// Lazy-initialized to avoid build-time errors when env vars aren't available
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Backward-compatible export (getter)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
