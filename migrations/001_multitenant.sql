-- =============================================
-- DOCE GLOW → SaaS MULTITENANT MIGRATION
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Criar tabela stores
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cosmeticos',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ec4899',
  whatsapp_number TEXT,
  pix_key TEXT,
  active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS stores_slug_idx ON stores(slug);
CREATE INDEX IF NOT EXISTS stores_owner_idx ON stores(owner_id);

-- 2. Adicionar store_id nas tabelas existentes
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- 3. Migrar a Doce Glow como primeira loja
-- (Pega o primeiro admin como owner)
INSERT INTO stores (owner_id, slug, name, category, whatsapp_number, pix_key, primary_color)
SELECT 
  p.id,
  'doceglow',
  'Doce Glow',
  'cosmeticos',
  COALESCE(ss.whatsapp_number, ''),
  COALESCE(ss.pix_key, ''),
  '#ec4899'
FROM profiles p
LEFT JOIN store_settings ss ON true
WHERE p.is_admin = true
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- 4. Vincular dados existentes à loja doceglow
UPDATE products SET store_id = (SELECT id FROM stores WHERE slug = 'doceglow') WHERE store_id IS NULL;
UPDATE customers SET store_id = (SELECT id FROM stores WHERE slug = 'doceglow') WHERE store_id IS NULL;
UPDATE orders SET store_id = (SELECT id FROM stores WHERE slug = 'doceglow') WHERE store_id IS NULL;

-- 5. Tornar store_id NOT NULL (após migração)
ALTER TABLE products ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN store_id SET NOT NULL;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS products_store_idx ON products(store_id);
CREATE INDEX IF NOT EXISTS customers_store_idx ON customers(store_id);
CREATE INDEX IF NOT EXISTS orders_store_idx ON orders(store_id);

-- 7. Constraint única: mesmo telefone em lojas diferentes é OK
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;
CREATE UNIQUE INDEX IF NOT EXISTS customers_store_phone_idx ON customers(store_id, phone);

-- 8. RLS para stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stores are publicly readable" ON stores;
CREATE POLICY "Stores are publicly readable" ON stores
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Owner can manage their store" ON stores;
CREATE POLICY "Owner can manage their store" ON stores
  FOR ALL USING (owner_id = auth.uid());

-- 9. RLS para products (público para lojas ativas)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products visible for active stores" ON products;
CREATE POLICY "Products visible for active stores" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.active = true)
  );
DROP POLICY IF EXISTS "Owner manages products" ON products;
CREATE POLICY "Owner manages products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- 10. RLS para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders visible to store owner" ON orders;
CREATE POLICY "Orders visible to store owner" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS "Orders insertable publicly" ON orders;
CREATE POLICY "Orders insertable publicly" ON orders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.active = true)
  );
DROP POLICY IF EXISTS "Owner manages orders" ON orders;
CREATE POLICY "Owner manages orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
  );

-- 11. RLS para customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customers visible to store owner" ON customers;
CREATE POLICY "Customers visible to store owner" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS "Customers insertable publicly" ON customers;
CREATE POLICY "Customers insertable publicly" ON customers
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Customers updatable publicly" ON customers;
CREATE POLICY "Customers updatable publicly" ON customers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.active = true)
  );

-- 12. RLS para order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Order items visible to store owner" ON order_items;
CREATE POLICY "Order items visible to store owner" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o 
      JOIN stores s ON s.id = o.store_id 
      WHERE o.id = order_items.order_id AND s.owner_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Order items insertable publicly" ON order_items;
CREATE POLICY "Order items insertable publicly" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id)
  );

-- 13. Adicionar display_name no profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 14. Adicionar controle de estoque
-- NULL = estoque ilimitado, número = estoque controlado
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;

-- 15. Função para decremento atômico de estoque
-- Só decrementa se stock NÃO for NULL (estoque controlado)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - p_quantity, 0)
  WHERE id = p_product_id AND stock IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PRONTO! Verificar:
-- SELECT * FROM stores;
-- SELECT COUNT(*), store_id FROM products GROUP BY store_id;
