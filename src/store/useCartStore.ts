import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  images?: string[];
  active: boolean;
  stock?: number | null;
  has_options?: boolean;
  option_groups?: OptionGroupData[];
}

export interface OptionGroupData {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  price_mode: 'add' | 'replace';
  sort_order: number;
  product_options: { id: string; name: string; extra_price: number; sort_order: number }[];
}

export interface SelectedOption {
  groupName: string;
  priceMode: 'add' | 'replace';
  options: string[];
  extra: number; // total extra for this group
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string; // unique ID per cart entry (same product with diff options = diff entry)
  selectedOptions?: SelectedOption[];
  unitPrice: number; // final unit price after options
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, selectedOptions?: SelectedOption[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  total: number;
}

function calcUnitPrice(product: Product, selectedOptions?: SelectedOption[]): number {
  if (!selectedOptions?.length) return product.price;
  
  let basePrice = product.price;
  let addTotal = 0;

  for (const sel of selectedOptions) {
    if (sel.priceMode === 'replace' && sel.extra > 0) {
      basePrice = sel.extra; // Replace base price
    } else {
      addTotal += sel.extra;
    }
  }

  return basePrice + addTotal;
}

function generateCartItemId(productId: string, selectedOptions?: SelectedOption[]): string {
  if (!selectedOptions?.length) return productId;
  const optKey = selectedOptions.map(s => `${s.groupName}:${s.options.sort().join(',')}`).join('|');
  return `${productId}__${optKey}`;
}

function recalcTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  total: 0,

  addItem: (product, selectedOptions) => {
    const cartItemId = generateCartItemId(product.id, selectedOptions);
    const unitPrice = calcUnitPrice(product, selectedOptions);
    const items = get().items;
    const existing = items.find(item => item.cartItemId === cartItemId);

    if (existing) {
      const updated = items.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      set({ items: updated, total: recalcTotal(updated) });
    } else {
      const updated = [...items, { ...product, quantity: 1, cartItemId, selectedOptions, unitPrice }];
      set({ items: updated, total: recalcTotal(updated) });
    }
  },

  removeItem: (cartItemId) => {
    const updated = get().items.filter(item => item.cartItemId !== cartItemId);
    set({ items: updated, total: recalcTotal(updated) });
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    const updated = get().items.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    );
    set({ items: updated, total: recalcTotal(updated) });
  },

  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  clearCart: () => set({ items: [], total: 0 }),
}));
