// frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  ShoppingBag,
  Lock,
  Edit3,
  Loader2,
  Calendar,
  Phone,
  FileText,
  Upload,
  CheckCircle,
} from 'lucide-react';
import axiosClient from '@/api/apiClient';
import { UploadButton } from '@/components/ui/uploadthing';
import { toast } from 'sonner';

// Types
interface Order {
  _id: string;
  status: string;
  subtotal: number;
  items: Array<{ name: string; qty: number; price: number }>;
  createdAt: string;
}

// Default admin email — only this user sees the .docx upload box
const DEFAULT_ADMIN_EMAIL = 'admin@eltanany.com';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-purple-500/20 text-purple-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-zinc-500/20 text-zinc-400'}`}>
      {status}
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
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isDefaultAdmin = user?.email === DEFAULT_ADMIN_EMAIL;

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
      toast.success('تم حفظ التعديلات');
    } catch {
      toast.error('فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadComplete = async (res: Array<{ url: string; name: string }>) => {
  if (res?.[0]?.url && res?.[0]?.name) {
    const fileUrl = res[0].url;
    const fileName = res[0].name;
    setUploadedFile({ url: fileUrl, name: fileName });
    toast.success('تم رفع الملف بنجاح!');
    try {
      await axiosClient.post('/admin/settings/price-list', { url: fileUrl, fileName });
      toast.success('تم حفظ قائمة الأسعار بنجاح');
    } catch {
      toast.error('تم الرفع لكن فشل حفظ البيانات — حاول مرة أخرى');
    }
  } else {
    toast.error('حدث خطأ أثناء معالجة الملف');
  }
  setIsUploading(false);
};

  const handleUploadError = (error: Error) => {
    toast.error('فشل الرفع: ' + error.message);
    setIsUploading(false);
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6"
              >
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
              </motion.div>
            )}

            {/* Admin-only .docx upload box */}
            {isDefaultAdmin && (
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">رفع ملف .docx</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                  ارفع ملف Word (.docx) هنا 
                </p>

                {uploadedFile && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-green-400 font-medium truncate">{uploadedFile.name}</p>
                      <a
                        href={uploadedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400/70 hover:text-green-400 underline"
                      >
                        فتح الرابط
                      </a>
                    </div>
                  </div>
                )}

                <UploadButton
                  endpoint="docxUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={() => setIsUploading(true)}
                  appearance={{
                    button: 'w-full h-32 rounded-xl border-2 border-dashed border-zinc-700 hover:border-amber-400 transition-colors flex flex-col items-center justify-center gap-2 bg-transparent text-zinc-400',
                    allowedContent: 'text-xs text-zinc-600',
                  }}
                  content={{
                    button({ isUploading }: { isUploading: boolean }) {
                      if (isUploading) {
                        return (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                            <span className="text-sm">جاري الرفع…</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8" />
                          <span className="text-sm font-medium">اضغط لرفع ملف .docx</span>
                          <span className="text-xs text-zinc-600">حد أقصى 16 ميجابايت</span>
                        </div>
                      );
                    },
                  }}
                />
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
