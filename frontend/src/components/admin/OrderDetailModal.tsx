// components/admin/OrderDetailModal.tsx
// Displays full order details with receipt preview and status actions.

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  CheckCircle,
  XCircle,
  Receipt,
  Truck,
  Store,
  CreditCard,
  MapPin,
  Phone,
  User,
  Loader2,
  Package,
  Check,
  Clock,
} from 'lucide-react';
import axiosClient from '@/api/apiClient';
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

const statusActions: { status: OrderStatus; label: string; icon: typeof Check; className: string }[] = [
  { status: 'approved', label: 'تأكيد الطلب', icon: CheckCircle, className: 'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl gradient-brand text-white font-heading font-bold text-sm hover:shadow-glow transition-shadow disabled:opacity-50' },
  { status: 'confirmed', label: 'تم التأكيد', icon: Check, className: 'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-500 text-white font-heading font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50' },
  { status: 'processing', label: 'قيد التجهيز', icon: Clock, className: 'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-500 text-white font-heading font-bold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50' },
  { status: 'shipped', label: 'تم الشحن', icon: Truck, className: 'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-purple-500 text-white font-heading font-bold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50' },
  { status: 'delivered', label: 'تم التوصيل', icon: Package, className: 'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-500 text-white font-heading font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50' },
];

export default function OrderDetailModal({
  order,
  open,
  onClose,
  onStatusChange,
}: OrderDetailModalProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState(false);

  if (!open || !order) return null;

  const handleStatus = async (newStatus: OrderStatus) => {
    setError(null);
    setActionLoading(true);

    try {
      const response = await axiosClient.patch(`/admin/orders/${order._id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        onStatusChange(order._id, newStatus);
        // Don't close modal so admin can see the updated status
      } else {
        setError(response.data.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث الحالة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyReceipt = async (verified: boolean) => {
    setError(null);
    setActionLoading(true);
    try {
      const response = await axiosClient.patch(`/admin/orders/${order._id}/deposit-status`, {
        receiptVerified: verified,
      });
      if (response.data.success) {
        onStatusChange(order._id, order.status); // Refresh
      } else {
        setError(response.data.message || 'حدث خطأ');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  // Determine next action based on current status
  const getNextAction = () => {
    const flow: OrderStatus[] = ['pending', 'approved', 'confirmed', 'processing', 'shipped', 'delivered'];
    const idx = flow.indexOf(order.status);
    if (idx === -1 || idx >= flow.length - 1) return null;
    return statusActions[idx + 1];
  };

  const nextAction = getNextAction();

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
              تفاصيل الطلب #{order.orderNumber || order._id.slice(-6)}
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
          {order.customerAddress && (
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate">العنوان</span>
              <span className="font-body text-sm font-medium text-[#18181B]">{order.customerAddress}</span>
            </div>
          )}
          {order.deliveryType && (
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate">طريقة الاستلام</span>
              <span className="font-body text-sm font-medium text-[#18181B] flex items-center gap-1">
                {order.deliveryType === 'shipping' ? (
                  <><Truck className="w-3.5 h-3.5" /> شحن</>
                ) : (
                  <><Store className="w-3.5 h-3.5" /> استلام من الفرع</>
                )}
              </span>
            </div>
          )}
          {order.paymentMethod && (
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate">طريقة الدفع</span>
              <span className="font-body text-sm font-medium text-[#18181B] flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' :
                 order.paymentMethod === 'instapay' ? 'InstaPay' :
                 order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.paymentMethod}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-slate">الحالة</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusBadge[order.status].className}`}>
              {statusBadge[order.status].label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-slate">المجموع الفرعي</span>
            <span className="font-body text-sm font-medium text-[#18181B]">
              {((order.subtotal ?? order.totalValue) - (order.shippingCost ?? 0)).toLocaleString()} ج.م
            </span>
          </div>
          {order.shippingCost !== undefined && order.shippingCost > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-slate">الشحن</span>
              <span className="font-body text-sm font-medium text-[#18181B]">{order.shippingCost.toLocaleString()} ج.م</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-steel-light/50">
            <span className="font-heading font-bold text-sm text-[#18181B]">الإجمالي</span>
            <span className="font-heading font-bold text-lg text-[#18181B]">
              {order.totalValue.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-sm text-[#18181B] mb-3">المنتجات</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-steel-light/30">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-steel-light" />
                  )}
                  <div>
                    <p className="font-body text-sm font-medium text-[#18181B]">{item.name}</p>
                    <p className="font-body text-xs text-slate">الكمية: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-body text-sm text-[#18181B]">
                  {(item.price * item.quantity).toLocaleString()} ج.م
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt */}
        <div className="mb-6">
          <h4 className="font-heading font-bold text-sm text-[#18181B] mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            إيصال الدفع
          </h4>
          {order.receiptUrl ? (
            <div className="space-y-3">
              <div
                className="relative rounded-xl border border-steel-light/50 bg-steel-light/20 overflow-hidden cursor-pointer"
                onClick={() => setReceiptModal(true)}
              >
                <img
                  src={order.receiptUrl}
                  alt="إيصال الدفع"
                  className="w-full max-h-48 object-contain hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <span className="text-white font-body text-sm bg-black/50 px-3 py-1 rounded-lg">
                    اضغط للتكبير
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={order.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-body text-ignition-start hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح الصورة في تبويب جديد
                </a>
              </div>
              {/* Receipt Verification */}
              {!order.receiptVerified && order.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleVerifyReceipt(true)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-500 text-white font-body text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تأكيد الإيصال
                  </button>
                </div>
              )}
              {order.receiptVerified && (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-body text-sm font-medium">تم التحقق من الإيصال</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate text-sm font-body bg-steel-light/30 rounded-lg p-4 text-center">
              لم يتم رفع صورة الإيصال
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-error text-sm font-body mb-4 bg-error/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Status Flow Actions */}
        {order.status !== 'rejected' && order.status !== 'cancelled' && nextAction && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleStatus(nextAction.status)}
                disabled={actionLoading}
                className={nextAction.className}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <nextAction.icon className="w-4 h-4" />
                )}
                {nextAction.label}
              </button>
            </div>

            {/* Reject button only for pending */}
            {order.status === 'pending' && (
              <button
                type="button"
                onClick={() => handleStatus('rejected')}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-error/10 text-error font-heading font-bold text-sm hover:bg-error/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                رفض الطلب
              </button>
            )}
          </div>
        )}

        {/* Re-activate rejected orders */}
        {(order.status === 'rejected' || order.status === 'cancelled') && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleStatus('pending')}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500 text-white font-heading font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              إعادة للانتظار
            </button>
          </div>
        )}
      </div>

      {/* Full-screen Receipt Modal */}
      {receiptModal && order.receiptUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setReceiptModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setReceiptModal(false)}
              className="absolute -top-10 left-0 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={order.receiptUrl}
              alt="إيصال الدفع"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
