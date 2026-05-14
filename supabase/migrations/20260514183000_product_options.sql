-- ==============================================================================
-- PRODUCT OPTIONS SYSTEM (Produtos Montáveis)
-- Para lojas de comida que precisam de etapas de montagem
-- Ex: Massa → Molho → Mistura → Acompanhamentos
-- ==============================================================================

-- 1. Flag no produto indicando se tem opções de montagem
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS has_options BOOLEAN DEFAULT false;

-- 2. Descrição do produto (se ainda não existir)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Snapshot das opções escolhidas no pedido (congela nome + preço no momento da compra)
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_options JSONB DEFAULT NULL;
-- Formato: [{ "group": "Escolha a massa", "options": ["Espaguete"], "extra": 0 }, ...]

-- 4. Grupos de opções (cada passo da montagem)
CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,            -- Ex: "Escolha a massa", "Escolha o molho"
  min_select INTEGER DEFAULT 0,  -- 0 = opcional, >= 1 = obrigatório (sem campo required separado)
  max_select INTEGER DEFAULT 1,  -- 1 = radio, N = checkbox
  price_mode TEXT DEFAULT 'add' CHECK (price_mode IN ('add', 'replace')),
    -- 'add' = extra_price soma ao preço base do produto
    -- 'replace' = extra_price SUBSTITUI o preço base (ex: tamanho P/M/G)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Opções dentro de cada grupo
CREATE TABLE IF NOT EXISTS public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  extra_price NUMERIC(10, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes para performance
CREATE INDEX IF NOT EXISTS idx_option_groups_product_id ON public.product_option_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_options_group_id ON public.product_options(group_id);
CREATE INDEX IF NOT EXISTS idx_products_has_options ON public.products(has_options) WHERE has_options = true;

-- 7. RLS
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view option groups" ON public.product_option_groups 
  FOR SELECT USING (true);
CREATE POLICY "Admins have full access to option groups" ON public.product_option_groups 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view options" ON public.product_options 
  FOR SELECT USING (true);
CREATE POLICY "Admins have full access to options" ON public.product_options 
  FOR ALL USING (public.is_admin());
