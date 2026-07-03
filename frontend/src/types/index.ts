// types/index.ts
// Shared TypeScript interfaces for the El-Tanany e-commerce platform.
// Extend this file as the project grows. Keep all domain types here
// so every consumer imports from a single source of truth.

// ────────────────────────────────────────────────────────────
// UploadThing
// ────────────────────────────────────────────────────────────
/** Result object returned by UploadThing's onClientUploadComplete callback. */
export interface UTUploadResult {
url: string;
name: string;
size?: number;
}

// ────────────────────────────────────────────────────────────
// Product
// ────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;           // اسم المنتج
  category: 'laptop' | 'accessory';
  subcategory?: string;
  brand?: string;         // الماركة
  buyingPrice?: number;    // سعر الشراء
  price: number;           // سعر البيع (alias for sellingPrice)
  sellingPrice?: number;   // سعر البيع (legacy)
  stock: number;          // المخزون
  imageUrl?: string;
  images?: string[];      // for backward compat
  description?: string;
  specs?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  isBrandNew?: boolean;
  isFeatured?: boolean;
  badge?: string;
  isPublished?: boolean;  // for soft-delete
  createdAt: string;
  updatedAt?: string;
  oldPrice?: number;       // for discounts
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

export type DeliveryType = 'shipping' | 'pickup';
export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'cash_on_delivery';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  color?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;      // رقم الطلب
  user?: string | { _id: string; name: string; email: string; phone?: string };
  customerName: string;     // اسم العميل (alias for customerInfo.name)
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
  createdAt: string;        // تاريخ الطلب
  totalValue: number;       // القيمة الإجمالية (alias for totalAmount)
  subtotal?: number;        // المجموع الفرعي
  shippingCost?: number;    // رسوم الشحن
  status: OrderStatus;
  deliveryType?: DeliveryType;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;      // UploadThing URL for عربون photo
  receiptVerified?: boolean;
  items: OrderItem[];
  depositAmount?: number;
  isPaid?: boolean;
  paidAt?: string;
}

// ────────────────────────────────────────────────────────────
// Cart
// ────────────────────────────────────────────────────────────
export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
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
// Payment Settings
// ────────────────────────────────────────────────────────────
export interface PaymentMethods {
  vodafoneCashNumber: string;
  instaPayAccount: string;
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

// ────────────────────────────────────────────────────────────
// Monthly Inventory Snapshot
// ────────────────────────────────────────────────────────────
export interface MonthlyInventorySnapshot {
  _id: string;
  monthKey: string;
  monthlyRevenue: {
    total: number;
  };
  unitsSoldThisMonth: number;
}
