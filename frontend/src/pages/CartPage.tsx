import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  if (totalItems === 0) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-steel-light flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-slate" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-ink mb-3">السلة فاضية</h1>
          <p className="font-body text-slate mb-6">ابدأ التسوق واكتشف منتجات رائعة</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/laptops"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              تصفح اللابتوبات
            </Link>
            <Link
              to="/accessories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-ink font-heading font-bold shadow-sm hover:shadow-md transition-shadow"
            >
              تصفح الإكسسوارات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-8">
          سلة التسوق ({totalItems})
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item, idx) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-card p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <Link to={`/product/${item.product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-steel-light">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${item.product.id}`} className="font-heading font-bold text-sm sm:text-base text-ink hover:text-ignition-start transition-colors line-clamp-1">
                          {item.product.name}
                        </Link>
                        <p className="font-body text-xs text-slate mt-0.5">{item.product.brand}</p>
                        {item.color && <p className="font-body text-xs text-slate">اللون: {item.color}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 rounded-lg hover:bg-error/10 text-slate hover:text-error transition-colors flex-shrink-0"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-steel-light rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white transition-colors"
                          aria-label="نقص"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-body text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white transition-colors"
                          aria-label="زيادة"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-heading font-bold text-base text-ink">
                        {(item.product.price * item.quantity).toLocaleString()} ج.م
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
              <h2 className="font-heading font-bold text-lg text-ink mb-5">ملخص الطلب</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-slate">المجموع الفرعي</span>
                  <span className="text-ink font-medium">{totalPrice.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-slate">الشحن</span>
                  <span className="text-success font-medium">مجاني</span>
                </div>
                <div className="border-t border-steel-light pt-3 flex justify-between">
                  <span className="font-heading font-bold text-ink">الإجمالي</span>
                  <span className="font-heading font-black text-xl text-ink">{totalPrice.toLocaleString()} ج.م</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full h-14 rounded-xl gradient-brand text-white font-heading font-bold text-lg hover:shadow-glow transition-shadow duration-300"
              >
                أكمل الطلب
              </Link>
              <Link
                to="/laptops"
                className="flex items-center justify-center gap-2 w-full h-12 mt-3 rounded-xl border-2 border-steel-light text-ink font-body font-medium hover:border-ignition-start hover:text-ignition-start transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                أكمل التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
