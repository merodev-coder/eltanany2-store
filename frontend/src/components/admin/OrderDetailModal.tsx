// components/admin/OrderDetailModal.tsx
// Displays full order details with عربون receipt preview and status actions.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, CheckCircle, XCircle, Receipt } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import type { Order, OrderStatus } from '@/types';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusBadge: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'موافق عليه', className: 'bg-green-50 text-green-700' },
  confirmed: { label: 'تم التأكيد', className: 'bg-emerald-50 text-emerald-700' },
  processing: { label: 'قيد التجهيز', className: 'bg-indigo-50 text-indigo-700' },
  shipped: { label: 'تم الشحن', className: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'تم التوصيل', className: 'bg-blue-50 text-blue-700' },
  rejected: { label: 'مرفوض', className: 'bg-red-50 text-red-700' },
  cancelled: { label: 'ملغي', className: 'bg-gray-50 text-gray-700' },
};

export default function OrderDetailModal({
  order,
  open,
  onClose,
  onStatusChange,
}: OrderDetailModalProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !order) return null;

  const handleStatus = async (newStatus: OrderStatus) => {
    setError(null);
    setActionLoading(true);

    try {
      const response = await api.patch(`/admin/orders/${order._id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        onStatusChange(order._id, newStatus);
        onClose();
      } else {
        setError(response.data.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث الحالة');
    } finally {
      setActionLoading(false);
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-[#18181B]">
              تفاصيل الطلب #{order.orderNumber}
            </h3>
            <p className="font-body text-sm text-slate mt-1">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-steel-light flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate" />
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-steel-light/50 rounded-xl p-4 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-slate">اسم العميل</span>
            <span className="font-body text-sm font-medium text-[#18181B]">{order.customerName}</span>
          </div>
          {order.customerPhone && (
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate">رقم الهاتف</span>
              <span className="font-body text-sm font-medium text-[#18181B]" dir="ltr">{order.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-slate">الحالة</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusBadge[order.status].className}`}>
              {statusBadge[order.status].label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-slate">الإجمالي</span>
            <span className="font-heading font-bold text-[#18181B]">{order.totalValue.toLocaleString()} ج.م</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-sm text-[#18181B] mb-3">المنتجات</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-steel-light/30">
                <div>
                  <p className="font-body text-sm font-medium text-[#18181B]">{item.name}</p>
                  <p className="font-body text-xs text-slate">الكمية: {item.quantity}</p>
                </div>
                <span className="font-body text-sm text-[#18181B]">
                  {(item.price * item.quantity).toLocaleString()} ج.م
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* عربون Receipt */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-sm text-[#18181B] mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            صورة العربون
          </h4>
          {order.receiptUrl ? (
            <div className="space-y-2">
              <img
                src={order.receiptUrl}
                alt="عربون"
                className="w-full max-h-64 object-contain rounded-xl border border-steel-light/50 bg-steel-light/20"
                loading="lazy"
              />
              <a
                href={order.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-body text-ignition-start hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                افتح الصورة
              </a>
            </div>
          ) : (
            <p className="text-slate text-sm font-body bg-steel-light/30 rounded-lg p-4 text-center">
              لم يتم رفع صورة العربون
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-error text-sm font-body mb-4">{error}</p>
        )}

        {/* Actions */}
        {order.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleStatus('approved')}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl gradient-brand text-white font-heading font-bold text-sm hover:shadow-glow transition-shadow disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              موافقة
            </button>
            <button
              type="button"
              onClick={() => handleStatus('rejected')}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-error/10 text-error font-heading font-bold text-sm hover:bg-error/20 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              رفض
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
