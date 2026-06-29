import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui-custom/ProductCard';
import { getAllLaptops, filterLaptops, getFilterOptions } from '@/services/mockApi';
import type { Product } from '@/types';

export default function LaptopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true, price: true, category: true, cpu: false, gpu: false, ram: false, storage: false, screen: false, os: false,
  });

  const filterOptions = useMemo(() => getFilterOptions(), []);

  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const b = searchParams.get('brand');
    return b ? b.split(',') : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string[]>(() => {
    const c = searchParams.get('category');
    return c ? c.split(',') : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCpu, setSelectedCpu] = useState<string[]>([]);
  const [selectedGpu, setSelectedGpu] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<string[]>([]);
  const [selectedOs, setSelectedOs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all = await getAllLaptops();
      const filters: Record<string, unknown> = {};
      if (selectedBrands.length) filters.brands = selectedBrands;
      if (selectedCategory.length) filters.categories = selectedCategory;
      if (priceRange[1] < 100000) filters.priceRange = priceRange;
      if (selectedCpu.length) filters.cpu = selectedCpu;
      if (selectedGpu.length) filters.gpu = selectedGpu;
      if (selectedRam.length) filters.ram = selectedRam;
      if (selectedStorage.length) filters.storage = selectedStorage;
      if (selectedScreen.length) filters.screenSize = selectedScreen;
      if (selectedOs.length) filters.os = selectedOs;

      const filtered = Object.keys(filters).length > 0 ? await filterLaptops(filters) : all;
      setProducts(filtered);
      setLoading(false);
    };
    load();
  }, [selectedBrands, selectedCategory, priceRange, selectedCpu, selectedGpu, selectedRam, selectedStorage, selectedScreen, selectedOs]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFilter = (value: string, arr: string[], setArr: (v: string[]) => void) => {
    if (arr.includes(value)) setArr(arr.filter(v => v !== value));
    else setArr([...arr, value]);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategory([]);
    setPriceRange([0, 100000]);
    setSelectedCpu([]);
    setSelectedGpu([]);
    setSelectedRam([]);
    setSelectedStorage([]);
    setSelectedScreen([]);
    setSelectedOs([]);
    setSearchParams({});
  };

  const activeFiltersCount = selectedBrands.length + selectedCategory.length + (priceRange[1] < 100000 ? 1 : 0) +
    selectedCpu.length + selectedGpu.length + selectedRam.length + selectedStorage.length + selectedScreen.length + selectedOs.length;

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest': return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default: return sorted;
    }
  }, [products, sortBy]);

  const checkbox = (label: string, checked: boolean, onChange: () => void, count?: number) => (
    <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
        checked ? 'bg-ignition-start border-ignition-start' : 'border-steel-dark/40 group-hover:border-ignition-start'
      }`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12"><path fill="currentColor" d="M10 3L4.5 8.5 2 6"/></svg>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="font-body text-sm text-ink/80 group-hover:text-ink">{label}</span>
      {count !== undefined && <span className="text-xs text-slate mr-auto">({count})</span>}
    </label>
  );

  const filterSection = (title: string, key: string, content: React.ReactNode) => (
    <div className="border-b border-steel-light last:border-0">
      <button onClick={() => toggleSection(key)} className="flex items-center justify-between w-full py-3">
        <span className="font-heading font-bold text-sm text-ink">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate transition-transform duration-200 ${expandedSections[key] ? 'rotate-180' : ''}`} />
      </button>
      {expandedSections[key] && <div className="pb-3">{content}</div>}
    </div>
  );

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink mb-2">لابتوبات</h1>
          <p className="font-body text-slate">اكتشف تشكيلتنا من أحدث اللابتوبات</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 font-body text-sm text-ink"
          >
            <SlidersHorizontal className="w-4 h-4" />
            فلترة
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full gradient-brand text-white text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
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
              <option value="newest">الأحدث</option>
            </select>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedBrands.map(b => (
              <span key={b} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ignition-start/10 text-ignition-start text-xs font-body">
                {b}
                <button onClick={() => setSelectedBrands(prev => prev.filter(v => v !== b))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedCategory.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ignition-start/10 text-ignition-start text-xs font-body">
                {c === 'gaming' ? 'ألعاب' : 'أعمال'}
                <button onClick={() => setSelectedCategory(prev => prev.filter(v => v !== c))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs font-body text-slate hover:text-error underline">
              مسح الكل
            </button>
          </div>
        )}

        <div className="flex gap-6">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-card p-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base text-ink">الفلاتر</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-body text-slate hover:text-error">
                    مسح الكل
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
              </div>

              {filterSection('الماركة', 'brand',
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filterOptions.brands.map(b => checkbox(b, selectedBrands.includes(b), () => toggleArrayFilter(b, selectedBrands, setSelectedBrands)))}
                </div>
              )}

              {filterSection('الفئة', 'category',
                <div className="space-y-0.5">
                  {['gaming', 'business'].map(c => checkbox(
                    c === 'gaming' ? 'ألعاب' : 'أعمال',
                    selectedCategory.includes(c),
                    () => toggleArrayFilter(c, selectedCategory, setSelectedCategory)
                  ))}
                </div>
              )}

              {filterSection('السعر', 'price',
                <div className="px-1">
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-ignition-start"
                  />
                  <div className="flex justify-between text-xs font-body text-slate mt-1">
                    <span>0 ج.م</span>
                    <span>{priceRange[1].toLocaleString()} ج.م</span>
                  </div>
                </div>
              )}

              {filterSection('المعالج', 'cpu',
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filterOptions.cpus.map(c => checkbox(c, selectedCpu.includes(c), () => toggleArrayFilter(c, selectedCpu, setSelectedCpu)))}
                </div>
              )}

              {filterSection('كرت الشاشة', 'gpu',
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filterOptions.gpus.map(g => checkbox(g, selectedGpu.includes(g), () => toggleArrayFilter(g, selectedGpu, setSelectedGpu)))}
                </div>
              )}

              {filterSection('الرام', 'ram',
                <div className="space-y-0.5">
                  {filterOptions.rams.map(r => checkbox(r, selectedRam.includes(r), () => toggleArrayFilter(r, selectedRam, setSelectedRam)))}
                </div>
              )}

              {filterSection('التخزين', 'storage',
                <div className="space-y-0.5">
                  {filterOptions.storages.map(s => checkbox(s, selectedStorage.includes(s), () => toggleArrayFilter(s, selectedStorage, setSelectedStorage)))}
                </div>
              )}

              {filterSection('نظام التشغيل', 'os',
                <div className="space-y-0.5">
                  {filterOptions.oss.map(o => checkbox(o, selectedOs.includes(o), () => toggleArrayFilter(o, selectedOs, setSelectedOs)))}
                </div>
              )}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
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
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-heading font-bold text-xl text-ink mb-2">لا توجد منتجات مطابقة</p>
                <p className="font-body text-slate mb-4">جرب تغيير الفلاتر</p>
                <button onClick={clearFilters} className="px-6 py-2.5 rounded-xl gradient-brand text-white font-body font-medium">
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i % 6} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
