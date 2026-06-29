import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ui-custom/ProductCard';
import { getAllAccessories, filterAccessories } from '@/services/mockApi';
import type { Product } from '@/types';

const subcategories = [
  { id: 'mouse', name: 'ماوس' },
  { id: 'keyboard', name: 'كيبورد' },
  { id: 'headset', name: 'سماعات' },
];

export default function AccessoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<string>(() => searchParams.get('sub') || '');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = activeSub ? await filterAccessories(activeSub) : await getAllAccessories();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, [activeSub]);

  const setSub = (sub: string) => {
    setActiveSub(sub);
    if (sub) setSearchParams({ sub });
    else setSearchParams({});
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">إكسسوارات</h1>
          <p className="font-body text-slate">ماوس، كيبورد، سماعات وكل ما يكمل إعدادك</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 font-body text-sm text-ink"
          >
            <SlidersHorizontal className="w-4 h-4" />
            فلترة
            {activeSub && (
              <span className="w-5 h-5 rounded-full gradient-brand text-white text-xs flex items-center justify-center font-bold">1</span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <span className="font-body text-sm text-slate hidden sm:inline">{sortedProducts.length} منتج</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white shadow-sm border-0 font-body text-sm text-ink outline-none focus:ring-2 focus:ring-ignition-start/30 cursor-pointer"
            >
              <option value="default">الافتراضي</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        </div>

        {activeSub && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ignition-start/10 text-ignition-start text-xs font-body">
              {subcategories.find(s => s.id === activeSub)?.name}
              <button onClick={() => setSub('')}><X className="w-3 h-3" /></button>
            </span>
          </div>
        )}

        <div className="flex gap-6">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-card p-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base text-ink">الفئات</h3>
                <button onClick={() => setFiltersOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSub('')}
                  className={`w-full text-right px-3 py-2.5 rounded-lg font-body text-sm transition-colors duration-150 ${
                    !activeSub ? 'bg-ignition-start/10 text-ignition-start font-medium' : 'text-ink/70 hover:bg-steel-light'
                  }`}
                >
                  الكل
                </button>
                {subcategories.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSub(sub.id)}
                    className={`w-full text-right px-3 py-2.5 rounded-lg font-body text-sm transition-colors duration-150 ${
                      activeSub === sub.id ? 'bg-ignition-start/10 text-ignition-start font-medium' : 'text-ink/70 hover:bg-steel-light'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                    <div className="aspect-square bg-steel-light" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-steel-light rounded w-1/3" />
                      <div className="h-4 bg-steel-light rounded" />
                      <div className="h-4 bg-steel-light rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-heading font-bold text-xl text-ink mb-2">لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i % 8} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
