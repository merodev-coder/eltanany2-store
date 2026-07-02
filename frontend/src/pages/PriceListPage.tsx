import { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import axiosClient from '@/api/apiClient';
import mammoth from 'mammoth';

interface PriceListData {
  url: string;
  fileName: string;
  uploadedAt: string | null;
}

export default function PriceListPage() {
  const [priceListData, setPriceListData] = useState<PriceListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceList = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axiosClient.get('/public/settings/price-list');
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          if (!data.url) {
            setError('لا توجد قائمة أسعار متاحة حالياً');
            setIsLoading(false);
            return;
          }
          
          setPriceListData(data);
          
          // Fetch and parse the .docx file
          setIsParsing(true);
          const fileResponse = await fetch(data.url);
          const arrayBuffer = await fileResponse.arrayBuffer();
          
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value);
          
          if (result.messages.length > 0) {
            console.warn('Mammoth messages:', result.messages);
          }
        }
      } catch (err) {
        console.error('Failed to fetch price list:', err);
        setError('فشل في تحميل قائمة الأسعار. يرجى المحاولة مرة أخرى لاحقاً.');
      } finally {
        setIsLoading(false);
        setIsParsing(false);
      }
    };

    fetchPriceList();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-ignition-start" />
            <h1 className="font-heading font-bold text-3xl text-[#18181B]">قائمة الأسعار</h1>
          </div>
          <p className="font-body text-slate">
            {priceListData?.uploadedAt && (
              <>آخر تحديث: {new Date(priceListData.uploadedAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow-sm rounded-card overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-ignition-start animate-spin mb-4" />
              <p className="font-body text-slate">جاري تحميل قائمة الأسعار...</p>
            </div>
          ) : isParsing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-ignition-start animate-spin mb-4" />
              <p className="font-body text-slate">جاري معالجة المستند...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="font-body text-[#18181B] text-center mb-2">{error}</p>
              <p className="font-body text-slate text-sm text-center">
                يرجى التواصل معنا إذا كانت المشكلة مستمرة
              </p>
            </div>
          ) : htmlContent ? (
            <div className="p-8">
              <div
                className="max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  fontFamily: 'IBM Plex Sans Arabic, system-ui, Tahoma, sans-serif',
                }}
              />
              <style>{`
                .price-list-content h1, .price-list-content h2, .price-list-content h3 {
                  font-family: 'Cairo', system-ui, Tahoma, sans-serif;
                  color: #18181B;
                  font-weight: bold;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                }
                .price-list-content p {
                  color: #6B7280;
                  margin-bottom: 1em;
                  line-height: 1.6;
                }
                .price-list-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1em 0;
                }
                .price-list-content th {
                  background-color: rgba(242, 243, 245, 0.5);
                  font-family: 'Cairo', system-ui, Tahoma, sans-serif;
                  font-weight: bold;
                  color: #18181B;
                  padding: 0.75rem;
                  text-align: right;
                  border-bottom: 2px solid rgba(138, 146, 160, 0.2);
                }
                .price-list-content td {
                  padding: 0.75rem;
                  border-bottom: 1px solid rgba(242, 243, 245, 0.8);
                  color: #18181B;
                }
                .price-list-content ul, .price-list-content ol {
                  margin: 1em 0;
                  padding-right: 1.5em;
                }
                .price-list-content li {
                  color: #6B7280;
                  margin-bottom: 0.5em;
                }
              `}</style>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <FileText className="w-12 h-12 text-slate mb-4" />
              <p className="font-body text-[#18181B] text-center mb-2">لا توجد قائمة أسعار متاحة</p>
              <p className="font-body text-slate text-sm text-center">
                يرجى العودة لاحقاً عندما يتم تحديث قائمة الأسعار
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        {!isLoading && !error && htmlContent && (
          <div className="mt-6 text-center">
            <p className="font-body text-xs text-slate">
              * الأسعار المذكورة أعلاه قد تتغير دون إشعار مسبق. يرجى التواصل معنا للتأكد من الأسعار الحالية.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
