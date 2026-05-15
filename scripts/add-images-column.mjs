// Run SQL directly via Supabase Management API
const SUPABASE_URL = 'https://okspitznnvhhxhdvqjxx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI5NTc2MSwiZXhwIjoyMDkzODcxNzYxfQ.Rgnqqvt46X6VA7TzxKr98GTDwVwkedYAt2GBxFkme74';

const sql = `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;`;

// Use the pg_net or direct SQL approach via Supabase's postgrest
// Since exec_sql doesn't exist, let's create a temporary function to run our DDL
const createFnSQL = `
CREATE OR REPLACE FUNCTION public.run_migration()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

// Try via Supabase SQL endpoint (requires dashboard access token, not service role)
// Alternative: use the pg connection directly

// Let's just test if the column already exists first
const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,images&limit=1`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  }
});

const text = await res.text();
console.log('Status:', res.status);
console.log('Response:', text);

if (res.status === 200) {
  console.log('\n✅ Column "images" already exists!');
} else {
  console.log('\n❌ Column "images" does not exist yet.');
  console.log('\nPlease run this SQL in the Supabase SQL Editor:');
  console.log('---');
  console.log(sql);
  console.log('---');
}
