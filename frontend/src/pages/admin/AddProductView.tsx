import { useState, useRef } from 'react';
import { Upload, X, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { addProduct } from '@/services/mockApi';

const inputClass =
  'w-full h-11 px-4 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30 transition-all';

export default function AddProductView() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<'laptop' | 'accessory'>('laptop');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !price || !stock || !description.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      await addProduct({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category,
        description: description.trim(),
        images,
      });
      setSuccess(true);
      setName('');
      setPrice('');
      setStock('');
      setCategory('laptop');
      setDescription('');
      setImages([]);
    } catch {
      setError('فشل إضافة المنتج. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-card p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="font-heading font-bold text-xl text-[#18181B]">إضافة منتج</h2>
        <p className="font-body text-sm text-slate mt-1">أضف منتجاً جديداً إلى المتجر</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success font-body text-sm mb-6"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          تم إضافة المنتج بنجاح
        </motion.div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20 text-error font-body text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">اسم المنتج</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder="مثال: ASUS ROG Strix G16"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">السعر (ج.م)</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">الكمية في المخزن</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={e => setStock(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-body text-sm font-medium text-[#18181B] mb-2">القسم</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as 'laptop' | 'accessory')}
              className={inputClass}
            >
              <option value="laptop">لابتوب</option>
              <option value="accessory">إكسسوارات</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-body text-sm font-medium text-[#18181B] mb-2">الوصف</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-steel-light border-0 font-body text-sm text-[#18181B] placeholder:text-slate outline-none focus:ring-2 focus:ring-ignition-start/30 resize-none"
            placeholder="وصف تفصيلي للمنتج..."
          />
        </div>

        {/* Images */}
        <div>
          <label className="block font-body text-sm font-medium text-[#18181B] mb-3">صور المنتج</label>
          <div
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              handleImageFiles(e.dataTransfer.files);
            }}
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setDragActive(false);
            }}
            onClick={() => inputRef.current?.click()}
            className={`bg-white border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
              dragActive ? 'border-ignition-start bg-ignition-start/5' : 'border-steel-dark/30 hover:border-ignition-start/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleImageFiles(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-steel-light flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#18181B]" />
              </div>
              <p className="font-body text-sm text-[#18181B]">اسحب الصور هنا أو انقر للرفع</p>
              <p className="font-body text-xs text-slate">PNG, JPG, WEBP</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-steel-light group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              إضافة المنتج
            </>
          )}
        </button>
      </form>
    </div>
  );
}
