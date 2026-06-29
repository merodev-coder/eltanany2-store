// pages/admin/OrdersManagementView.tsx
// Live orders page with status filter tabs and detail modal.

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import type { Order, OrderStatus } from '@/types';
import OrderDetailModal from '@/components/admin/OrderDetailModal';

const statusTabs = [
  { key: 'all', label: 'الكل', color: 'bg-slate-100 text-slate-700' },
  { key: 'pending', label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  { key: 'approved', label: 'موافق عليه', color: 'bg-green-100 text-green-700' },
  { key: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-700' },
  { key: 'delivered', label: 'تم التوصيل', color: 'bg-blue-100 text-blue-700' },
] as const;

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

export default function OrdersManagementView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ── Fetch ─────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const response = await axiosClient.get(`/admin/orders${params}`);
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Handle status change ──────────────────────────
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // ── Filter + Search ──────────────────────────────
  const filtered = orders.filter((order) => {
    const q = search.trim();
    if (!q) return true;
    return (
      order.orderNumber.includes(q) ||
      order.customerName.toLowerCase().includes(q.toLowerCase())
    );
  });

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 text-center">
        <p className="text-error font-body mb-4">{error}</p>
        <button
          onClick={fetchOrders}
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
        <h2 className="font-heading font-bold text-xl text-[#18181B]">إدارة الطلبات</h2>
        <p className="font-body text-sm text-slate mt-1">متابعة الطلبات ومراجعة إيصالات العربون</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl font-body text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'gradient-brand text-white shadow-glow'
                : 'bg-steel-light text-slate hover:text-[#18181B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white shadow-sm rounded-card p-4 sm:p-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب أو اسم العميل..."
            className="w-full h-10 pr-9 pl-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-steel-light">
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">رقم الطلب</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">اسم العميل</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">تاريخ الطلب</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">القيمة الإجمالية</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">حالة الطلب</th>
                <th className="text-center py-3 px-4 font-body text-sm text-slate font-medium">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-body text-slate">
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-steel-light/50 last:border-0 hover:bg-steel-light/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-sm font-medium text-[#18181B]">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-slate">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B] font-medium">
                      {order.totalValue.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${statusBadge[order.status].className}`}
                      >
                        {statusBadge[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-ignition-start/10 text-ignition-start font-body text-xs font-medium hover:bg-ignition-start/20 transition-colors"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
