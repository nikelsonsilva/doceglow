# 📋 Log de Migrations — Doce Glow

Registro de todas as migrations aplicadas no projeto, com detalhes e status.

---

## Migration 1: `20260509135803_init_schema.sql`
- **Status:** ✅ Aplicada em produção
- **Descrição:** Schema inicial do banco de dados
- **Tabelas criadas:**
  - `products` — Produtos (id, name, price, category, image_url, active, created_at)
  - `customers` — Clientes (id, phone, name, endereço completo)
  - `orders` — Pedidos (id, customer_id, total_amount, status, created_at)
  - `order_items` — Itens do pedido (id, order_id, product_id, quantity, price_at_time)
- **Dados seed:** 6 produtos de cosméticos de exemplo

---

## Migration 2: `20260509142000_admin_schema.sql`
- **Status:** ✅ Aplicada em produção
- **Descrição:** Infraestrutura de autenticação e configurações da loja
- **Tabelas criadas:**
  - `profiles` — Perfis de usuário (id → auth.users, email, is_admin)
  - `store_settings` — Configurações da loja (store_name, logo_url, whatsapp, pix_key)
- **Triggers:** `on_auth_user_created` → cria profile automaticamente
- **Storage:** Buckets `products` e `assets` (públicos)
- **Dados seed:** Configurações default "Doce Glow"

---

## Migration 3: `20260512213000_apply_postgres_best_practices.sql`
- **Status:** ✅ Aplicada em produção
- **Descrição:** Hardening de segurança e performance
- **Alterações:**
  - Indexes em FK: `orders.customer_id`, `order_items.order_id`, `order_items.product_id`
  - Fix `SECURITY DEFINER` com `SET search_path = public` na função `handle_new_user`
  - Trigger `set_updated_at()` automático para `store_settings`
  - **RLS habilitado** em todas as tabelas (products, customers, orders, order_items, profiles, store_settings)
  - Função helper `is_admin()` para policies
  - Policies: público pode ver produtos ativos, inserir clientes/pedidos; admin tem acesso total

---

## Migration 4: `20260514183000_product_options.sql`
- **Status:** ✅ Aplicada em 2026-05-14
- **Descrição:** Sistema de produtos montáveis (cardápio para lojas de comida)
- **Novas colunas:**
  - `products.has_options` (BOOLEAN) — Flag para produtos com etapas de montagem
  - `products.description` (TEXT) — Descrição do produto
  - `order_items.selected_options` (JSONB) — Snapshot das opções escolhidas no momento da compra
- **Novas tabelas:**
  - `product_option_groups` — Grupos/etapas de montagem (nome, min_select, max_select, price_mode, sort_order)
    - `price_mode`: `'add'` (soma ao preço base) ou `'replace'` (substitui o preço base, ex: tamanho P/M/G)
  - `product_options` — Opções dentro de cada grupo (nome, extra_price, sort_order, active)
- **Indexes:** `option_groups.product_id`, `options.group_id`, partial index em `products.has_options`
- **RLS:** Habilitado com policies (público lê, admin tem acesso total)
- **Decisões de design:**
  - Sem campo `required` separado — usa `min_select >= 1` como fonte de verdade
  - `selected_options` como JSONB no order_items para congelar o estado no momento da compra (evita quebra se o lojista editar/deletar opções depois)

---

## Notas

> **Tabela `stores`** foi criada manualmente ou via Supabase Dashboard antes das migrations (multitenant). Campos: `id, owner_id, slug, name, category, logo_url, primary_color, whatsapp_number, pix_key, plan, active, created_at, updated_at`.

> **Para aplicar uma migration pendente**, rode o SQL diretamente no Supabase SQL Editor ou via `supabase db push`.
