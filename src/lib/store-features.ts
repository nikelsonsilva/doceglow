/**
 * Verifica se a loja suporta produtos com opções de montagem.
 * Centraliza a lógica para evitar "comida" como string mágica espalhada.
 * Quando amanhã quiserem habilitar pra outro ramo, muda aqui só.
 */

const OPTION_ENABLED_CATEGORIES = new Set(['comida']);

export function storeHasOptionSupport(category: string | undefined | null): boolean {
  if (!category) return false;
  return OPTION_ENABLED_CATEGORIES.has(category.toLowerCase());
}

/**
 * Categorias de produto sugeridas por ramo da loja.
 */
const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  comida: [
    'Pratos', 'Massas', 'Lanches', 'Porções', 'Sobremesas',
    'Bebidas', 'Combos', 'Pizzas', 'Salgados', 'Doces',
  ],
  cosmeticos: [
    'Gloss e batons', 'Máscaras', 'Sombras', 'Pó', 'Blush', 'Base',
    'Contorno', 'Olhos', 'Skincare', 'Perfumaria', 'Acessórios', 'Kits',
  ],
  roupas: [
    'Camisetas', 'Vestidos', 'Calças', 'Shorts', 'Saias',
    'Jaquetas', 'Acessórios', 'Conjuntos', 'Íntimos',
  ],
  acessorios: [
    'Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Bolsas',
    'Óculos', 'Relógios', 'Cintos',
  ],
  perfumaria: [
    'Perfumes', 'Body Splash', 'Hidratantes', 'Sabonetes',
    'Desodorantes', 'Kits',
  ],
  artesanato: [
    'Crochê', 'Tricô', 'Bijuterias', 'Decoração', 'Velas',
    'Sabonetes artesanais', 'Cerâmica',
  ],
  eletronicos: [
    'Celulares', 'Acessórios', 'Fones', 'Carregadores',
    'Capas', 'Gadgets',
  ],
  casa: [
    'Decoração', 'Cozinha', 'Banheiro', 'Organização',
    'Iluminação', 'Têxteis',
  ],
};

const DEFAULT_CATEGORIES = [
  'Categoria 1', 'Categoria 2', 'Categoria 3',
];

export function getCategorySuggestions(storeCategory: string | undefined | null): string[] {
  if (!storeCategory) return DEFAULT_CATEGORIES;
  return CATEGORY_SUGGESTIONS[storeCategory.toLowerCase()] || DEFAULT_CATEGORIES;
}
