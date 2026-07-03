// frontend/src/pages/admin/AddProductView.tsx
import { useState, useCallback } from 'react';
import { Plus, Upload, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { addProduct } from '@/services/api';
import { UploadDropzone } from '@/components/ui/uploadthing';
import type { UTUploadResult } from '@/types';

export default function AddProductView() {
const [form, setForm] = useState({
name: '',
category: 'laptop',
price: '',
sellingPrice: '',
stock: '0',
description: '',
images: [] as string[],
isFeatured: false,
});
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

const removeImage = (index: number) => {
setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
};

const onUploadComplete = useCallback((res: UTUploadResult[]) => {
const urls = res.map((r) => r.url);
setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
}, []);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setMessage('');
try {
await addProduct({
name: form.name,
category: form.category,
price: Number(form.price),
sellingPrice: Number(form.sellingPrice) || undefined,
stock: Number(form.stock),
description: form.description,
images: form.images,
isFeatured: form.isFeatured,
});
setMessage('✅ تم إضافة المنتج بنجاح');
setForm({
name: '',
category: 'laptop',
price: '',
sellingPrice: '',
stock: '0',
description: '',
images: [],
isFeatured: false,
});
} catch (err: any) {
setMessage(err.response?.data?.message || '❌ فشل إضافة المنتج');
} finally {
setLoading(false);
}
};

return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className="bg-white shadow-sm rounded-card p-6"
>
<h2 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
<Plus className="w-5 h-5 text-primary" />
إضافة منتج جديد
</h2>

{message && (
<div className={`mb-4 p-3 rounded-lg text-sm font-body ${message.startsWith('✅') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
{message}
</div>
)}

<form onSubmit={handleSubmit} className="space-y-5">
{/* Name */}
<div>
<label className="block text-sm font-body text-gray-600 mb-1">الاسم <span className="text-error">*</span></label>
<input
name="name"
value={form.name}
onChange={handleChange}
required
placeholder="اسم المنتج"
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
/>
</div>

{/* Category */}
<div>
<label className="block text-sm font-body text-gray-600 mb-1">الفئة <span className="text-error">*</span></label>
<select
name="category"
value={form.category}
onChange={handleChange}
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
>
<option value="laptop">لابتوب</option>
<option value="accessory">إكسسوار</option>
</select>
</div>

{/* Prices */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-sm font-body text-gray-600 mb-1">السعر الأصلي (سعر الشراء) <span className="text-error">*</span></label>
<input
name="price"
type="number"
value={form.price}
onChange={handleChange}
required
min={0}
placeholder="0"
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
/>
<p className="text-xs text-slate mt-1 font-body">هذا السعر لا يظهر للعملاء — يُستخدم لحساب الأرباح</p>
</div>
<div>
<label className="block text-sm font-body text-gray-600 mb-1">سعر البيع <span className="text-error">*</span></label>
<input
name="sellingPrice"
type="number"
value={form.sellingPrice}
onChange={handleChange}
required
min={0}
placeholder="0"
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
/>
<p className="text-xs text-slate mt-1 font-body">السعر المعروض للعملاء في المتجر</p>
</div>
</div>

{/* Stock */}
<div>
<label className="block text-sm font-body text-gray-600 mb-1">المخزون</label>
<input
name="stock"
type="number"
value={form.stock}
onChange={handleChange}
min={0}
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body"
/>
</div>

{/* Description */}
<div>
<label className="block text-sm font-body text-gray-600 mb-1">الوصف</label>
<textarea
name="description"
value={form.description}
onChange={handleChange}
rows={4}
placeholder="وصف المنتج..."
className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-body resize-none"
/>
</div>

{/* Show in Home Page Toggle */}
<div className="flex items-center gap-3 p-3 bg-steel-light/30 rounded-lg">
<button
type="button"
onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
className="flex items-center gap-2"
>
{form.isFeatured ? (
<ToggleRight className="w-8 h-8 text-success" />
) : (
<ToggleLeft className="w-8 h-8 text-slate" />
)}
<span className="font-body text-sm text-[#18181B]">الظهور في الصفحة الرئيسية</span>
</button>
</div>

{/* Photos */}
<div>
<label className="block text-sm font-body text-gray-600 mb-2">الصور</label>
<UploadDropzone
endpoint="productImageUploader"
onClientUploadComplete={onUploadComplete}
onUploadError={(err: Error) => {
console.error('Image upload error:', err);
setMessage(`❌ خطأ في رفع الصور: ${err.message}`);
}}
/>
{form.images.length > 0 && (
<div className="flex gap-3 mt-4 flex-wrap">
{form.images.map((img, i) => (
<div key={i} className="relative group">
<img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-steel-light" />
<button
type="button"
onClick={() => removeImage(i)}
className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
>
×
</button>
</div>
))}
</div>
)}
</div>

{/* Submit */}
<button
type="submit"
disabled={loading}
className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
>
{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
إضافة المنتج
</button>
</form>
</motion.div>
);
}
