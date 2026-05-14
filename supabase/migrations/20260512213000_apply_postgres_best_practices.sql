-- ==============================================================================
-- 1. FOREIGN KEY INDEXES
-- Supabase Best Practice: Always index foreign keys to prevent sequential scans
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);


-- ==============================================================================
-- 2. SECURITY DEFINER FIX
-- Supabase Best Practice: Always set search_path on security definer functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ==============================================================================
-- 3. AUTOMATED UPDATED_AT TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trigger_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status safely without causing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT is_admin FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Admins have full access to products" ON public.products FOR ALL USING (public.is_admin());

-- Customers Policies (Public can insert for checkout)
CREATE POLICY "Public can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to customers" ON public.customers FOR ALL USING (public.is_admin());

-- Orders Policies (Public can insert for checkout)
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items Policies (Public can insert for checkout)
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins have full access to order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Store Settings Policies
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins have full access to store settings" ON public.store_settings FOR ALL USING (public.is_admin());
