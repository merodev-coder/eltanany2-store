import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    showToast('تم إضافة المنتج للسلة');
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-steel-light">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {product.badge && (
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white gradient-brand">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-error text-white text-xs font-bold">
                -{discount}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-warning text-white text-xs font-medium">
                باقي {product.stock} فقط
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-error text-white text-xs font-medium">
                نفذت الكمية
              </span>
            )}
          </div>

          <div className="p-4">
            <p className="text-xs font-body font-medium text-slate mb-1">{product.brand}</p>
            <h3 className="font-heading font-bold text-sm text-ink mb-2 line-clamp-2 group-hover:text-ignition-start transition-colors duration-200">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 text-ignition-end" fill="currentColor" />
              <span className="text-xs font-body text-slate">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-bold text-lg text-ink">
                  {product.price.toLocaleString()} ج.م
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-slate line-through">
                    {product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-steel-light hover:gradient-brand hover:text-white transition-all duration-200"
                  aria-label="أضف للسلة"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
