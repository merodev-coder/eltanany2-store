/**
 * Guest Cart Utilities
 * Shared helpers for reading/writing the guest cart from cookies.
 */

const GUEST_CART_KEY = 'eltanany_gc';
const GUEST_CART_EXPIRY_KEY = 'eltanany_gce';

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  color?: string;
}

export function getGuestCartItems(): GuestCartItem[] {
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

export function clearGuestCartCookies() {
  deleteCookie(GUEST_CART_KEY);
  deleteCookie(GUEST_CART_EXPIRY_KEY);
}
