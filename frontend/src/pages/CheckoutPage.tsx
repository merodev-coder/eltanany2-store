// frontend/src/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  MapPin,
  Phone,
  User,
  Truck,
  Store,
  Upload,
  Loader2,
  ShoppingCart,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getGovernorates } from '@/services/api';
import axiosClient from '@/api/apiClient';
import type { Governorate } from '@/types';
import { UploadButton } from '@/components/ui/uploadthing';

// ── Steps ─────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'بيانات العميل' },
  { id: 2, label: 'التوصيل والدفع' },
  { id: 3, label: 'مراجعة الطلب' },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<{ vodafoneCashNumber: string; instaPayAccount: string }>({ vodafoneCashNumber: '', instaPayAccount: '' });
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Step 1: Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    notes: '',
  });

  // Step 2: Delivery & Payment
  const [deliveryType, setDeliveryType] = useState<'shipping' | 'pickup'>('shipping');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'vodafone_cash' | 'instapay'>('vodafone_cash');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Fetch governorates and payment settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [govs, settingsRes] = await Promise.all([
          getGovernorates(),
          axiosClient.get('/public/settings'),
        ]);
        setGovernorates(govs);
        if (settingsRes.data.success && settingsRes.data.data) {
          setPaymentSettings({
            vodafoneCashNumber: settingsRes.data.data.vodafoneCashNumber || '01000000000',
            instaPayAccount: settingsRes.data.data.instaPayAccount || '@username',
          });
        }
      } catch (err) {
        console.warn('Failed to load checkout data:', err);
        // Set fallback values
        setPaymentSettings({
          vodafoneCashNumber: '01000000000',
          instaPayAccount: '@username',
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, []);

  // Calculate shipping cost
  const shippingCost =
    deliveryType === 'pickup'
      ? 0
      : governorates.find((g) => g._id === selectedGovernorate)?.shippingFee || 0;

  const finalTotal = totalPrice + shippingCost;

  // ── Validation ────────────────────────────────────────
  const canProceedStep1 =
    customerInfo.name.trim().length >= 2 &&
    customerInfo.phone.trim().length >= 8;

  const canProceedStep2 =
    deliveryType === 'pickup' || (deliveryType === 'shipping' && selectedGovernorate !== '');

  const canSubmit = deliveryType === 'pickup'
    ? canProceedStep1 && canProceedStep2
    : canProceedStep1 && canProceedStep2 && receiptUrl !== null;

  // ── Handlers ─────────────────────────────────────────
  const handleUploadComplete = (res: any) => {
    const uploadedFile = res[0];
    if (uploadedFile?.ufsUrl) {
      setReceiptUrl(uploadedFile.ufsUrl);
      setReceiptPreview(uploadedFile.ufsUrl);
      showToast('تم رفع الإيصال بنجاح');
    }
  };

  const handleUploadError = (error: Error) => {
    showToast('فشل رفع الإيصال: ' + error.message);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast('يرجى إكمال جميع البيانات' + (deliveryType === 'shipping' ? ' ورفع إيصال الدفع' : ''));
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: customerInfo.name.trim(),
        customerPhone: customerInfo.phone.trim(),
        customerAddress: deliveryType === 'shipping' ? customerInfo.address.trim() : '',
        notes: customerInfo.notes.trim(),
        deliveryType,
        governorate: deliveryType === 'shipping' ? selectedGovernorate : '',
        shippingCost: String(shippingCost),
        paymentMethod: deliveryType === 'pickup' ? null : paymentMethod,
        subtotal: String(totalPrice),
        receiptUrl: deliveryType === 'pickup' ? null : receiptUrl,
        items: JSON.stringify(items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          qty: item.quantity,
          imageUrl: item.product.images[0] || '',
          color: item.color,
        }))),
      };

      const response = await axiosClient.post('/users/orders', orderData);

      if (response.data.success) {
        clearCart();
        navigate(`/order-confirmation/${response.data.data.order._id || response.data.data.order.orderNumber}`);
      } else {
        showToast(response.data.message || 'فشل إنشاء الطلب');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  // ── Empty Cart ───────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-steel-light flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-slate" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-ink mb-3">السلة فاضية</h1>
          <p className="font-body text-slate mb-6">أضف منتجات للسلة قبل إتمام الطلب</p>
          <Link
            to="/laptops"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow"
          >
            <ChevronLeft className="w-4 h-4" />
            تصفح اللابتوبات
          </Link>
        </div>
      </div>
    );
  }

  // ── Step Indicator ───────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm transition-all duration-300 ${
                step >= s.id
                  ? 'gradient-brand text-white shadow-glow'
                  : 'bg-steel-light text-slate'
              }`}
            >
              {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
            </div>
            <span
              className={`text-xs font-body mt-1.5 hidden sm:block ${
                step >= s.id ? 'text-ink font-medium' : 'text-slate'
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 rounded-full transition-colors duration-300 ${
                step > s.id ? 'bg-ignition-start' : 'bg-steel-light'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-8 sm:py-12" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/cart"
            className="p-2 rounded-lg hover:bg-steel-light transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-slate" />
          </Link>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink">إتمام الطلب</h1>
        </div>

        <StepIndicator />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Customer Info ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl shadow-card p-6 space-y-5"
                >
                  <h2 className="font-heading font-bold text-lg text-ink mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-ignition-start" />
                    بيانات العميل
                  </h2>

                  <div>
                    <label className="block text-sm font-body text-slate mb-1.5">
                      الاسم الكامل <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full h-12 px-4 rounded-xl bg-steel-light border border-transparent focus:border-ignition-start focus:bg-white transition-colors outline-none font-body text-ink"
                      placeholder="محمد أحمد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body text-slate mb-1.5">
                      رقم الهاتف <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full h-12 px-4 rounded-xl bg-steel-light border border-transparent focus:border-ignition-start focus:bg-white transition-colors outline-none font-body text-ink"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body text-slate mb-1.5">
                      العنوان بالتفصيل
                    </label>
                    <textarea
                      rows={3}
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-steel-light border border-transparent focus:border-ignition-start focus:bg-white transition-colors outline-none font-body text-ink resize-none"
                      placeholder="المدينة، الحي، الشارع، رقم العمارة..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-body text-slate mb-1.5">
                      ملاحظات (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      value={customerInfo.notes}
                      onChange={(e) =>
                        setCustomerInfo((p) => ({ ...p, notes: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-steel-light border border-transparent focus:border-ignition-start focus:bg-white transition-colors outline-none font-body text-ink resize-none"
                      placeholder="أي تعليمات خاصة بالطلب..."
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="flex items-center justify-center gap-2 w-full h-14 rounded-xl gradient-brand text-white font-heading font-bold text-lg hover:shadow-glow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2: Delivery & Payment ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* Delivery Type */}
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-heading font-bold text-lg text-ink mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-ignition-start" />
                      طريقة الاستلام
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setDeliveryType('shipping')}
                        className={`p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                          deliveryType === 'shipping'
                            ? 'border-ignition-start bg-ignition-start/5'
                            : 'border-steel-light hover:border-slate/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Truck
                            className={`w-5 h-5 ${
                              deliveryType === 'shipping' ? 'text-ignition-start' : 'text-slate'
                            }`}
                          />
                          <span className="font-heading font-bold text-ink">شحن للمحافظة</span>
                        </div>
                        <p className="text-sm font-body text-slate">
                          توصيل لباب البيت مع رسوم شحن حسب المحافظة
                        </p>
                      </button>

                      <button
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                          deliveryType === 'pickup'
                            ? 'border-ignition-start bg-ignition-start/5'
                            : 'border-steel-light hover:border-slate/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Store
                            className={`w-5 h-5 ${
                              deliveryType === 'pickup' ? 'text-ignition-start' : 'text-slate'
                            }`}
                          />
                          <span className="font-heading font-bold text-ink">استلام من الفرع</span>
                        </div>
                        <p className="text-sm font-body text-slate">
                          استلم طلبك بنفسك من مقرنا بدون رسوم إضافية
                        </p>
                      </button>
                    </div>

                    {/* Governorate Selector */}
                    <AnimatePresence>
                      {deliveryType === 'shipping' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-steel-light">
                            <label className="block text-sm font-body text-slate mb-1.5">
                              المحافظة <span className="text-error">*</span>
                            </label>
                            {settingsLoading ? (
                              <div className="h-12 rounded-xl bg-steel-light animate-pulse" />
                            ) : (
                              <select
                                value={selectedGovernorate}
                                onChange={(e) => setSelectedGovernorate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-steel-light border border-transparent focus:border-ignition-start focus:bg-white transition-colors outline-none font-body text-ink"
                              >
                                <option value="">اختر المحافظة</option>
                                {governorates.map((g) => (
                                  <option key={g._id} value={g._id}>
                                    {g.name} — {g.shippingFee.toLocaleString()} ج.م
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Payment Method - Only show for shipping */}
                  {deliveryType === 'shipping' && (
                    <div className="bg-white rounded-2xl shadow-card p-6">
                      <h2 className="font-heading font-bold text-lg text-ink mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-ignition-start" />
                        طريقة الدفع
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <button
                          onClick={() => setPaymentMethod('vodafone_cash')}
                          className={`p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                            paymentMethod === 'vodafone_cash'
                              ? 'border-ignition-start bg-ignition-start/5'
                              : 'border-steel-light hover:border-slate/50'
                          }`}
                        >
                          <span className="font-heading font-bold text-ink">Vodafone Cash</span>
                          <p className="text-sm font-body text-slate mt-1">
                            تحويل عبر محفظة فودافون كاش
                          </p>
                        </button>

                        <button
                          onClick={() => setPaymentMethod('instapay')}
                          className={`p-4 rounded-xl border-2 text-right transition-all duration-200 ${
                            paymentMethod === 'instapay'
                              ? 'border-ignition-start bg-ignition-start/5'
                              : 'border-steel-light hover:border-slate/50'
                          }`}
                        >
                          <span className="font-heading font-bold text-ink">InstaPay</span>
                          <p className="text-sm font-body text-slate mt-1">
                            تحويل عبر إنستاباي
                          </p>
                        </button>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-steel-light/50 rounded-xl p-4">
                        {paymentMethod === 'vodafone_cash' && (
                          <div>
                            <p className="font-body text-sm text-slate mb-1">رقم Vodafone Cash للتحويل:</p>
                            <p className="font-heading font-bold text-ink text-lg dir-ltr" dir="ltr">
                              {paymentSettings.vodafoneCashNumber}
                            </p>
                          </div>
                        )}
                        {paymentMethod === 'instapay' && (
                          <div>
                            <p className="font-body text-sm text-slate mb-1">عنوان InstaPay للتحويل:</p>
                            <p className="font-heading font-bold text-ink text-lg dir-ltr" dir="ltr">
                              {paymentSettings.instaPayAccount}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Receipt Upload */}
                      <div className="mt-5">
                        <label className="block text-sm font-body text-slate mb-2">
                          إيصال التحويل <span className="text-error">*</span>
                        </label>

                        {!receiptPreview ? (
                          <UploadButton
                            endpoint="receiptUploader"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                            appearance={{
                              button: "w-full h-32 rounded-xl border-2 border-dashed border-steel-light hover:border-ignition-start transition-colors flex flex-col items-center justify-center gap-2 bg-transparent",
                              allowedContent: "text-xs text-slate/60",
                            }}
                            content={{
                              button({ isUploading }: { isUploading: boolean }) {
                                if (isUploading) {
                                  return (
                                    <div className="flex flex-col items-center gap-2">
                                      <Loader2 className="w-8 h-8 text-slate animate-spin" />
                                      <span className="font-body text-sm text-slate">جاري الرفع...</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-slate" />
                                    <span className="font-body text-sm text-sl">
                                      اضغط لرفع صورة إيصال التحويل
                                    </span>
                                    <span className="text-xs text-slate/60">PNG, JPG حتى 4MB</span>
                                  </div>
                                );
                              },
                            }}
                          />
                        ) : (
                          <div className="relative rounded-xl overflow-hidden border border-steel-light">
                            <img
                              src={receiptPreview}
                              alt="إيصال التحويل"
                              className="w-full max-h-64 object-contain bg-steel-light/20"
                            />
                            <button
                              onClick={() => {
                                setReceiptUrl(null);
                                setReceiptPreview(null);
                              }}
                              className="absolute top-2 left-2 p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 h-14 rounded-xl border-2 border-steel-light text-ink font-heading font-bold hover:border-ignition-start hover:text-ignition-start transition-colors"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 h-14 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                      <ChevronRightIcon className="w-5 h-5 inline-block mr-1" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Review & Submit ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <h2 className="font-heading font-bold text-lg text-ink mb-4">
                      مراجعة الطلب
                    </h2>

                    {/* Customer Summary */}
                    <div className="bg-steel-light/30 rounded-xl p-4 space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate" />
                        <span className="font-body text-sm text-ink">{customerInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate" />
                        <span className="font-body text-sm text-ink" dir="ltr">
                          {customerInfo.phone}
                        </span>
                      </div>
                      {deliveryType === 'shipping' && customerInfo.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate" />
                          <span className="font-body text-sm text-ink">{customerInfo.address}</span>
                        </div>
                      )}
                      {deliveryType === 'shipping' && selectedGovernorate && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate" />
                          <span className="font-body text-sm text-ink">
                            {governorates.find((g) => g._id === selectedGovernorate)?.name}
                          </span>
                        </div>
                      )}
                      {deliveryType === 'shipping' && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate" />
                          <span className="font-body text-sm text-ink">
                            {paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'InstaPay'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {items.map((item) => (
                        <div
                          key={item.product._id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-steel-light/20"
                        >
                          <div className="w-14 h-14 rounded-lg bg-steel-light overflow-hidden flex-shrink-0">
                            {item.product.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-ink truncate">
                              {item.product.name}
                            </p>
                            <p className="font-body text-xs text-slate">
                              {item.quantity} × {item.product.price.toLocaleString()} ج.م
                              {item.color && ` — اللون: ${item.color}`}
                            </p>
                          </div>
                          <p className="font-heading font-bold text-sm text-ink">
                            {(item.product.price * item.quantity).toLocaleString()} ج.م
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-steel-light pt-4 space-y-2">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-slate">المجموع الفرعي</span>
                        <span className="text-ink font-medium">
                          {totalPrice.toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-slate">الشحن</span>
                        <span className="text-ink font-medium">
                          {shippingCost === 0 ? 'مجاني' : `${shippingCost.toLocaleString()} ج.م`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-steel-light">
                        <span className="font-heading font-bold text-ink">الإجمالي</span>
                        <span className="font-heading font-black text-xl text-ink">
                          {finalTotal.toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>

                    {/* Receipt Preview - Only show for shipping */}
                    {deliveryType === 'shipping' && receiptPreview && (
                      <div className="mt-4">
                        <p className="font-body text-sm text-slate mb-2">إيصال الدفع:</p>
                        <img
                          src={receiptPreview}
                          alt="إيصال"
                          className="w-full max-h-48 object-contain rounded-xl border border-steel-light bg-steel-light/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 h-14 rounded-xl border-2 border-steel-light text-ink font-heading font-bold hover:border-ignition-start hover:text-ignition-start transition-colors"
                    >
                      السابق
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit || loading}
                      className="flex-[2] h-14 rounded-xl gradient-brand text-white font-heading font-bold text-lg hover:shadow-glow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري إتمام الطلب...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          تأكيد الطلب — {finalTotal.toLocaleString()} ج.م
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-bold text-lg text-ink mb-4">ملخص السلة</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-steel-light overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-ink truncate">{item.product.name}</p>
                      <p className="font-body text-xs text-slate">
                        {item.quantity} × {item.product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-steel-light pt-3 space-y-2">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-slate">المجموع</span>
                  <span className="text-ink font-medium">{totalPrice.toLocaleString()} ج.م</span>
                </div>
                {step >= 2 && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-slate">الشحن</span>
                    <span className="text-ink font-medium">
                      {shippingCost === 0 ? 'مجاني' : `${shippingCost.toLocaleString()} ج.م`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-steel-light">
                  <span className="font-heading font-bold text-ink">الإجمالي</span>
                  <span className="font-heading font-black text-lg text-ink">
                    {finalTotal.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
