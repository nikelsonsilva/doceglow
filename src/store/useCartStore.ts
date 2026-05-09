import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  images?: string[];
  active: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  total: 0,
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
    
    // Recalculate total
    const newItems = get().items;
    set({ total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0) });
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
    // Recalculate total
    const newItems = get().items;
    set({ total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
    // Recalculate total
    const newItems = get().items;
    set({ total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0) });
  },
  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  clearCart: () => set({ items: [], total: 0 }),
}));
