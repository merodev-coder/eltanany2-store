import { useState, useEffect, useCallback } from 'react';
import { Truck, Store, Save, CheckCircle, Plus, Trash2, Pencil, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useToast } from '@/context/ToastContext';

interface ShippingCompany {
  id: string;
  name: string;
  active: boolean;
  deliverySla: string;
  trackingUrl?: string;
}

interface DeliveryGovernorate {
  _id: string;
  name: string;
  shippingFee: number;
  active: boolean;
  cities: string[];
  carrierId: string;
}

const inputClass =
  'w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30 transition-all';

export default function DeliveryOptionsView() {
  const { showToast } = useToast();
  const [governorates, setGovernorates] = useState<DeliveryGovernorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [govName, setGovName] = useState('');
  const [govFee, setGovFee] = useState('');
  const [editingGovId, setEditingGovId] = useState<string | null>(null);

  // ── Load governorates from backend ─────────────────
  const loadGovernorates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/governorates');
      if (response.data.success && response.data.data.governorates) {
        const mapped = response.data.data.governorates.map((g: any) => ({
          _id: g._id || g.id,
          name: g.name,
          shippingFee: g.shippingFee,
          active: g.active ?? true,
          cities: g.cities || [],
          carrierId: g.carrierId || '',
        }));
        setGovernorates(mapped);
      }
    } catch (err) {
      console.error('Failed to load governorates', err);
      showToast('فشل تحميل المحافظات', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadGovernorates();
  }, [loadGovernorates]);

  const resetGovForm = () => {
    setGovName('');
    setGovFee('');
    setEditingGovId(null);
  };

  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govName.trim() || !govFee) return;

    setSaving(true);
    try {
      if (editingGovId) {
        // Update existing governorate
        await axiosClient.patch(`/admin/governorates/${editingGovId}`, {
          name: govName.trim(),
          shippingFee: Number(govFee),
        });
        showToast('تم تحديث المحافظة بنجاح', 'success');
      } else {
        // Create new governorate
        await axiosClient.post('/admin/governorates', {
          name: govName.trim(),
          shippingFee: Number(govFee),
          cities: [],
          carrierId: '',
        });
        showToast('تم إضافة المحافظة بنجاح', 'success');
      }
      resetGovForm();
      await loadGovernorates();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'حدث خطأ أثناء العملية';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const startEditGov = (gov: DeliveryGovernorate) => {
    setEditingGovId(gov._id);
    setGovName(gov.name);
    setGovFee(String(gov.shippingFee));
  };

  const deleteGov = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المحافظة؟')) return;
    try {
      await axiosClient.delete(`/admin/governorates/${id}`);
      showToast('تم حذف المحافظة بنجاح', 'success');
      await loadGovernorates();
    } catch (err: any) {
      const message = err.response?.data?.message || 'فشل حذف المحافظة';
      showToast(message, 'error');
    }
  };

  const toggleGovActive = async (gov: DeliveryGovernorate) => {
    try {
      await axiosClient.patch(`/admin/governorates/${gov._id}`, {
        active: !gov.active,
      });
      showToast('تم تحديث حالة المحافظة', 'success');
      await loadGovernorates();
    } catch (err: any) {
      const message = err.response?.data?.message || 'فشل تحديث حالة المحافظة';
      showToast(message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-[#18181B]">خيارات التوصيل وإدارة المحافظات</h2>
          <p className="font-body text-sm text-slate mt-1">إدارة شركات الشحن وتسعير المحافظات ديناميكياً</p>
        </div>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success font-body text-sm"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          تم حفظ الإعدادات بنجاح
        </motion.div>
      )}

      <div className="bg-white shadow-sm rounded-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="w-5 h-5 text-ignition-start" />
          <h3 className="font-heading font-bold text-lg text-[#18181B]">إضافة وإدارة المحافظات</h3>
        </div>

        <form onSubmit={handleGovSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-steel-light/50 rounded-xl">
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">اسم المحافظة</label>
            <input
              type="text"
              value={govName}
              onChange={(e) => setGovName(e.target.value)}
              className={inputClass}
              placeholder="مثال: القاهرة"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">تكلفة الشحن (ج.م)</label>
            <input
              type="number"
              min="0"
              value={govFee}
              onChange={(e) => setGovFee(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={!govName.trim() || !govFee || saving}
              className="flex-1 h-11 rounded-xl gradient-brand text-white font-heading font-bold text-sm hover:shadow-glow transition-shadow disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                editingGovId ? 'تحديث المحافظة' : 'إضافة محافظة'
              )}
            </button>
            {editingGovId && (
              <button
                type="button"
                onClick={resetGovForm}
                className="h-11 px-4 rounded-xl bg-steel-light text-slate font-body text-sm hover:text-[#18181B] transition-colors"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-steel-light">
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">المحافظة</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">تكلفة الشحن</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الحالة</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {governorates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 font-body text-slate">لا توجد محافظات مضافة</td>
                </tr>
              ) : (
                governorates.map((gov) => (
                  <tr key={gov._id} className="border-b border-steel-light/50 last:border-0 hover:bg-steel-light/30 transition-colors">
                    <td className="py-3 px-4 font-body text-sm text-[#18181B] font-medium">{gov.name}</td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">{gov.shippingFee.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleGovActive(gov)}
                        className={`px-2.5 py-1 rounded-full text-xs font-body font-medium transition-colors ${
                          gov.active ? 'bg-success/10 text-success' : 'bg-steel-light text-slate'
                        }`}
                      >
                        {gov.active ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditGov(gov)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-ignition-start font-body text-xs font-medium hover:bg-ignition-start/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGov(gov._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-error font-body text-xs font-medium hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
