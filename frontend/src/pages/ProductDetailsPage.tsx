import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById, getRelatedProducts } from '@/services/mockApi';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';
import ProductCard from '@/components/ui-custom/ProductCard';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const p = await getProductById(id);
      setProduct(p || null);
      if (p) {
        setSelectedColor(p.colors?.[0]);
        const r = await getRelatedProducts(id, p.category);
        setRelated(r);
      }
      setLoading(false);
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedColor);
    setAdded(true);
    showToast('تم إضافة المنتج للسلة');
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product?.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const scrollRelated = (dir: 'left' | 'right') => {
    const el = document.getElementById('related-scroll');
    if (el) el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-steel-light rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-steel-light rounded w-1/4" />
            <div className="h-8 bg-steel-light rounded" />
            <div className="h-4 bg-steel-light rounded w-1/2" />
            <div className="h-10 bg-steel-light rounded w-1/3" />
            <div className="h-32 bg-steel-light rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-7xl mx-auto px-4">
        <p className="font-heading font-bold text-2xl text-ink mb-4">المنتج غير موجود</p>
        <Link to="/laptops" className="text-ignition-start font-body hover:underline">العودة لللابتوبات</Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6 text-sm font-body text-slate">
          <Link to="/" className="hover:text-ignition-start transition-colors">الرئيسية</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={product.category === 'laptop' ? '/laptops' : '/accessories'} className="hover:text-ignition-start transition-colors">
            {product.category === 'laptop' ? 'لابتوبات' : 'إكسسوارات'}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-card mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors duration-200 ${
                      idx === selectedImage ? 'border-ignition-start' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="font-body text-sm text-slate mb-1">{product.brand}</p>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-ignition-end" fill="currentColor" />
                <span className="font-body text-sm text-ink font-medium">{product.rating}</span>
              </div>
              <span className="font-body text-sm text-slate">({product.reviewCount} تقييم)</span>
              {product.stock > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-body font-medium">متوفر</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-error/10 text-error text-xs font-body font-medium">نفذت الكمية</span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-heading font-black text-3xl text-ink">{product.price.toLocaleString()} ج.م</span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-slate line-through">{product.oldPrice.toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-error/10 text-error text-sm font-bold">-{discount}%</span>
                </>
              )}
            </div>

            <p className="font-body text-ink/80 leading-relaxed mb-6">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="font-heading font-bold text-sm text-ink mb-2">اللون: {selectedColor}</p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 font-body text-sm transition-colors duration-200 ${
                        selectedColor === color
                          ? 'border-ignition-start text-ignition-start bg-ignition-start/5'
                          : 'border-steel-light text-ink/70 hover:border-steel-dark'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-xl font-heading font-bold text-lg transition-all duration-200 ${
                  product.stock === 0
                    ? 'bg-steel-light text-slate cursor-not-allowed'
                    : added
                      ? 'bg-success text-white'
                      : 'gradient-brand text-white hover:shadow-glow'
                }`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> تم الإضافة</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> أضف للسلة</>
                )}
              </button>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-heading font-bold text-lg text-ink mb-4">المواصفات</h3>
                <div className="divide-y divide-steel-light">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <span className="font-body text-sm text-slate">{key}</span>
                      <span className="font-body text-sm text-ink font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-xl text-ink">منتجات مشابهة</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollRelated('right')} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => scrollRelated('left')} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div id="related-scroll" className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {related.map((p, i) => (
                <div key={p.id} className="w-[280px] sm:w-[300px] flex-shrink-0 snap-start">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
