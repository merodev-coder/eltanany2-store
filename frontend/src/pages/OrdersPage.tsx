// frontend/src/pages/OrdersPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Truck, Check, X, Clock, AlertCircle } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────
interface BackendOrderItem {
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
}

interface BackendOrder {
  _id: string;
  items: BackendOrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  receiptVerified: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Status mapping ───────────────────────────────────
const statusConfig: Record<BackendOrder['status'], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'تم التأكيد', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: Check },
  processing: { label: 'يتم التوصيل', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
  shipped: { label: 'تم الشحن', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Package },
  delivered: { label: 'تم الاستلام', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200', icon: X },
};

function formatCurrency(value: number): string {
  return value.toLocaleString('ar-EG') + ' ج.م';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get('/users/orders/my');
        if (response.data.success) {
          setOrders(response.data.data.orders || []);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب الطلبات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">يجب تسجيل الدخول</h2>
          <p className="text-zinc-400 mb-4">يرجى تسجيل الدخول لعرض طلباتك</p>
          <Link to="/login" className="inline-block px-6 py-2 bg-amber-400 text-zinc-950 rounded-xl font-bold hover:bg-amber-300 transition-colors">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white font-heading">طلباتي</h1>
          <p className="text-zinc-400 mt-1">تتبع حالة طلباتك وشحناتك</p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6 text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-16 h-16 text-zinc-aff/30 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h2>
            <p className="text-zinc-400 mb-4">لم تقم بأي طلبات حتى الآن</p>
            <Link to="/" className="inline-block px-6 py-2 bg-amber-400 text-zinc-950 rounded-xl font-bold hover:bg-amber-300 transition-colors">
              تسوق الآن
            </Link>
          </motion.div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order, index) => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">طلب #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-zinc-400 text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusInfo.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-zinc-400 text-xs">{item.qty} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <p className="text-amber-400 text-sm font-medium">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="text-zinc-400 text-sm">
                    {order.items.length} {order.items.length === 1 ? 'منتج' : 'منتجات'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm">المجموع:</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(order.subtotal)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
