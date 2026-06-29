// types/index.ts
// Shared TypeScript interfaces for the El-Tanany e-commerce platform.
// Extend this file as the project grows. Keep all domain types here
// so every consumer imports from a single source of truth.

// ────────────────────────────────────────────────────────────
// Product
// ────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;           // اسم المنتج
  category: 'laptop' | 'accessory';
  subcategory?: string;
  buyingPrice: number;    // سعر الشراء
  sellingPrice: number;   // سعر البيع
  stock: number;          // المخزون
  imageUrl?: string;
  images?: string[];      // for backward compat
  description?: string;
  specs?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  badge?: string;
  createdAt: string;
  updatedAt?: string;
}

// ────────────────────────────────────────────────────────────
// Order
// ────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;      // رقم الطلب
  customerName: string;     // اسم العميل
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;        // تاريخ الطلب
  totalValue: number;       // القيمة الإجمالية
  status: OrderStatus;
  receiptUrl?: string;      // UploadThing URL for عربون photo
  items: OrderItem[];
  notes?: string;
  depositAmount?: number;
  shippingCost?: number;
}

// ────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  color?: string;
}

// ────────────────────────────────────────────────────────────
// Inventory / Ledger
// ────────────────────────────────────────────────────────────
export type InventoryStatus = 'high' | 'critical' | 'out';

export interface InventoryLedgerItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: 'laptop' | 'accessory';
  costPrice: number;
  sellingPrice: number;
  stock: number;
  unitsSold: number;
  status: InventoryStatus;
}

export interface InventoryStats {
  totalInventoryValue: number;
  lowStockCount: number;
  activeProductsCount: number;
}

// ────────────────────────────────────────────────────────────
// Governorate / Shipping
// ────────────────────────────────────────────────────────────
export interface Governorate {
  _id: string;
  name: string;
  shippingFee: number;
  cities?: string[];
  active?: boolean;
}

// ────────────────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}
