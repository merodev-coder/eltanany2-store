// frontend/src/pages/CheckoutPage.tsx
// Checkout with conditional عربون receipt upload.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Package, Check, ChevronLeft, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import axiosClient from '@/api/axiosClient';
import ReceiptUploader from '@/components/checkout/ReceiptUploader';

// ── Types ──────────────────────────────────────────────
interface Governorate {
  _id: string;
  name: string;
  shippingFee: number;
}

interface CartItemForOrder {
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  color?: string;
}

const steps = [
  { id: 'info', label: 'البيانات', icon: MapPin },
  { id: 'delivery', label: 'التوصيل', icon: Package },
  { id: 'payment', label: 'الدفع', icon: CreditCard },
  { id: 'confirm', label: 'التأكيد', icon: Check },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    governorate: '',
    city: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home');
  const [loading, setLoading] = useState(false);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(true);

  // Receipt state
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  // ── Load governorates ──────────────────────────
  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const response = await axiosClient.get('/public/governorates');
        if (response.data.success && response.data.data.governorates) {
          setGovernorates(response.data.data.governorates);
        }
      } catch (err) {
        console.warn('Failed to load governorates', err);
      } finally {
        setGovernoratesLoading(false);
      }
    };
    fetchGovernorates();
  }, []);

  // ── Prefill user data if authenticated ──
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  // ── Derived values ──────────────────────────────
  const selectedGovernorate = useMemo(() => {
    return governorates.find((g) => g.name === formData.governorate);
  }, [governorates, formData.governorate]);

  const shippingCost = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    return selectedGovernorate?.shippingFee || 0;
  }, [deliveryMethod, selectedGovernorate]);

  const depositAmount = shippingCost; // Deposit = shipping cost (عربون)
  const finalTotal = totalPrice + shippingCost;
  const totalWithDeposit = totalPrice + depositAmount;

  // ── Form helpers ────────────────────────────────
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!(
          formData.name.trim() &&
          formData.phone.trim() &&
          formData.governorate &&
          formData.city.trim() &&
          formData.address.trim()
        );
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  // ── Receipt upload callbacks ─────────────────────
  const handleUploadComplete = (url: string) => {
    setReceiptUrl(url);
  };

  const handleUploadError = (err: Error) => {
    showToast(err.message || 'فشل رفع صورة العربون', 'error');
  };

  const handleReceiptRemove = () => {
    setReceiptUrl(null);
  };

  // ── Submit order ───────────────────────────────
  const submitOrder = async () => {
    // Validate receipt is uploaded for home delivery
    if (deliveryMethod === 'home' && !receiptUrl) {
      showToast('يجب رفع صورة العربون قبل إتمام الطلب', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderItems: CartItemForOrder[] = items.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        qty: item.quantity,
        imageUrl: item.product.images[0] || '',
        color: item.color,
      }));

      const payload = {
        items: orderItems,
        customerName: formData.name,
        customerPhone: formData.phone,
        governorate: formData.governorate,
        city: formData.city,
        address: formData.address,
        landmark: formData.landmark,
        deliveryMethod,
        paymentMethod: 'cod' as const,
        shippingCost,
        depositAmount,
        totalAmount: totalWithDeposit,
        depositSlipUrl: receiptUrl || undefined,
        notes: '',
      };

      const response = await axiosClient.post('/users/orders', payload);

      if (response.data.success) {
        clearCart();
        const orderId = response.data.data.order?._id || response.data.data.order?.id;
        if (orderId) {
          navigate(`/order-confirmation/${orderId}`);
        } else {
          navigate('/order-confirmation/success');
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى';
      showToast(message, 'error');
      console.error('Order submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Redirect if empty cart ──────────────────
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const inputClass =
    'w-full h-12 px-4 rounded-xl bg-white border border-steel-light font-body text-ink placeholder:text-slate outline-none focus:border-ignition-start focus:ring-2 focus:ring-ignition-start/20 transition-all duration-200';
  const labelClass = 'block font-body text-sm font-medium text-ink mb-1.5';

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-8 text-center">
          إتمام الطلب
        </h1>

        {/* ── Steps ── */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-steel-light -translate-y-1/2" />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? 'bg-success text-white'
                      : isActive
                      ? 'gradient-brand text-white shadow-glow'
                      : 'bg-steel-light text-slate'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`font-body text-xs ${
                    isActive || isDone ? 'text-ink font-medium' : 'text-slate'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-card p-6 sm:p-8"
          >
            {/* ── Step 0: Customer Info ── */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className="font-heading font-bold text-lg text-ink mb-4">
                  بيانات التوصيل
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>الاسم الكامل *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={inputClass}
                      placeholder="محمد أحمد"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className={inputClass}
                      placeholder="01234567890"
                      dir="ltr"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>المحافظة *</label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => updateField('governorate', e.target.value)}
                      className={inputClass}
                      disabled={governoratesLoading}
                    >
                      <option value="">اختر المحافظة</option>
                      {governorates.map((g) => (
                        <option key={g._id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    {governoratesLoading && (
                      <p className="text-xs text-slate mt-1 font-body">جاري تحميل المحافظات...</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>المدينة *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={inputClass}
                      placeholder="مدينة نصر"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>العنوان التفصيلي *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className={inputClass}
                      placeholder="شارع ...، عمارة ...، شقة ..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>علامة مميزة (اختياري)</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => updateField('landmark', e.target.value)}
                      className={inputClass}
                      placeholder="بجوار ...، أمام ..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Delivery Method ── */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-heading font-bold text-lg text-ink mb-4">
                  طريقة التوصيل
                </h2>
                <div className="space-y-3">
                  {/* Home Delivery */}
                  <button
                    onClick={() => setDeliveryMethod('home')}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-right transition-all duration-200 ${
                      deliveryMethod === 'home'
                        ? 'border-ignition-start bg-ignition-start/5'
                        : 'border-steel-light hover:border-steel-dark'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        deliveryMethod === 'home' ? 'border-ignition-start' : 'border-steel-dark'
                      }`}
                    >
                      {deliveryMethod === 'home' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-ignition-start" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-bold text-ink">توصيل للمنزل</p>
                      <p className="font-body text-sm text-slate">التوصيل خلال 2-5 أيام عمل</p>
                    </div>
                    <span className="font-heading font-bold text-ink">
                      {shippingCost > 0 ? `${shippingCost} ج.م` : 'مجاني'}
                    </span>
                  </button>

                  {/* Store Pickup */}
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-right transition-all duration-200 ${
                      deliveryMethod === 'pickup'
                        ? 'border-ignition-start bg-ignition-start/5'
                        : 'border-steel-light hover:border-steel-dark'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        deliveryMethod === 'pickup'
                          ? 'border-ignition-start'
                          : 'border-steel-dark'
                      }`}
                    >
                      {deliveryMethod === 'pickup' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-ignition-start" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-bold text-ink">استلام من المتجر</p>
                      <p className="font-body text-sm text-slate">القاهرة، مصر</p>
                    </div>
                    <span className="font-heading font-bold text-success">مجاني</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-heading font-bold text-lg text-ink mb-4">
                  طريقة الدفع
                </h2>

                {/* COD Only */}
                <div className="p-5 rounded-xl border-2 border-ignition-start bg-ignition-start/5">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-2 border-ignition-start flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-ignition-start" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-ink">الدفع عند الاستلام</p>
                      <p className="font-body text-sm text-slate">ادفع لما تستلم الطلب</p>
                    </div>
                  </div>
                </div>

                {/* Deposit Notice */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Receipt className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-heading font-bold text-amber-800 mb-1">
                        العربون المطلوب (Deposit)
                      </p>
                      <p className="font-body text-sm text-amber-700">
                        يتم دفع مبلغ العربون عند التوصيل ويساوي تكلفة الشحن:
                        <span className="font-bold text-amber-900 inline-block mt-1">
                          {depositAmount} ج.م
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload (only for home delivery) */}
                {deliveryMethod === 'home' && (
                  <div className="mt-6">
                    <h3 className="font-heading font-bold text-sm text-ink mb-3">
                      صورة العربون (مطلوبة)
                    </h3>
                    <ReceiptUploader
                      onUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                      onRemove={handleReceiptRemove}
                    />
                    {!receiptUrl && (
                      <p className="text-amber-600 text-xs font-body mt-2">
                        يجب رفع صورة العربون قبل إتمام الطلب
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 p-4 rounded-xl bg-steel-light/50">
                  <p className="font-body text-sm text-slate text-center">
                    وسائل دفع إلكترونية قريباً
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-heading font-bold text-lg text-ink mb-4">تأكيد الطلب</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-steel-light/50">
                    <p className="font-body text-sm text-slate mb-1">الاسم</p>
                    <p className="font-body text-ink font-medium">{formData.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-steel-light/50">
                    <p className="font-body text-sm text-slate mb-1">العنوان</p>
                    <p className="font-body text-ink font-medium">
                      {formData.governorate}، {formData.city}، {formData.address}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-steel-light/50">
                    <p className="font-body text-sm text-slate mb-1">التوصيل</p>
                    <p className="font-body text-ink font-medium">
                      {deliveryMethod === 'home' ? 'توصيل للمنزل' : 'استلام من المتجر'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-steel-light pt-4 space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-slate">المجموع</span>
                    <span className="text-ink">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-slate">الشحن</span>
                    <span className="text-ink">
                      {shippingCost === 0 ? 'مجاني' : `${shippingCost} ج.م`}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-sm bg-amber-50 p-2 rounded-lg">
                    <span className="text-amber-700">العربون (Deposit)</span>
                    <span className="text-amber-900 font-medium">{depositAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-2">
                    <span>الإجمالي</span>
                    <span>{totalWithDeposit.toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 h-12 rounded-xl border-2 border-steel-light text-ink font-body font-medium hover:border-ignition-start transition-colors duration-200"
                >
                  رجوع
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className={`flex-[2] h-12 rounded-xl font-heading font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    canProceed()
                      ? 'gradient-brand text-white hover:shadow-glow'
                      : 'bg-steel-light text-slate cursor-not-allowed'
                  }`}
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitOrder}
                  disabled={loading}
                  className="flex-[2] h-12 rounded-xl gradient-brand text-white font-heading font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-shadow duration-300 disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>تأكيد الطلب</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
