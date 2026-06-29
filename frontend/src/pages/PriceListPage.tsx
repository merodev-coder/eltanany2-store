import { useState, useEffect } from 'react';
import { FileX } from 'lucide-react';
import mammoth from 'mammoth';
import { getPriceListArrayBuffer } from '@/services/mockApi';

export default function PriceListPage() {
  const [loading, setLoading] = useState(true);
  const [hasFile, setHasFile] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadAndRender = async () => {
      setLoading(true);
      setRenderError(false);
      setHtmlContent('');

      const buffer = await getPriceListArrayBuffer();

      if (cancelled) return;

      if (!buffer || buffer.byteLength === 0) {
        setHasFile(false);
        setLoading(false);
        return;
      }

      setHasFile(true);

      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (cancelled) return;
        if (!result.value.trim()) {
          setRenderError(true);
          setLoading(false);
          return;
        }
        setHtmlContent(result.value);
      } catch {
        if (!cancelled) setRenderError(true);
      }

      if (!cancelled) setLoading(false);
    };

    loadAndRender();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20" dir="rtl">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#18181B] mb-3">قائمة الأسعار</h1>
        <p className="font-body text-slate text-sm sm:text-base">أحدث أسعار منتجاتنا المحدّثة</p>
      </div>

      <div className="bg-white shadow-sm rounded-card p-6 sm:p-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
          </div>
        )}

        {!loading && !hasFile && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-steel-light flex items-center justify-center mb-4">
              <FileX className="w-8 h-8 text-slate" />
            </div>
            <h2 className="font-heading font-bold text-xl text-[#18181B] mb-2">لا توجد قائمة أسعار متاحة حالياً</h2>
            <p className="font-body text-slate text-sm sm:text-base max-w-md leading-relaxed">
              لم يتم رفع قائمة أسعار بعد. يرجى العودة لاحقاً أو التواصل معنا للاستفسار عن الأسعار.
            </p>
          </div>
        )}

        {!loading && hasFile && renderError && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <FileX className="w-8 h-8 text-error" />
            </div>
            <h2 className="font-heading font-bold text-xl text-[#18181B] mb-2">تعذّر عرض الملف</h2>
            <p className="font-body text-slate text-sm sm:text-base max-w-md leading-relaxed">
              حدث خطأ أثناء تحميل قائمة الأسعار. يرجى المحاولة مرة أخرى لاحقاً.
            </p>
          </div>
        )}

        {!loading && hasFile && !renderError && htmlContent && (
          <div
            dir="rtl"
            className="price-list-viewer w-full overflow-x-auto font-body text-[#18181B] leading-relaxed [&_*]:max-w-full [&_p]:mb-3 [&_p]:text-right [&_li]:text-right [&_ul]:pr-5 [&_ol]:pr-5 [&_h1]:font-heading [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mb-4 [&_h1]:text-right [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-3 [&_h2]:text-right [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:text-right [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm [&_th]:border [&_th]:border-steel-light [&_th]:bg-steel-light/60 [&_th]:p-2 [&_th]:text-right [&_th]:font-medium [&_td]:border [&_td]:border-steel-light [&_td]:p-2 [&_td]:text-right [&_tr:nth-child(even)]:bg-steel-light/30 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
}
