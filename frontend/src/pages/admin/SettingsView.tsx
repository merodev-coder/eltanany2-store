import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, Save, Loader2, Check, AlertCircle } from 'lucide-react';
import axiosClient from '@/api/apiClient';

/**
 * تمت معالجة المشكلة الجذرية:
 * 1. استبدال شرط `!response.ok` بفحص دقيق لـ `response.status` لأن مكتبة Axios لا تدعم `.ok` تلقائياً مثل fetch API.
 * 2. الحفاظ على الـ Generation Counter لمنع تضارب طلبات التثبيت المتكررة في StrictMode.
 * 3. ضمان تحديث حالات التحميل (Loading / Saving) داخل كتلة catch و finally دائماً لمنع تجمد الواجهة.
 */
export default function SettingsView() {
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState('');
  const [instaPayAccount, setInstaPayAccount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // العداد الجيلي لمنع السباق البياناتي (Race Conditions)
  const generationRef = useRef(0);

  const fetchSettings = useCallback(async () => {
    const runId = ++generationRef.current;

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await axiosClient.get('/admin/settings/payment');

      // إلغاء التحديث إذا تجاوز هذا الطلب طلب أحدث منه
      if (runId !== generationRef.current) return;

      // التصحيح الأساسي: التحقق من كود الحالة لـ Axios بدلاً من response.ok
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          (response.data as any)?.message || `خطأ في الخادم (${response.status})`
        );
      }

      if (response.data?.success && response.data?.data) {
        setVodafoneCashNumber(response.data.data.vodafoneCashNumber || '');
        setInstaPayAccount(response.data.data.instaPayAccount || '');
      } else {
        throw new Error(response.data?.message || 'استجابة غير متوقعة من الخادم');
      }
    } catch (err: any) {
      if (runId !== generationRef.current) return;
      const msg = err?.response?.data?.message || err?.message || 'فشل تحميل الإعدادات';
      setFetchError(msg);
      setVodafoneCashNumber('');
      setInstaPayAccount('');
    } finally {
      if (runId === generationRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setFetchError(null);

    try {
      const response = await axiosClient.post('/admin/settings/payment', {
        vodafoneCashNumber,
        instaPayAccount,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          (response.data as any)?.message || `خطأ أثناء الحفظ (${response.status})`
        );
      }

      if (response.data?.success) {
        setSuccessMessage('تم حفظ الإعدادات بنجاح');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        throw new Error(response.data?.message || 'فشل حفظ الإعدادات');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'فشل حفظ الإعدادات';
      setFetchError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">إعدادات الدفع</h2>
        <p className="font-body text-sm text-slate mt-1">إدارة طرق الدفع المتاحة للعملاء</p>
      </div>

      {fetchError && !isLoading && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <div>
            <p className="font-body text-sm text-error font-medium">تعذَّر تحميل الإعدادات</p>
            <p className="font-body text-xs text-slate mt-0.5">{fetchError}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-card p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-ignition-start" />
              <h3 className="font-heading font-bold text-lg text-[#18181B]">طرق الدفع</h3>
            </div>

            {/* Vodafone Cash */}
            <div>
              <label className="block font-body text-sm font-medium text-[#18181B] mb-2">
                رقم Vodafone Cash
              </label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-red-500" />
                </div>
                <input
                  type="text"
                  value={vodafoneCashNumber}
                  onChange={(e) => setVodafoneCashNumber(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="flex-1 h-12 px-4 rounded-xl bg-steel-light/50 border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate mt-1 font-body">
                سيتم عرض هذا الرقم للعملاء عند اختيار الدفع عبر Vodafone Cash
              </p>
            </div>

            {/* InstaPay */}
            <div>
              <label className="block font-body text-sm font-medium text-[#18181B] mb-2">
                حساب InstaPay
              </label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-sky-500" />
                </div>
                <input
                  type="text"
                  value={instaPayAccount}
                  onChange={(e) => setInstaPayAccount(e.target.value)}
                  placeholder="مثال: @eltanany"
                  className="flex-1 h-12 px-4 rounded-xl bg-steel-light/50 border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate mt-1 font-body">
                سيتم عرض هذا الحساب للعملاء عند اختيار الدفع عبر InstaPay
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="h-12 px-6 rounded-xl gradient-brand text-white font-heading font-bold flex items-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-70 disabled:cursor-wait"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ الإعدادات
              </button>
              {successMessage && (
                <div className="flex items-center gap-1 text-success font-body text-sm">
                  <Check className="w-4 h-4" />
                  {successMessage}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}