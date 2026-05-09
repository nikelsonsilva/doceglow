-- 1. Create Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  cep TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  complement TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert dummy products
INSERT INTO products (name, price, category, image_url, active) VALUES
('Pó Banana Swiss Beauty', 39.90, 'Pó', 'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80', true),
('Lip Bunny Franciny Ehlke', 45.00, 'Gloss e batons', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80', true),
('Máscara de Cílios Volume', 55.90, 'Máscaras', 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80', true),
('Sabonete Facial Glow', 29.90, 'Sabonete facial', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80', true),
('Batom Matte Pêssego', 35.00, 'Gloss e batons', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80', true),
('Pó Translúcido HD', 49.90, 'Pó', 'https://images.unsplash.com/photo-1590156546946-cb554ea807fa?w=400&q=80', true);
