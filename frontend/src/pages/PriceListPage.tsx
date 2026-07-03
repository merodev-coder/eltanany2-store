// frontend/src/pages/PriceListPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import axiosClient from "@/api/apiClient";
import { Link } from "react-router-dom";
import { renderAsync } from "docx-preview";

interface PriceListData {
  url: string;
  fileName: string;
  uploadedAt: string | null;
}

export default function PriceListPage() {
  const [data, setData] = useState<PriceListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fetch price-list metadata ──────────────────────────────────
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axiosClient.get("/public/price-list");
        if (res.data.success) setData(res.data.data ?? null);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  // ── Render the .docx into the container ───────────────────────
  const renderDocx = useCallback(async () => {
    if (!data?.url || !containerRef.current) return;

    setPreviewLoading(true);
    setPreviewError(null);
    containerRef.current!.innerHTML = "";

    try {
      const res = await fetch(data.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buf = await res.arrayBuffer();
      if (!buf || buf.byteLength === 0)
        throw new Error("الملف فارغ أو تالف");

      // DOCX is a ZIP — verify the PK signature
      const hdr = new Uint8Array(buf.slice(0, 4));
      if (hdr[0] !== 0x50 || hdr[1] !== 0x4b)
        throw new Error("صيغة الملف غير مدعومة");

      await renderAsync(buf, containerRef.current!, {
        className: "docx-preview-render",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        ignoreLastRenderedPage: true,
        experimental: {
          breakWithoutSpace: false,
          enableFileSizeDetection: false,
        },
      });
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "حدث خطأ أثناء عرض الملف"
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [data?.url]);

  useEffect(() => {
    if (data?.url) renderDocx();
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [data?.url, renderDocx]);

  // ── Refetch metadata (kept as manual trigger via reload) ──────
  const handleReload = () => window.location.reload();

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-ignition-start mx-auto mb-4" />
          <p className="font-body text-zinc-400 text-lg">
            جاري تحميل القائمة…
          </p>
        </div>
      </div>
    );
  }

  // ── No data ────────────────────────────────────────────────────
  if (error || !data?.url) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-zinc-500" />
          </div>
          <h1 className="font-heading font-bold text-xl text-white mb-2">
            لا توجد قائمة أسعار متوفرة حالياً
          </h1>
          <p className="font-body text-zinc-400 mb-6">
            لم يتم رفع قائمة الأسعار بعد، يرجى المحاولة لاحقاً
          </p>
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-heading font-bold hover:shadow-glow transition-shadow"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <div className="mt-4">
            <Link
              to="/"
              className="text-sm text-ignition-start hover:underline font-body"
            >
              <ArrowRight className="w-4 h-4 inline-block ml-1" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Preview ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col" dir="rtl">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-ignition-start flex-shrink-0" />
            <span className="font-heading font-bold text-white truncate text-sm sm:text-base">
              {data.fileName}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => renderDocx()}
              disabled={previewLoading}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40"
              title="إعادة تحميل"
            >
              <RefreshCw
                className={`w-4 h-4 ${previewLoading ? "animate-spin" : ""}`}
              />
            </button>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ignition-start text-white text-sm font-heading font-bold hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تنزيل الملف</span>
            </a>
          </div>
        </div>
      </div>

      {/* Document viewport */}
      <div className="flex-1 bg-zinc-950 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-2xl rounded-lg overflow-hidden min-h-[60vh]"
          >
            {/* Preview loading overlay */}
            {previewLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-ignition-start mx-auto mb-3" />
                  <p className="font-body text-slate text-sm">
                    جاري عرض المستند…
                  </p>
                </div>
              </div>
            )}

            {/* Preview error */}
            {previewError && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="font-body text-red-500 text-center max-w-md">
                  {previewError}
                </p>
                <button
                  onClick={() => renderDocx()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-ink font-heading font-bold text-sm hover:bg-zinc-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Render target */}
            <div
              ref={containerRef}
              className="docx-preview-target [&_.docx-preview-render]:p-6 sm:[&_.docx-preview-render]:p-10"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
