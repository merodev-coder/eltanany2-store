// services/mockApi.ts
// Stub wrapper to allow compilation while storefront pages are migrated to real API.
import axiosClient from '@/api/axiosClient';

// ── Public Product API ────────────────────────────────────
export const getAllLaptops = async () => {
  const res = await axiosClient.get('/public/products?category=laptop');
  return res.data.data?.products || [];
};

export const getAllAccessories = async () => {
  const res = await axiosClient.get('/public/products?category=accessory');
  return res.data.data?.products || [];
};

export const getFeaturedLaptops = async () => {
  const res = await axiosClient.get('/public/products?category=laptop');
  return res.data.data?.products || [];
};

export const filterLaptops = async (_options?: any) => {
  const res = await axiosClient.get('/public/products?category=laptop');
  const products = res.data.data?.products || [];
  return { products, pagination: { total: products.length } };
};

export const filterAccessories = async (_options?: any) => {
  const res = await axiosClient.get('/public/products?category=accessory');
  const products = res.data.data?.products || [];
  return { products, pagination: { total: products.length } };
};

export const getFilterOptions = async () => ({
  brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS'] as string[],
  priceRanges: [] as string[],
  ramOptions: ['8GB', '16GB', '32GB'] as string[],
  storageOptions: ['256GB SSD', '512GB SSD', '1TB SSD'] as string[],
});

export const getProductById = async (id: string) => {
  const res = await axiosClient.get(`/public/products/${id}`);
  return res.data.data?.product;
};

export const getRelatedProducts = async (_id: string) => {
  const res = await axiosClient.get('/public/products');
  return res.data.data?.products?.slice(0, 4) || [];
};

export const searchProducts = async (query: string) => {
  if (!query) return [];
  const res = await axiosClient.get(`/public/products?search=${encodeURIComponent(query)}`);
  return res.data.data?.products || [];
};

// ── Homepage static/CMS stubs ───────────────────────────
export const getHeroSlides = async () => [];
export const getCategoryCards = async () => [];
export const getWhyCards = async () => [];
export const getStats = async () => [];
export const getTestimonials = async () => [];

// ── Admin product ─────────────────────────────────────────
export const addProduct = async (data: any) => {
  const res = await axiosClient.post('/admin/products', data);
  return res.data;
};

// ── Price list (stored in localStorage) ─────────────────
const PRICE_LIST_KEY = 'eltanany_price_list_docx';

export const getPriceList = async () => {
  try {
    const raw = localStorage.getItem(PRICE_LIST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const uploadPriceList = async (buffer: ArrayBuffer) => {
  localStorage.setItem(PRICE_LIST_KEY, JSON.stringify({ data: Array.from(new Uint8Array(buffer)) }));
  return { success: true };
};

export const getPriceListArrayBuffer = async (): Promise<ArrayBuffer | null> => {
  try {
    const raw = localStorage.getItem(PRICE_LIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.data) {
      return new Uint8Array(parsed.data).buffer;
    }
    return null;
  } catch { return null; }
};

// ── Admin overview (unused stubs) ────────────────────────
export const getOrders = async () => { throw new Error('Use OrdersManagementView'); };
export const getMonthlyInventoryList = async () => [];
