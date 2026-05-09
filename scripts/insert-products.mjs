import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://okspitznnvhhxhdvqjxx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI5NTc2MSwiZXhwIjoyMDkzODcxNzYxfQ.Rgnqqvt46X6VA7TzxKr98GTDwVwkedYAt2GBxFkme74';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// First, create an RPC function that can execute ALTER TABLE
async function createHelperFunction() {
  // Try using the pg_net extension or direct REST approach
  // Since we can't run DDL via PostgREST, let's create an RPC
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/alter_products_table`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({}),
  });
  
  const status = response.status;
  const text = await response.text();
  console.log(`RPC status: ${status}`);
  console.log(`RPC response: ${text}`);
}

// Alternative: try inserting with just the known columns (without description/images)
async function insertWithoutDescription() {
  console.log('📝 Inserindo produtos SEM a coluna description (ela não existe na tabela)...');
  
  const PRODUCTS = [
    { name: 'Máscara Doll Effect JMY', price: 25.90, category: 'Máscaras', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.17.jpeg', active: true },
    { name: 'Lip Gloss 2em1 Hudamoji', price: 22.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.18.jpeg', active: true },
    { name: 'Liphoney Franciny Ehlke Roxo', price: 45.00, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.19.jpeg', active: true },
    { name: 'Liphoney Franciny Ehlke Rosa', price: 45.00, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.20.jpeg', active: true },
    { name: 'Lip Bunny Franciny Ehlke', price: 39.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.21.jpeg', active: true },
    { name: 'Batom Líquido Matte 2em1 Hudamoji', price: 24.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.21_1_.jpeg', active: true },
    { name: 'Pó Banana Swiss Beauty', price: 39.90, category: 'Pó', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.21_2_.jpeg', active: true },
    { name: 'Pó Translúcido HD Swiss Beauty', price: 39.90, category: 'Pó', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.22.jpeg', active: true },
    { name: 'Lip Oil Change Color Hudamoji', price: 19.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.22_1_.jpeg', active: true },
    { name: 'Máscara Black Intense Hudamoji', price: 22.90, category: 'Máscaras', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.23.jpeg', active: true },
    { name: 'Batom Mágico Aloe Vera', price: 15.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.23_1_.jpeg', active: true },
    { name: 'Lip Honey Chaveiro', price: 19.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24.jpeg', active: true },
    { name: 'Lip Stick Gloss Bastão Hudamoji', price: 24.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_1_.jpeg', active: true },
    { name: 'Lápis de Olho Retrátil', price: 9.90, category: 'Olhos', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_2_.jpeg', active: true },
    { name: 'Paleta de Sombras Phállebeauty', price: 29.90, category: 'Sombras', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_3_.jpeg', active: true },
    { name: 'Sombras Poderosas Hudamoji', price: 24.90, category: 'Sombras', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_4_.jpeg', active: true },
    { name: 'Iluminador Heart Beats City Girls', price: 29.90, category: 'Sombras', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_5_.jpeg', active: true },
    { name: 'Blush Stick Hudamoji', price: 19.90, category: 'Blush', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.24_6_.jpeg', active: true },
    { name: 'Sabonete Facial Swiss Beauty', price: 29.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25.jpeg', active: true },
    { name: 'Sabonete Facial Rosa Mosqueta Dermachem', price: 19.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_1_.jpeg', active: true },
    { name: 'Água Micelar Dermachem', price: 29.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_2_.jpeg', active: true },
    { name: 'Sérum Facial Vitamina C', price: 24.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_3_.jpeg', active: true },
    { name: 'Gel Hidratante Facial Phállebeauty', price: 24.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_4_.jpeg', active: true },
    { name: 'Gel Esfoliante Vitamina C Dermachem', price: 22.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_5_.jpeg', active: true },
    { name: 'Mousse de Limpeza Facial Alleva Skin', price: 34.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.25_6_.jpeg', active: true },
    { name: 'Lenço Facial Removedor Hudamoji', price: 14.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.26.jpeg', active: true },
    { name: 'Escova Desembaraçadora Raquete', price: 24.90, category: 'Acessórios', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.26_1_.jpeg', active: true },
    { name: 'Escova Desembaraçadora Gota', price: 19.90, category: 'Acessórios', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.26_2_.jpeg', active: true },
    { name: 'Esponja Puff Maquiagem', price: 9.90, category: 'Acessórios', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.26_3_.jpeg', active: true },
    { name: 'Body Splash Belkit 200ml', price: 29.90, category: 'Perfumaria', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.09.26_4_.jpeg', active: true },
    { name: 'Touca de Banho Cetim', price: 14.90, category: 'Acessórios', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.01.jpeg', active: true },
    { name: 'Lip Gloss 2em1 Hudamoji Perolado', price: 22.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.01_1_.jpeg', active: true },
    { name: 'Batom Líquido Matte Nude Hudamoji', price: 24.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.01_2_.jpeg', active: true },
    { name: 'Kit Lábios Perfeitos Hudamoji', price: 35.90, category: 'Kits', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.02.jpeg', active: true },
    { name: 'Paleta Contorno Facial', price: 34.90, category: 'Contorno', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.02_1_.jpeg', active: true },
    { name: 'Base Líquida Matte', price: 29.90, category: 'Base', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.02_2_.jpeg', active: true },
    { name: 'Primer Facial Hidratante', price: 24.90, category: 'Skincare', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.02_3_.jpeg', active: true },
    { name: 'Kit Skincare Completo', price: 49.90, category: 'Kits', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.03.jpeg', active: true },
    { name: 'Protetor Labial Hidratante', price: 12.90, category: 'Gloss e batons', image_url: 'https://okspitznnvhhxhdvqjxx.supabase.co/storage/v1/object/public/products/catalog/whatsapp_image_2026-05-09_at_11.10.03_1_.jpeg', active: true },
  ];

  // Clear first
  console.log('🗑️ Limpando produtos existentes...');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Insert in batches of 10
  let inserted = 0;
  for (let i = 0; i < PRODUCTS.length; i += 10) {
    const batch = PRODUCTS.slice(i, i + 10);
    const { data, error } = await supabase.from('products').insert(batch).select();
    
    if (error) {
      console.error(`❌ Erro no batch ${i}:`, error.message);
    } else {
      inserted += data.length;
      console.log(`  ✅ Batch ${Math.floor(i/10) + 1}: ${data.length} produtos inseridos`);
    }
  }
  
  console.log(`\n🎉 Total inserido: ${inserted} produtos!`);
  
  // Verify
  const { data: count } = await supabase.from('products').select('id', { count: 'exact' });
  console.log(`📊 Total no banco: ${count?.length} produtos`);
}

insertWithoutDescription().catch(console.error);
