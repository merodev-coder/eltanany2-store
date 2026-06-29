// components/admin/EditProductModal.tsx
// Modal pre-populated with existing product data for inline editing.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import type { Product } from '@/types';

interface EditProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Partial<Product>) => void;
}

export default function EditProductModal({
  product,
  open,
  onClose,
  onUpdate,
}: EditProductModalProps) {
  const [buyingPrice, setBuyingPrice] = useState<number>(product.buyingPrice);
  const [sellingPrice, setSellingPrice] = useState<number>(product.sellingPrice);
  const [stock, setStock] = useState<number>(product.stock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.patch(`/admin/products/${product._id}`, {
        buyingPrice,
        sellingPrice,
        stock,
      });

      if (response.data.success) {
        onUpdate({ buyingPrice, sellingPrice, stock });
        onClose();
      } else {
        setError(response.data.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-xl text-[#18181B]">تعديل المنتج</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-steel-light flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-slate" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              سعر الشراء (ج.م)
            </label>
            <input
              type="number"
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(Number(e.target.value))}
              min={0}
              step={0.01}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              سعر البيع (ج.م)
            </label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              min={0}
              step={0.01}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              المخزون الحالي
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min={0}
              step={1}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-error text-sm font-body">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl border-2 border-steel-light font-body font-medium text-sm text-[#18181B] hover:border-steel-dark transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl gradient-brand text-white font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'حفظ التعديلات'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
