// frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon, ShoppingBag, Lock, Edit3, Loader2, Calendar, Phone
} from 'lucide-react';
import axiosClient from '@/api/axiosClient';

// Types
interface Order {
  _id: string;
  status: string;
  subtotal: number;
  items: Array<{ name: string; qty: number; price: number }>;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-purple-500/20 text-purple-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  const labels: Record<string, string> = {
    pending: 'انتظار',
    confirmed: 'مؤكد',
    processing: 'جاري',
    shipped: 'شحن',
    delivered: 'تسليم',
    cancelled: 'ملغي',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-zinc-500/20 text-zinc-400'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosClient.get('/users/orders/my');
        setOrders(res.data.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosClient.patch('/users/profile/me', { name: editName, phone: editPhone });
      setEditing(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">حسابي</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="md:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-2xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>عضو منذ: {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditing(!editing);
                  setEditName(user.name);
                  setEditPhone(user.phone || '');
                }}
                className="mt-6 w-full h-10 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الملف الشخصي
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Edit Form */}
            {editing && (
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">تعديل الملف الشخصي</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">الاسم</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-amber-400"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 h-10 rounded-lg bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 h-10 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password */}
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">تغيير كلمة المرور</h3>
              </div>
              <p className="text-zinc-400 text-sm">
                سيتم تسجيل خروجك من جميع الأجهزة بعد تغيير كلمة المرور.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300"
              >
                إعادة تعيين كلمة المرور
              </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">طلباتي الأخيرة</h3>
                </div>
                <Link to="/orders" className="text-sm text-amber-400 hover:text-amber-300">
                  عرض جميع الطلبات
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50"
                    >
                      <div>
                        <p className="text-white font-medium">#{order._id.slice(-6)}</p>
                        <p className="text-zinc-400 text-sm">
                          {order.items.length} منتج
                        </p>
                      </div>
                      <div className="text-left">
                        <StatusBadge status={order.status} />
                        <p className="text-white font-medium mt-1">{order.subtotal} EGP</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-400">لم تقم بأي طلبات بعد</p>
                  <Link
                    to="/products"
                    className="inline-block mt-3 px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-medium text-sm hover:bg-amber-300 transition-colors"
                  >
                    تصفح المنتجات
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
