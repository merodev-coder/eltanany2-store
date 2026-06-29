// components/checkout/ReceiptUploader.tsx
// File uploader for عربون deposit receipt.
// Uploads to the backend and returns the URL.

import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, Check } from 'lucide-react';
import axiosClient from '@/api/axiosClient';

interface ReceiptUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (err: Error) => void;
  onRemove?: () => void;
}

export default function ReceiptUploader({
  onUploadComplete,
  onUploadError,
  onRemove,
}: ReceiptUploaderProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('يجب اختيار ملف صورة (JPG, PNG)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('حجم الملف يجب أن لا يتجاوز 8 ميجابايت');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const response = await axiosClient.post('/users/upload/receipt', {
          file: base64,
          fileName: file.name,
          mimeType: file.type,
        });

        if (response.data.success) {
          const url = response.data.data.url;
          setUploadedUrl(url);
          onUploadComplete(url);
        } else {
          throw new Error(response.data.message || 'فشل الرفع');
        }
      };
      reader.onerror = () => {
        throw new Error('فشل قراءة الملف');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'حدث خطأ أثناء الرفع';
      setError(msg);
      onUploadError(new Error(msg));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setError(null);
    onRemove?.();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="w-full" dir="rtl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadedUrl ? (
        // Complete state
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-body text-sm font-medium">
            <Check className="w-5 h-5" />
            تم الرفع بنجاح
          </div>
          <img
            src={uploadedUrl}
            alt="عربون"
            className="w-full max-h-48 object-contain rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 text-sm font-body text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            إزالة الصورة
          </button>
        </div>
      ) : (
        // Upload state
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative rounded-xl border-2 border-dashed border-steel-dark/30 bg-steel-light/20 p-8 transition-colors hover:border-ignition-start/30 cursor-pointer text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-ignition-start animate-spin" />
              <p className="font-body text-sm text-slate">جاري الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ImagePlus className="w-10 h-10 text-slate" />
              <div>
                <p className="font-body text-sm font-medium text-[#18181B]">
                  ارفع صورة العربون / دفعة مقدمة
                </p>
                <p className="font-body text-xs text-slate mt-1">
                  اسحب الصورة هنا أو انقر للاختيار (JPG, PNG — حتى 8 ميجابايت)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-error text-sm font-body mt-2">{error}</p>
      )}
    </div>
  );
}
