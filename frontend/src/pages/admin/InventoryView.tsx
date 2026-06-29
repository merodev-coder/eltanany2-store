// pages/admin/InventoryView.tsx
// Inventory table with live CRUD: list, edit (modal), delete (inline).

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  Layers,
  Search,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import type { Product } from '@/types';
import EditProductModal from '@/components/admin/EditProductModal';

const PAGE_SIZE = 8;

const statusConfig = {
  high: { label: 'متوفر بكثرة', className: 'bg-success/10 text-success' },
  critical: { label: 'كمية حرجة', className: 'bg-warning/10 text-warning' },
  out: { label: 'نفد المخزون', className: 'bg-error/10 text-error' },
};

const categoryLabels: Record<string, string> = {
  laptop: 'لابتوب',
  accessory: 'إكسسوار',
};

type CategoryFilter = 'all' | 'laptop' | 'accessory';

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/public/products');
      if (response.data.success) {
        const data: Product[] = (response.data.data.products || []).map((p: any) => ({
          ...p,
          _id: p._id || p.id,
        }));
        setProducts(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Delete (optimistic) ──────────────────────────
  const handleDelete = async (id: string) => {
    const prev = products;
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setDeletingId(id);

    try {
      await axiosClient.delete(`/admin/products/${id}`);
      setConfirmDeleteId(null);
    } catch (err: any) {
      setProducts(prev);
      setError(err.response?.data?.message || 'فشل الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Edit callback ────────────────────────────────
  const handleUpdate = (updated: Partial<Product>) => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) =>
        p._id === editingProduct._id ? { ...p, ...updated } : p
      )
    );
  };

  // ── Derived ───────────────────────────────────────
  const filtered = products.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ─────────────────────────────────────────
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.stock || 0) * (p.buyingPrice || p.sellingPrice || 0),
    0
  );
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 5).length;
  const activeProductsCount = products.filter((p) => (p.stock || 0) > 0).length;

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 text-center">
        <p className="text-error font-body mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 rounded-lg gradient-brand text-white font-body text-sm"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">الجرد والإحصائيات</h2>
        <p className="font-body text-sm text-slate mt-1">سجل الجرد الشهري ومتابعة المخزون</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'إجمالي المخزون',
            value: `${totalInventoryValue.toLocaleString()} ج.م`,
            icon: Package,
            color: 'text-ignition-start',
            bg: 'bg-ignition-start/10',
          },
          {
            label: 'قطع منخفضة المخزون',
            value: lowStockCount.toString(),
            icon: AlertTriangle,
            color: 'text-warning',
            bg: 'bg-warning/10',
          },
          {
            label: 'المنتجات النشطة',
            value: activeProductsCount.toString(),
            icon: Layers,
            color: 'text-success',
            bg: 'bg-success/10',
          },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="bg-white shadow-sm rounded-card p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="font-body text-sm text-slate">{card.label}</p>
            <p className="font-heading font-bold text-2xl text-[#18181B] mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث في المخزن..."
              className="w-full h-10 pr-9 pl-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'all' as const, label: 'الكل' },
              { id: 'laptop' as const, label: 'لابتوبات' },
              { id: 'accessory' as const, label: 'إكسسوارات' },
            ]).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => { setCategory(chip.id); setPage(1); }}
                className={`px-4 py-2 rounded-xl font-body text-sm font-medium transition-all duration-200 ${
                  category === chip.id
                    ? 'gradient-prade text-white shadow-glow'
                    : 'bg-steel-light text-slate hover:text-[#18181B]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-steel-light">
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">معلومات المنتج</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الماركة</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">سعر الشراء</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">سعر البيع</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">المخزون</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">حالة التوفر</th>
                <th className="text-center py-3 px-4 font-body text-sm text-slate font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 font-body text-slate">
                    لا توجد منتجات مطابقة
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-steel-light/50 last:border-0 hover:bg-steel-light/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl || '/images/logo.jpeg'}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover border border-steel-light flex-shrink-0"
                        />
                        <div>
                          <p className="font-body text-sm font-medium text-[#18181B]">{item.name}</p>
                          <p className="font-body text-xs text-slate">{categoryLabels[item.category]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-slate">{item.brand}</td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">
                      {(item.buyingPrice || 0).toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B] font-medium">
                      {item.sellingPrice.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B] font-medium">{item.stock}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const stock = item.stock || 0;
                        const status: 'high' | 'critical' | 'out' =
                          stock <= 0 ? 'out' : stock <= 5 ? 'critical' : 'high';
                        return (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusConfig[status].className}`}
                          >
                            {statusConfig[status].label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => setEditingProduct(item)}
                          className="p-1.5 rounded-lg hover:bg-steel-light transition-colors text-slate"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        {confirmDeleteId === item._id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-body text-slate">هل أنت متأكد؟</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="px-2 py-1 rounded-md bg-error/10 text-error text-xs font-body font-medium hover
:brightness-90 transition-colors"
                            >
                              نعم
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-md bg-steel-light text-slate text-xs font-body"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate hover:text-error"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-steel-light">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-body text-sm text-slate hover:bg-steel-light disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-lg font-body text-sm font-medium transition-all ${
                  page === num
                    ? 'gradient-brand text-white shadow-glow'
                    : 'bg-steel-light text-slate hover:text-[#18181B]'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-body text-sm text-slate hover:bg-steel-light disabled:opacity-40 transition-colors"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
