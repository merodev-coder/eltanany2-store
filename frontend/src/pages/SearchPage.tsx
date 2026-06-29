import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { searchProducts } from '@/services/mockApi';
import type { Product } from '@/types';
import ProductCard from '@/components/ui-custom/ProductCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await searchProducts(query);
      setResults(data);
      setLoading(false);
    };
    load();
    setLocalQuery(query);
  }, [query]);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <form onSubmit={e => { e.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(localQuery)}`; }} className="relative max-w-xl mb-6">
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="ابحث عن منتج، ماركة، أو فئة..."
              className="w-full h-14 pr-14 pl-4 rounded-xl bg-white shadow-sm border-0 font-body text-ink placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30 transition-all duration-200"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
          </form>

          <h1 className="font-heading font-bold text-2xl text-ink">
            {query ? `نتائج البحث: "${query}"` : 'البحث'}
          </h1>
          {!loading && query && (
            <p className="font-body text-slate mt-1">{results.length} نتيجة</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-[4/3] bg-steel-light" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-steel-light rounded w-1/3" />
                  <div className="h-4 bg-steel-light rounded" />
                  <div className="h-4 bg-steel-light rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 && query ? (
          <div className="text-center py-16">
            <p className="font-heading font-bold text-xl text-ink mb-3">لا توجد نتائج</p>
            <p className="font-body text-slate mb-6">جرب كلمات مختلفة أو تصفح الفئات</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/laptops" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-heading font-bold">
                <ArrowLeft className="w-4 h-4" />
                اللابتوبات
              </Link>
              <Link to="/accessories" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-ink font-heading font-bold shadow-sm">
                الإكسسوارات
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i % 8} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
