import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'customer';
  createdAt: any;
}

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  deliveryType?: 'free'| 'paid';
  deliveryChargeInsideDhaka?: number;
  deliveryChargeOutsideDhaka?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, selectedSize?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
}

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  quickViewProduct: any | null;
  toast: { message: string, type: 'success' | 'error' | 'info' } | null;
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setQuickViewProduct: (product: any | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface AppSettings {
  storeName: string;
  logo: string;
  currency: 'BDT' | 'USD' | 'EUR';
  timezone: string;
}

interface SettingsState {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

interface Collection {
  id?: string;
  name: string;
  image?: string;
  createdAt?: any;
}

interface CollectionsState {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
}

interface Category {
  id?: string;
  name: string;
  createdAt?: any;
}

interface CategoriesState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    storeName: 'Raici Mart',
    logo: '',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
  },
  setSettings: (settings) => set({ settings }),
}));

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  setCollections: (collections) => set({ collections }),
}));

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.selectedSize === item.selectedSize
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.selectedSize === item.selectedSize 
                  ? { ...i, quantity: i.quantity + item.quantity } 
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id, selectedSize) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.selectedSize === selectedSize)),
        })),
      updateQuantity: (id, quantity, selectedSize) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.selectedSize === selectedSize ? { ...i, quantity: Math.max(0, quantity) } : i
          ).filter(i => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'raici-mart-cart',
    }
  )
);

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  quickViewProduct: null,
  toast: null,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  }
}));
