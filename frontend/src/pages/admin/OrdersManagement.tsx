import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/apiClient';
import { X, ChevronDown, Search, Trash2, Check, XCircle, ArrowRight, Package, User, Calendar } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerInfo?: { name: string; phone: string; address: string; notes?: string };
  createdAt: string;
  totalValue: number;
  subtotal?: number;
  shippingCost?: number;
  status: string;
  paymentMethod?: string;
  receiptUrl?: string;
  items: OrderItem[];
  deliveryType?: string;
}

interface Pagination {
  page: number;
  total: number;
  pages: number;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'rejected' | 'cancelled';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'approved', label: 'موافق عليه' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'processing', label: 'قيد التجهيز' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'cancelled', label: 'ملغي' },
];

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved:   { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  confirmed:  { bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  processing: { bg: 'bg-blue-100',   text: 'text-blue-700' },
  shipped:    { bg: 'bg-purple-100', text: 'text-purple-700' },
  delivered:  { bg: 'bg-green-100',  text: 'text-green-700' },
  rejected:   { bg: 'bg-red-100',    text: 'text-red-700' },
  cancelled:  { bg: 'bg-gray-100',   text: 'text-gray-600' },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: '20' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await axiosClient.get(`/admin/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, searchQuery]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await axiosClient.patch(`/admin/orders/${id}/status`, { status });
      await fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch {}
    setActionLoading(null);
  };

  const hardDelete = async (id?: string) => {
    const target = id || deleteConfirm;
    if (!target) return;
    try {
      await axiosClient.delete(`/admin/orders/${target}`);
      setDeleteConfirm(null);
      await fetchOrders();
      if (selectedOrder?._id === target) setSelectedOrder(null);
    } catch {}
    setDeleteConfirm(null);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const badge = (s: string) => STATUS_BADGE[s] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
  const label = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Header ───────────────────────────────────────────────────── */}°
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl text-zinc-900">إدارة الطلبات</h2>
          <p className="font-body text-sm text-slate mt-1">
            عرض وتعديل وحذف طلبات العملاء
            <span className="text-xs text-slate/60"> (تُحذف تلقائياً بعد 15 يوم)</span>
          </p>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}°
      <div className="bg-white rounded-2xl shadow-sm border border-steel-light/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف..."
              className="w-full pr-9 pl-3 py-2 text-sm font-body rounded-xl border border-steel-light bg-white focus:outline-none focus:ring-2 focus:ring-ignition-start/30"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none pl-8 pr-10 py-2 text-sm font-body rounded-xl border border-steel-light bg-white focus:outline-none focus:ring-2 focus:ring-ignition-start/30 cursor-pointer"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}°
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-body text-sm text-red-700">{error}</div>
      )}

      {/* ── Orders table ─────────────────────────────────────────────── */}°
      <div className="bg-white rounded-2xl shadow-sm border border-steel-light/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-steel-light bg-steel-light/20">
                <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">رقم الطلب</th>
                <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">العميل</th>
                <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">التاريخ</th>
                <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">الإجمالي</th>
                <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">الحالة</th>
                <th className="text-center py-3 px-4 font-body text-xs text-slate font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-light/50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><div className="w-8 h-8 border-2 border-ignition-start border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center font-body text-sm text-slate">لا توجد طلبات</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-steel-light/20 transition-colors">
                  <td className="py-3 px-4 font-body text-sm font-medium text-zinc-900">#{order.orderNumber || order._id.slice(-6)}</td>
                  <td className="py-3 px-4 font-body text-sm text-zinc-800">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate/50" />
                      {order.customerInfo?.name || order.customerName || '-'}
                    </div>
                    {order.customerPhone && <div className="text-xs text-slate/70 mt-0.5" dir="ltr">{order.customerPhone}</div>}
                  </td>
                  <td className="py-3 px-4 font-body text-sm text-slate whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate/50" />
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-body text-sm font-semibold text-zinc-900">
                    {(order.totalValue || 0).toLocaleString()} ج.م
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-body font-medium ${badge(order.status).bg} ${badge(order.status).text}`}>
                      {label(order.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {order.status === 'pending' && (
                        <>
                          <ActionBtn
                            onClick={() => updateStatus(order._id, 'approved')}
                            loading={actionLoading === order._id}
                            variant="green"
                            icon={<Check className="w-3.5 h-3.5" />}
                            title="موافقة"
                          />
                          <ActionBtn
                            onClick={() => updateStatus(order._id, 'rejected')}
                            loading={actionLoading === order._id}
                            variant="red"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                            title="رفض"
                          />
                        </>
                      )}
                      {order.status === 'approved' && (
                        <ActionBtn
                          onClick={() => updateStatus(order._id, 'processing')}
                          loading={actionLoading === order._id}
                          variant="blue"
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                          title="بدء التجهيز"
                        />
                      )}
                      {order.status === 'processing' && (
                        <ActionBtn
                          onClick={() => updateStatus(order._id, 'shipped')}
                          loading={actionLoading === order._id}
                          variant="purple"
                          icon={<Package className="w-3.5 h-3.5" />}
                          title="تم الشحن"
                        />
                      )}
                      {order.status === 'shipped' && (
                        <ActionBtn
                          onClick={() => updateStatus(order._id, 'delivered')}
                          loading={actionLoading === order._id}
                          variant="green"
                          icon={<Check className="w-3.5 h-3.5" />}
                          title="تم التوصيل"
                        />
                      )}

                      {/* Delete — always available */}
                      <ActionBtn
                        onClick={() => setDeleteConfirm(order._id)}
                        variant="ghost-red"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        title="حذف نهائي"
                      />

                      {/* Detail modal trigger */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-slate hover:text-ignition-start hover:bg-ignition-start/10 transition-colors"
                        title="تفاصيل"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-steel-light p-4">
            <span className="font-body text-xs text-slate">
              صفحة {pagination.page} من {pagination.pages} — {pagination.total} طلب
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 rounded-lg font-body text-sm border border-steel-light disabled:opacity-40 hover:bg-steel-light/30 transition-colors"
              >
                السابق
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 rounded-lg font-body text-sm border border-steel-light disabled:opacity-40 hover:bg-steel-light/30 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Order detail modal ───────────────────────────────────────── */}°
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={s => { updateStatus(selectedOrder._id, s); setSelectedOrder(prev => prev ? { ...prev, status: s } : null); }}
          onDelete={() => { hardDelete(selectedOrder._id); setSelectedOrder(null); }}
        />
      )}

      {/* ── Delete confirmation ──────────────────────────────────────── */}°
      {deleteConfirm && (
        <ConfirmModal
          title="حذف الطلب نهائياً"
          message="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={() => hardDelete()}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ── Small action button ───────────────────────────────────────────────────────
function ActionBtn({
  onClick, loading, icon, title, variant,
}: {
  onClick: () => void; loading: boolean; icon: React.ReactNode; title: string;
  variant: 'green' | 'red' | 'blue' | 'purple' | 'ghost-red';
}) {
  const base = 'p-2 rounded-lg transition-all disabled:opacity-50';
  const colors: Record<string, string> = {
    green:      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    red:        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    blue:       'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    purple:     'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
    'ghost-red':'text-red-500 hover:bg-red-50',
  };
  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${colors[variant]}`} title={title}>
      {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : icon}
    </button>
  );
}

// ── Order detail modal ────────────────────────────────────────────────────────
function OrderDetailModal({
  order, onClose, onStatusChange, onDelete,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (s: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-steel-light p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading font-bold text-lg text-zinc-900">
              الطلب #{order.orderNumber || order._id.slice(-6)}
            </h3>
            <p className="font-body text-xs text-slate mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-steel-light/50 transition-colors">
            <X className="w-5 h-5 text-slate" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer */}
          <Section title="معلومات العميل" icon={<User className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الاسم" value={order.customerInfo?.name || order.customerName} />
              <Field label="الهاتف" value={order.customerPhone || order.customerInfo?.phone} dir="ltr" />
              <Field label="العنوان" value={order.customerAddress || order.customerInfo?.address} full />
              <Field label="ملاحظات" value={order.customerInfo?.notes} full optional />
            </div>
          </Section>

          {/* Items */}
          <Section title={`المنتجات (${order.items.length})`} icon={<Package className="w-4 h-4" />}>
            <div className="border border-steel-light rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-steel-light/40">
                  <tr>
                    <th className="text-right py-2 px-3 font-body text-xs text-slate font-medium">المنتج</th>
                    <th className="text-center py-2 px-3 font-body text-xs text-slate">الكمية</th>
                    <th className="text-left py-2 px-3 font-body text-xs text-slate">السعر</th>
                    <th className="text-left py-2 px-3 font-body text-xs text-slate">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-light/50">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-steel-light" />
                          )}
                          <span className="font-body text-sm font-medium text-zinc-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-center font-body text-sm">{item.quantity}</td>
                      <td className="text-left font-body text-sm text-zinc-800">{item.price.toLocaleString()} ج.م</td>
                      <td className="text-left font-body text-sm font-semibold text-zinc-900">{(item.price * item.quantity).toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-steel-light/20">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 font-body text-sm text-slate text-left">المجموع الفرعي</td>
                    <td className="py-2 px-3 font-body text-sm font-semibold text-left">{(order.subtotal || order.totalValue || 0).toLocaleString()} ج.م</td>
                  </tr>
                  {order.shippingCost ? (
                    <tr>
                      <td colSpan={3} className="py-2 px-3 font-body text-sm text-slate text-left">رسوم الشحن</td>
                      <td className="py-2 px-3 font-body text-sm text-left">{order.shippingCost.toLocaleString()} ج.م</td>
                    </tr>
                  ) : null}
                  <tr className="border-t border-steel-light">
                    <td colSpan={3} className="py-2.5 px-3 font-body text-sm font-bold text-left">الإجمالي النهائي</td>
                    <td className="py-2.5 px-3 font-heading font-bold text-ignition-start text-left">{(order.totalValue || 0).toLocaleString()} ج.م</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          {/* Receipt */}
          {order.receiptUrl && (
            <Section title="إثبات الدفع">
              <div className="rounded-xl overflow-hidden border border-steel-light inline-block">
                <img src={order.receiptUrl} alt="إيصال" className="max-h-48 object-contain" />
              </div>
              <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-body text-xs text-ignition-start hover:underline">فتح في نافذة جديدة</a>
            </Section>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-steel-light">
            {order.status === 'pending' && (
              <>
                <button onClick={() => onStatusChange('approved')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-body text-sm hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> قبول الطلب
                </button>
                <button onClick={() => onStatusChange('rejected')} className="px-4 py-2 rounded-xl bg-red-600 text-white font-body text-sm hover:bg-red-700 shadow-sm transition-colors flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> رفض الطلب
                </button>
              </>
            )}
            {(order.status === 'delivered' || order.status === 'cancelled' || order.status === 'rejected') ? (
              <button onClick={onDelete} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-body text-sm hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200">
                <Trash2 className="w-4 h-4" /> حذف نهائي
              </button>
            ) : (
              <button onClick={onDelete} className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-500 font-body text-sm hover:bg-zinc-200 transition-colors flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> حذف
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg text-zinc-900">{title}</h3>
        <p className="font-body text-sm text-slate">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl font-body text-sm border border-steel-light hover:bg-steel-light/30 transition-colors">إلغاء</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl font-body text-sm bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors">حذف</button>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Section({ title, icon, children }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-steel-light/70 bg-steel-light/10">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-steel-light/70">
        {icon && <span className="text-ignition-start">{icon}</span>}
        <h4 className="font-heading font-bold text-sm text-zinc-900">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, value, dir, full, optional }: {
  label: string;
  value?: string | null;
  dir?: 'ltr' | 'rtl';
  full?: boolean;
  optional?: boolean;
}) {
  if (optional && !value) return null;
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <p className="font-body text-[11px] text-slate/70 mb-0.5">{label}</p>
      <p className={`font-body text-sm font-medium text-zinc-800 ${full ? '' : 'truncate'} ${dir === 'ltr' ? 'direction-ltr text-right' : ''}`} dir={dir}>
        {value ?? '—'}
      </p>
    </div>
  );
}
