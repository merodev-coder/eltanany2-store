// frontend/src/context/CartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Product, CartItem } from '@/types';
import { useAuth } from './AuthContext';
import axiosClient from '@/api/axiosClient';

/* ------------------------------------------------------------------ */
/*  Guest Cart helpers (24h expiry via cookies)                      */
/* ------------------------------------------------------------------ */
const GUEST_CART_KEY = 'eltanany_gc';
const GUEST_CART_EXPIRY_KEY = 'eltanany_gce';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getStoredGuestCart(): CartItem[] {
  const expiry = getCookie(GUEST_CART_EXPIRY_KEY);
  if (!expiry) {
    deleteCookie(GUEST_CART_KEY);
    return [];
  }
  if (new Date(expiry) < new Date()) {
    deleteCookie(GUEST_CART_KEY);
    deleteCookie(GUEST_CART_EXPIRY_KEY);
    return [];
  }
  const stored = getCookie(GUEST_CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function storeGuestCart(items: CartItem[]) {
  setCookie(GUEST_CART_KEY, JSON.stringify(items), 1);
  setCookie(GUEST_CART_EXPIRY_KEY, new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(), 2);
}

function clearGuestCart() {
  deleteCookie(GUEST_CART_KEY);
  deleteCookie(GUEST_CART_EXPIRY_KEY);
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth() || {};
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevUserRef = useRef<string | null>(null);
  const initialLoad = useRef(true);

  // ── Load cart on mount / user change ──
  useEffect(() => {
    if (initialLoad.current) {
      if (isAuthenticated && user?._id) {
        fetchUserCart();
      } else {
        setItems(getStoredGuestCart());
      }
      initialLoad.current = false;
    } else {
      if (isAuthenticated && user?._id) {
        if (prevUserRef.current !== user._id) {
          setItems([]); // Ensure isolation on user switch
          fetchUserCart();
        }
      } else if (prevUserRef.current !== null) {
        // User logged out — switch to guest cart from cookies
        setItems(getStoredGuestCart());
      }
    }
    prevUserRef.current = isAuthenticated && user?._id ? user._id : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?._id]);

  // ── Fetch from server ──
  const fetchUserCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    try {
      const response = await axiosClient.get('/users/cart');
      if (response.data.success && response.data.data.cart?.items) {
        const serverItems: CartItem[] = response.data.data.cart.items.map((item: any) => ({
          product: {
            id: item.productId,
            name: item.name,
            brand: '',
            category: 'laptop' as const,
            price: item.price,
            images: [item.imageUrl],
            description: '',
            stock: 100,
            rating: 0,
            reviewCount: 0,
            reviews: [],
            isFeatured: false,
            isNew: false,
          },
          quantity: item.qty,
          color: item.color,
        }));
        setItems(serverItems);
      }
    } catch (err) {
      console.warn('Failed to fetch cart from server:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  // ── Sync to server or cookies ──
  const syncCart = useCallback(
    async (newItems: CartItem[]) => {
      if (!isAuthenticated) {
        storeGuestCart(newItems);
      } else {
        try {
          const serverItems = newItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            qty: item.quantity,
            imageUrl: item.product.images[0] || '',
            color: item.color,
          }));
          await axiosClient.post('/users/cart', { items: serverItems });
        } catch (err) {
          console.warn('Failed to sync cart to server:', err);
        }
      }
    },
    [isAuthenticated]
  );

  // ── Actions ──
  const addItem = useCallback(
    async (product: Product, color?: string) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id && i.color === color);
        let newItems: CartItem[];
        if (existing) {
          newItems = prev.map((i) =>
            i.product.id === product.id && i.color === color
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          newItems = [...prev, { product, quantity: 1, color }];
        }
        syncCart(newItems);
        return newItems;
      });
    },
    [syncCart]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.product.id !== productId);
        syncCart(newItems);
        return newItems;
      });
    },
    [syncCart]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) => {
        const newItems = prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
        syncCart(newItems);
        return newItems;
      });
    },
    [syncCart]
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (!isAuthenticated) {
      clearGuestCart();
    } else {
      try {
        await axiosClient.delete('/users/cart');
      } catch (err) {
        console.warn('Failed to clear server cart:', err);
      }
    }
  }, [isAuthenticated]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isSyncing }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
