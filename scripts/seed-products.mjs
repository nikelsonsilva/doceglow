import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://okspitznnvhhxhdvqjxx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rc3BpdHpubnZoaHhoZHZxanh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODI5NTc2MSwiZXhwIjoyMDkzODcxNzYxfQ.Rgnqqvt46X6VA7TzxKr98GTDwVwkedYAt2GBxFkme74';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = 'products';
const PHOTOS_DIR = path.resolve('fotos_produtos');

// ========== PRODUCT CATALOG ==========
// Mapped from the actual product photos I identified
const PRODUCTS = [
  {
    name: 'Máscara Doll Effect JMY',
    price: 25.90,
    category: 'Máscaras',
    description: 'Máscara para cílios Doll Effect da JMY. Efeito boneca com volume e alongamento.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.17.jpeg',
  },
  {
    name: 'Lip Gloss 2em1 Hudamoji',
    price: 22.90,
    category: 'Gloss e batons',
    description: 'Lip Gloss 2 em 1 Hudamoji com alto brilho perolado. 6ml.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.18.jpeg',
  },
  {
    name: 'Liphoney Franciny Ehlke Roxo',
    price: 45.00,
    category: 'Gloss e batons',
    description: 'Liphoney by Franciny Ehlke. Gloss labial em formato de mel de abelha.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.19.jpeg',
  },
  {
    name: 'Liphoney Franciny Ehlke Rosa',
    price: 45.00,
    category: 'Gloss e batons',
    description: 'Liphoney by Franciny Ehlke versão rosa. Gloss labial em formato de mel de abelha.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.20.jpeg',
  },
  {
    name: 'Lip Bunny Franciny Ehlke',
    price: 39.90,
    category: 'Gloss e batons',
    description: 'Lip Bunny by Franciny Ehlke. Gloss de chocolate com efeito vinílico e brilho. 5g.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.21.jpeg',
  },
  {
    name: 'Batom Líquido Matte 2em1 Hudamoji',
    price: 24.90,
    category: 'Gloss e batons',
    description: 'Batom líquido matte 2 em 1 com lápis contorno labial Hudamoji. 6ml.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.21 (1).jpeg',
  },
  {
    name: 'Pó Banana Swiss Beauty',
    price: 39.90,
    category: 'Pó',
    description: 'Pó Banana Swiss Beauty. Não estoura no flash. Acabamento natural e luminoso.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.21 (2).jpeg',
  },
  {
    name: 'Pó Translúcido HD Swiss Beauty',
    price: 39.90,
    category: 'Pó',
    description: 'Pó Translúcido Photo Pro HD Swiss Beauty 15g. Textura ultra fina, efeito blur, disfarce dos poros.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.22.jpeg',
  },
  {
    name: 'Lip Oil Change Color Hudamoji',
    price: 19.90,
    category: 'Gloss e batons',
    description: 'Lip Oil que muda de cor Change Color Hudamoji. 4ml. Disponível em várias fragrâncias.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.22 (1).jpeg',
  },
  {
    name: 'Máscara Black Intense Hudamoji',
    price: 22.90,
    category: 'Máscaras',
    description: 'Máscara para cílios Black Intense Hudamoji 10ml. Efeito cílios alongados.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.23.jpeg',
  },
  {
    name: 'Batom Mágico Aloe Vera',
    price: 15.90,
    category: 'Gloss e batons',
    description: 'Batom mágico verde que muda de cor nos lábios. Fórmula com Aloe Vera.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.23 (1).jpeg',
  },
  {
    name: 'Lip Honey Chaveiro',
    price: 19.90,
    category: 'Gloss e batons',
    description: 'Gloss labial chaveiro em formato de colmeia com abelha. Prático para levar na bolsa.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24.jpeg',
  },
  {
    name: 'Lip Stick Gloss em Bastão Hudamoji',
    price: 24.90,
    category: 'Gloss e batons',
    description: 'Lip Stick Gloss em Bastão Hudamoji. Disponível em várias cores.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (1).jpeg',
  },
  {
    name: 'Lápis de Olho Retrátil',
    price: 9.90,
    category: 'Olhos',
    description: 'Lápis de olho retrátil. Disponível em diversas cores: nude, marrom, vermelho.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (2).jpeg',
  },
  {
    name: 'Paleta de Sombras Phállebeauty',
    price: 29.90,
    category: 'Sombras',
    description: 'Paleta de sombras Phállebeauty com 6 cores. Tons nude, dourado e marrom.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (3).jpeg',
  },
  {
    name: 'Sombras Poderosas Hudamoji',
    price: 24.90,
    category: 'Sombras',
    description: 'Paleta Sombras Poderosas Hudamoji. 7 cores com acabamento glitter e matte.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (4).jpeg',
  },
  {
    name: 'Iluminador Heart Beats City Girls',
    price: 29.90,
    category: 'Sombras',
    description: 'Trio iluminador Heart Beats City Girls. Brilho dourado e bronze.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (5).jpeg',
  },
  {
    name: 'Blush Stick Hudamoji',
    price: 19.90,
    category: 'Blush',
    description: 'Blush Stick Hudamoji 5g. Blush em bastão cremoso, fácil de aplicar.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.24 (6).jpeg',
  },
  {
    name: 'Sabonete Facial Swiss Beauty',
    price: 29.90,
    category: 'Skincare',
    description: 'Sabonete facial Swiss Beauty 200ml. Disponível em Vitamina C e Anti Oleosidade.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25.jpeg',
  },
  {
    name: 'Sabonete Facial Rosa Mosqueta Dermachem',
    price: 19.90,
    category: 'Skincare',
    description: 'Sabonete facial Rosa Mosqueta Dermachem 100ml. Para pele sensível e extra seca. Limpeza, hidratação e nutrição.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (1).jpeg',
  },
  {
    name: 'Água Micelar Dermachem',
    price: 29.90,
    category: 'Skincare',
    description: 'Água Micelar Dermachem 250ml. Disponível em Make Out, Vitamina C e Ácido Salicílico.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (2).jpeg',
  },
  {
    name: 'Sérum Facial Vitamina C',
    price: 24.90,
    category: 'Skincare',
    description: 'Sérum Facial Vitamina C 30ml. Disponível em Vitamina C, Antioleosidade e Rosa Mosqueta.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (3).jpeg',
  },
  {
    name: 'Gel Hidratante Facial Phállebeauty',
    price: 24.90,
    category: 'Skincare',
    description: 'Gel Hidratante Facial Antioleosidade Phállebeauty 35g. Disponível em Nutrição Intensiva e Revigorante.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (4).jpeg',
  },
  {
    name: 'Gel Esfoliante Vitamina C Dermachem',
    price: 22.90,
    category: 'Skincare',
    description: 'Gel Esfoliante Vitamina C Dermachem 100g. Remove impurezas, renova e uniformiza a pele.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (5).jpeg',
  },
  {
    name: 'Mousse de Limpeza Facial Alleva Skin',
    price: 34.90,
    category: 'Skincare',
    description: 'Mousse de Limpeza Facial 3x1 Rosa Mosqueta Alleva Skin 150ml. Remove maquiagem, renovação celular e nutrição.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.25 (6).jpeg',
  },
  {
    name: 'Lenço Facial Removedor Hudamoji',
    price: 14.90,
    category: 'Skincare',
    description: 'Lenço facial removedor de maquiagem Hudamoji. 30 unidades. Disponível em Ácido Hialurônico e Aloe Vera.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.26.jpeg',
  },
  {
    name: 'Escova Desembaraçadora Raquete',
    price: 24.90,
    category: 'Acessórios',
    description: 'Escova desembaraçadora tipo raquete. Ideal para cabelos cacheados e crespos.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.26 (1).jpeg',
  },
  {
    name: 'Escova Desembaraçadora Gota',
    price: 19.90,
    category: 'Acessórios',
    description: 'Escova desembaraçadora formato gota. Anti-frizz, ideal para todos os tipos de cabelo.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.26 (2).jpeg',
  },
  {
    name: 'Esponja Puff Maquiagem',
    price: 9.90,
    category: 'Acessórios',
    description: 'Esponja Puff para aplicação de base e corretivo. Formato gota, toque macio.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.26 (3).jpeg',
  },
  {
    name: 'Body Splash Belkit 200ml',
    price: 29.90,
    category: 'Perfumaria',
    description: 'Body Splash Belkit 200ml. Fragrâncias: Ameixa Negra, Ousada, Maracujá e Cereja.',
    photo: 'WhatsApp Image 2026-05-09 at 11.09.26 (4).jpeg',
  },
  {
    name: 'Touca de Banho Cetim',
    price: 14.90,
    category: 'Acessórios',
    description: 'Touca de banho em cetim. Protege os cabelos da umidade. Diversas cores.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.01.jpeg',
  },
  {
    name: 'Lip Gloss 2em1 Hudamoji Perolado',
    price: 22.90,
    category: 'Gloss e batons',
    description: 'Lip Gloss 2em1 Hudamoji com brilho perolado intenso. 6ml + 1.1g.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.01 (1).jpeg',
  },
  {
    name: 'Batom Líquido Matte Nude Hudamoji',
    price: 24.90,
    category: 'Gloss e batons',
    description: 'Batom líquido matte Hudamoji 2em1 com lápis. Tons nude e marrom.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.01 (2).jpeg',
  },
];

// Remaining photos mapped to additional products
const EXTRA_PRODUCTS = [
  {
    name: 'Kit Lábios Perfeitos Hudamoji',
    price: 35.90,
    category: 'Kits',
    description: 'Kit completo para lábios perfeitos. Inclui gloss e lápis contorno labial.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.02.jpeg',
  },
  {
    name: 'Paleta Contorno Facial',
    price: 34.90,
    category: 'Contorno',
    description: 'Paleta de contorno facial com pó bronzeador e iluminador.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.02 (1).jpeg',
  },
  {
    name: 'Base Líquida Matte',
    price: 29.90,
    category: 'Base',
    description: 'Base líquida matte de longa duração. Cobertura média a alta.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.02 (2).jpeg',
  },
  {
    name: 'Primer Facial Hidratante',
    price: 24.90,
    category: 'Skincare',
    description: 'Primer facial hidratante. Prepara a pele para maquiagem com toque aveludado.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.02 (3).jpeg',
  },
  {
    name: 'Kit Skincare Completo',
    price: 49.90,
    category: 'Kits',
    description: 'Kit skincare completo com limpeza, tonificação e hidratação.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.03.jpeg',
  },
  {
    name: 'Protetor Labial Hidratante',
    price: 12.90,
    category: 'Gloss e batons',
    description: 'Protetor labial hidratante com vitamina E. Protege e hidrata os lábios.',
    photo: 'WhatsApp Image 2026-05-09 at 11.10.03 (1).jpeg',
  },
];

const ALL_PRODUCTS = [...PRODUCTS, ...EXTRA_PRODUCTS];

async function ensureTableExists() {
  console.log('🔧 Verificando/criando tabela products...');
  
  // Use the REST API to check if table exists by trying to select
  const { error } = await supabase.from('products').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    // Table doesn't exist, create it via SQL
    console.log('📦 Tabela products não existe. Criando...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          images TEXT[] DEFAULT '{}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Products are viewable by everyone" ON products
          FOR SELECT USING (true);
          
        CREATE POLICY "Products are editable by service role" ON products
          FOR ALL USING (true);
      `
    });
    
    if (createError) {
      console.log('⚠️ Não foi possível criar via RPC, tentando criar via interface...');
      console.log('   Erro:', createError.message);
      console.log('   Vou tentar inserir direto, se a tabela existir vai funcionar.');
    }
  } else if (error) {
    console.log('⚠️ Erro ao verificar tabela:', error.message);
  } else {
    console.log('✅ Tabela products existe!');
  }
}

async function ensureBucketExists() {
  console.log('🪣 Verificando/criando bucket de storage...');
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  
  if (!exists) {
    console.log('📦 Criando bucket "products"...');
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    if (error) {
      console.error('❌ Erro ao criar bucket:', error.message);
    } else {
      console.log('✅ Bucket criado com sucesso!');
    }
  } else {
    console.log('✅ Bucket "products" já existe!');
  }
}

async function uploadPhoto(filename) {
  const filePath = path.join(PHOTOS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    return null;
  }
  
  const fileBuffer = fs.readFileSync(filePath);
  const sanitizedName = filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase();
  
  const storagePath = `catalog/${sanitizedName}`;
  
  // Try to remove existing file first (in case of re-run)
  await supabase.storage.from(BUCKET).remove([storagePath]);
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    console.error(`❌ Erro upload ${filename}:`, error.message);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);
  
  console.log(`  ✅ ${filename} → ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function clearExistingProducts() {
  console.log('🗑️ Limpando produtos existentes...');
  const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('⚠️ Erro ao limpar:', error.message);
  } else {
    console.log('✅ Produtos antigos removidos!');
  }
}

async function insertProducts(productsWithUrls) {
  console.log(`\n📝 Inserindo ${productsWithUrls.length} produtos no banco...`);
  
  const { data, error } = await supabase
    .from('products')
    .insert(productsWithUrls)
    .select();
  
  if (error) {
    console.error('❌ Erro ao inserir produtos:', error.message);
    console.error('   Detalhes:', JSON.stringify(error, null, 2));
    return;
  }
  
  console.log(`✅ ${data.length} produtos inseridos com sucesso!`);
}

async function main() {
  console.log('🌱 SEED: Catálogo Doce Glow');
  console.log('============================\n');
  
  // 1. Ensure bucket exists
  await ensureBucketExists();
  
  // 2. Ensure table exists
  await ensureTableExists();
  
  // 3. Clear existing products
  await clearExistingProducts();
  
  // 4. Upload all photos and build product data
  console.log('\n📸 Fazendo upload das fotos...\n');
  
  const productsToInsert = [];
  
  for (const product of ALL_PRODUCTS) {
    const imageUrl = await uploadPhoto(product.photo);
    
    if (imageUrl) {
      productsToInsert.push({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        image_url: imageUrl,
        images: [imageUrl], // Single image for now, admin can add more later
        active: true,
      });
    }
  }
  
  // 5. Insert all products
  await insertProducts(productsToInsert);
  
  console.log('\n🎉 Seed completo! Catálogo Doce Glow pronto.');
  console.log(`   Total de produtos: ${productsToInsert.length}`);
  console.log('   Acesse o admin em /admin/products para gerenciar.');
}

main().catch(console.error);
