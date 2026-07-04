// Modal pre-populated with existing product data for inline editing.
// Images go through UploadThing — only URLs are stored, no base64.

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Star } from 'lucide-react';
import axiosClient from '@/api/apiClient';
import { UploadDropzone } from '@/components/ui/uploadthing';
import type { UTUploadResult, BrandType, CPUType, GPUType, RAMType, StorageType } from '@/types';
import { BRANDS, CPUS, GPUS, RAMS, STORAGES } from '@/types';
import type { Product } from '@/types';

interface EditProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Partial<Product>) => void;
}

export default function EditProductModal({
  product,
  open,
  onClose,
  onUpdate,
}: EditProductModalProps) {
  const [name, setName] = useState<string>(product.name);
  const [brand, setBrand] = useState<BrandType | ''>(product.brand || '');
  const [cpu, setCpu] = useState<CPUType | ''>(product.specs?.cpu || '');
  const [gpu, setGpu] = useState<GPUType | ''>(product.specs?.gpu || '');
  const [ram, setRam] = useState<RAMType | ''>(product.specs?.ram || '');
  const [storage, setStorage] = useState<StorageType | ''>(product.specs?.storage || '');
  const [price, setPrice] = useState<number>(product.price || product.sellingPrice || 0);
  const [stock, setStock] = useState<number>(product.stock);
  const [description, setDescription] = useState<string>(product.description || '');
  const [imageUrl, setImageUrl] = useState<string>(product.imageUrl || '');
  const [images, setImages] = useState<string[]>(product.images || []);
  const [isFeatured, setIsFeatured] = useState<boolean>(product.isFeatured || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUploadComplete = useCallback((res: UTUploadResult[]) => {
    const urls = res.map((r) => r.url);
    if (!imageUrl && urls.length > 0) {
      setImageUrl(urls[0]);
    }
    setImages((prev) => [...prev, ...urls]);
  }, [imageUrl]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسم المنتج');
      return;
    }

    setIsLoading(true);

    try {
      const primaryImage = images[0] || imageUrl;
      if (!primaryImage) {
        setError('يرجى رفع صورة واحدة على الأقل للمنتج');
        setIsLoading(false);
        return;
      }

      const body: any = {
        name,
        brand,
        specs: {
          cpu,
          gpu,
          ram: ram || undefined,
          storage: storage || undefined,
        },
        price,
        stock,
        description,
        imageUrl: primaryImage,
        images,
        isFeatured,
      };

      const response = await axiosClient.patch(`/admin/products/${product._id}`, body);

      if (response.data.success) {
        onUpdate({
          name,
          brand: brand || undefined,
          specs: {
            cpu: cpu || undefined,
            gpu: gpu || undefined,
            ram: ram || undefined,
            storage: storage || undefined,
          },
          price,
          stock,
          description,
          imageUrl: primaryImage,
          images,
          isFeatured,
        });
        onClose();
      } else {
        setError(response.data.message || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-xl text-[#18181B]">تعديل المنتج</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-steel-light flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-slate" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              اسم المنتج
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              الماركة
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as BrandType | '')}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            >
              <option value="">اختر الماركة</option>
              {BRANDS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* CPU */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              المعالج
            </label>
            <select
              value={cpu}
              onChange={(e) => setCpu(e.target.value as CPUType | '')}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            >
              <option value="">اختر المعالج</option>
              {CPUS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* GPU */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              كرت الشاشة
            </label>
            <select
              value={gpu}
              onChange={(e) => setGpu(e.target.value as GPUType | '')}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            >
              <option value="">اختر كرت الشاشة</option>
              {GPUS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* RAM */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              الرام
            </label>
            <select
              value={ram}
              onChange={(e) => setRam(e.target.value as RAMType | '')}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            >
              <option value="">اختر الرام</option>
              {RAMS.map(r => (
                <option key={r} value={r}>{r} GB</option>
              ))}
            </select>
          </div>

          {/* Storage */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              التخزين
            </label>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value as StorageType | '')}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
            >
              <option value="">اختر التخزين</option>
              {STORAGES.map(s => (
                <option key={s} value={s}>{s} GB</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Product Images */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              صور المنتج
            </label>

            {/* Existing image thumbnails */}
            {images.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-steel-light"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* UploadDropzone for new images */}
            <UploadDropzone
              endpoint="productImageUploader"
              onClientUploadComplete={onUploadComplete}
              onUploadError={(err: Error) => {
                setError(`خطأ في رفع الصور: ${err.message}`);
              }}
            />
          </div>

          {/* isFeatured Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              disabled={isLoading}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${isFeatured ? 'bg-ignition-start' : 'bg-steel-dark/30'
                }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${isFeatured ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
                  }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <Star className={`w-4 h-4 ${isFeatured ? 'text-ignition-end' : 'text-slate'}`} fill={isFeatured ? 'currentColor' : 'none'} />
              <span className="font-body text-sm text-[#18181B]">منتج مميز</span>
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              سعر البيع (ج.م)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
              step={0.01}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-1.5">
              المخزون الحالي
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              min={0}
              step={1}
              className="w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] outline-none focus:ring-2 focus:ring-ignition-start/30"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-error text-sm font-body">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl border-2 border-steel-light font-body font-medium text-sm text-[#18181B] hover:border-steel-dark transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl gradient-brand text-white font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'حفظ التعديلات'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
