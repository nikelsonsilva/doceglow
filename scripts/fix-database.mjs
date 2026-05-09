import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://okspitznnvhhxhdvqjxx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI5NTc2MSwiZXhwIjoyMDkzODcxNzYxfQ.Rgnqqvt46X6VA7TzxKr98GTDwVwkedYAt2GBxFkme74';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTU3NjEsImV4cCI6MjA5Mzg3MTc2MX0.l3eoO2xU5vc2lnw1x7jfGR0DGEjz2Vf-Y3sKtPa3YFs';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fixAll() {
  console.log('🔧 Corrigindo banco de dados via SQL direto...\n');

  // Step 1: Create a temporary function to run DDL
  const createFn = `
    CREATE OR REPLACE FUNCTION fix_products_table()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Add missing columns
      BEGIN
        ALTER TABLE products ADD COLUMN description TEXT;
      EXCEPTION WHEN duplicate_column THEN
        NULL;
      END;
      
      BEGIN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
      EXCEPTION WHEN duplicate_column THEN
        NULL;
      END;
      
      -- Fix RLS policies
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Allow public read" ON products;
      DROP POLICY IF EXISTS "Allow authenticated all" ON products;
      DROP POLICY IF EXISTS "Allow service role all" ON products;
      DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
      DROP POLICY IF EXISTS "Products are editable by service role" ON products;
      DROP POLICY IF EXISTS "Enable read access for all users" ON products;
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
      DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
      DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
      
      -- Create new policies
      CREATE POLICY "Allow public read" ON products
        FOR SELECT USING (true);
      
      CREATE POLICY "Allow authenticated write" ON products
        FOR INSERT TO authenticated WITH CHECK (true);
      
      CREATE POLICY "Allow authenticated update" ON products
        FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
      
      CREATE POLICY "Allow authenticated delete" ON products
        FOR DELETE TO authenticated USING (true);
        
    END;
    $$;
  `;

  // Use the pg REST endpoint to create the function
  // Actually, let's use the raw SQL via the postgrest endpoint that allows functions
  
  // Try: Create function via direct SQL call
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fix_products_table`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: '{}',
  });
  
  if (res.status === 404) {
    console.log('ℹ️ Função não existe ainda. Vou criar usando query SQL...');
    
    // Use the Supabase REST API's sql endpoint
    // Actually the correct endpoint is via pg
    // Let's try the /pg endpoint
    const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: createFn }),
    });
    
    console.log('PG endpoint status:', pgRes.status);
    
    if (pgRes.status !== 200) {
      console.log('PG endpoint body:', await pgRes.text());
      
      // Try alternative: use the graphql endpoint
      console.log('\nTentando via SQL query endpoint...');
      
      const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',  
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: createFn }),
      });
      
      console.log('SQL endpoint status:', sqlRes.status);
    }
  } else {
    console.log('✅ Função executada! Status:', res.status);
    const body = await res.text();
    console.log('Response:', body);
  }

  // Alternative approach: Disable RLS entirely on products table
  // This is simpler and since products are public data, it's safe
  console.log('\n🔄 Tentando abordagem alternativa: desabilitar RLS...');
  
  // We can't disable RLS via PostgREST either
  // Let's try: use the Supabase Management API
  const projectRef = 'okspitznnvhhxhdvqjxx';
  
  // Check if there's a management API access token
  // The Management API requires a different auth token (personal access token)
  // Since we don't have that, let's use a workaround:
  
  // Create a server-side admin client that uses the service key
  // The service key bypasses RLS - so let's create an admin API route
  console.log('\n💡 Solução: criar API route no Next.js que usa service_role key!');
  console.log('   Isso permite que o admin faça CRUD sem problemas de RLS.');
  
  // Verify service key works
  const { data, error } = await supabase.from('products').select('id, name').limit(5);
  console.log(`\n📊 Service key acesso: ${data?.length} produtos encontrados`);
  if (data) data.forEach(p => console.log(`   • ${p.name}`));
}

fixAll().catch(console.error);
