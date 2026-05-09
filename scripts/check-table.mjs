import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://okspitznnvhhxhdvqjxx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI5NTc2MSwiZXhwIjoyMDkzODcxNzYxfQ.Rgnqqvt46X6VA7TzxKr98GTDwVwkedYAt2GBxFkme74';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  // Try to add a test row without description to see what columns exist
  const { data, error } = await supabase.from('products').insert({
    name: 'TEST',
    price: 1.00,
    category: 'TEST',
    image_url: 'https://test.com/test.jpg',
    active: true,
  }).select();
  
  if (error) {
    console.log('Erro ao inserir:', error.message);
  } else {
    console.log('Colunas:', Object.keys(data[0]));
    console.log('Dado inserido:', data[0]);
    
    // Clean up test row
    await supabase.from('products').delete().eq('name', 'TEST');
    console.log('Test row removida.');
  }
}

main().catch(console.error);
