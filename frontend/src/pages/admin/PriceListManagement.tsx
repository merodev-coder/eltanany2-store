// frontend/src/pages/admin/PriceListManagement.tsx

import { useState, useCallback } from "react";
import axiosClient from "@/api/apiClient";
import {
  UploadDropzone,
  type UploadDropzoneProps,
} from "@/components/ui/uploadthing";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PriceListState {
  url: string;
  fileName: string;
  uploadedAt: string | null;
}

/**
 * UploadThing v7 onClientUploadComplete callback receives an array of
 * upload result objects whose fields are `url` and `name` (NOT `fileUrl` /
 * `fileName`).  The previous code was checking `fileUrl` / `fileName` and
 * throwing "لم يتم استلام بيانات الملف من الخادم" on every successful
 * upload.  This type reflects the real contract.
 */
type UTUploadResult = { url: string; name: string };

type DropzoneConfig = UploadDropzoneProps<UTUploadResult>["config"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PriceListManagement() {
  const [priceList, setPriceList] = useState<PriceListState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ── Fetch on mount ─────────────────────────────────────────────────────

  const fetchPriceList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axiosClient.get("/admin/settings/price-list");
      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message ?? "فشل التحميل");
      }
      setPriceList({
        url: response.data.data.url ?? "",
        fileName: response.data.data.fileName ?? "",
        uploadedAt: response.data.data.uploadedAt ?? null,
      });
    } catch (err: unknown) {
      setPriceList({ url: "", fileName: "", uploadedAt: null });
      setErrorMessage(
        err instanceof Error ? err.message : "فشل تحميل قائمة الأسعار",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Upload handler (UploadDropzone callback) ───────────────────────────
  // Fix: use `url` and `name` (not `fileUrl` / `fileName`).
  // The axios POST sends the same corrected keys so the backend stores
  // them verbatim — no mapping layer needed.

  const handleUploadComplete = useCallback(
    async (res: UTUploadResult[]) => {
      setSuccessMessage("");
      setErrorMessage("");

      if (!res?.[0]?.url || !res[0].name) {
        setErrorMessage("لم يتم استلام بيانات الملف من الخادم");
        return;
      }

      try {
        const response = await axiosClient.post(
          "/admin/settings/price-list",
          {
            url: res[0].url,
            fileName: res[0].name,
          },
        );

        if (!response.data?.success || !response.data?.data) {
          throw new Error(
            response.data?.message ?? "فشل تحديث قائمة الأسعار",
          );
        }

        setPriceList({
          url: response.data.data.url,
          fileName: response.data.data.fileName,
          uploadedAt: response.data.data.uploadedAt ?? new Date().toISOString(),
        });
        setSuccessMessage("تم رفع قائمة الأسعار بنجاح");
        setTimeout(() => setSuccessMessage(""), 4_000);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "فشل رفع الملف",
        );
      }
    },
    [],
  );

  const handleUploadError = useCallback((error: Error) => {
    setErrorMessage(`فشل رفع الملف: ${error.message}`);
  }, []);

  // ── Delete handler ─────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const response = await axiosClient.post(
        "/admin/settings/price-list",
        { url: "", fileName: "" },
      );

      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message ?? "فشل الحذف");
      }

      setPriceList({ url: "", fileName: "", uploadedAt: null });
      setSuccessMessage("تم حذف قائمة الأسعار بنجاح");
      setTimeout(() => setSuccessMessage(""), 4_000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "فشل حذف القائمة",
      );
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // ── Shared dropzone config (docx only, 16 MB max, 1 file) ──────────────
  // Placed outside render to avoid recreating on every render pass.
  const dropzoneConfig: DropzoneConfig = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">
          إدارة قائمة الأسعار
        </h2>
        <p className="font-body text-sm text-slate mt-1">
          رفع وإدارة ملف قائمة الأسعار بصيغة .docx
        </p>
      </div>

      {/* ── Success / Error banners ───────────────────────────────────── */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-4"
        >
          <CheckIcon className="h-5 w-5 text-success" />
          <p className="font-body text-sm text-success">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 p-4"
        >
          <AlertIcon className="h-5 w-5 text-error" />
          <p className="font-body text-sm text-error">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="mr-auto text-error/60 hover:text-error transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div className="rounded-card bg-white p-6 shadow-sm">
        {isLoading ? (
          // ── Loading ──────────────────────────────────────────────────
          <div className="flex flex-col items-center justify-center py-16">
            <SpinnerIcon className="h-8 w-8 animate-spin text-ignition-start" />
            <p className="mt-3 font-body text-sm text-slate">
              جاري تحميل…
            </p>
          </div>
        ) : priceList?.url ? (
          // ── Existing file view ──────────────────────────────────────
          <div className="space-y-4">
            {/* File card */}
            <div className="rounded-xl bg-steel-light/30 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FileIcon className="h-6 w-6 text-ignition-start" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate font-heading font-bold text-lg text-[#18181B]"
                      title={priceList.fileName}
                    >
                      {priceList.fileName}
                    </p>
                    {priceList.uploadedAt && (
                      <p className="mt-1 font-body text-xs text-slate">
                        تم الرفع:{" "}
                        {new Date(priceList.uploadedAt).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl p-3 text-error transition-colors hover:bg-error/10 disabled:opacity-50 flex-shrink-0"
                  title="حذف قائمة الأسعار"
                >
                  {isDeleting ? (
                    <SpinnerIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4">
              <p className="font-body text-sm text-blue-800">
                <strong>ملاحظة:</strong> ستظهر هذه القائمة في صفحة قائمة
                الأسعار العامة (/price-list) عند رفع ملف جديد.
              </p>
            </div>

            {/* Replace file — FULL dropzone click zone */}
            <div className="border-slate-light border-t pt-4">
              <p className="mb-3 font-body text-sm text-slate">
                رفع ملف جديد لاستبدال القائمة الحالية:
              </p>
              <UploadDropzone
                endpoint="priceListUploader"
                config={dropzoneConfig}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        ) : (
          // ── Empty state — FULL dropzone click zone ────────────────────
          <div className="space-y-4">
            <UploadDropzone
              endpoint="priceListUploader"
              config={dropzoneConfig}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-steel-light/30 p-4">
                <p className="font-body text-xs text-slate">
                  <strong>الصيغة المقبولة:</strong> .docx فقط
                </p>
              </div>
              <div className="rounded-xl bg-steel-light/30 p-4">
                <p className="font-body text-xs text-slate">
                  <strong>الحد الأقصى للحجم:</strong> 16 ميجابايت
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer hook for future "view file" action ──────────────────── */}
      {priceList?.url && !isLoading && (
        <div className="text-center">
          <a
            href={priceList.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-steel-light px-4 py-2 font-body text-sm text-slate transition-colors hover:border-ignition-start hover:text-ignition-start"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            فتح الملف في标签 تبويب جديد
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icon shims (kept as-is from your existing component)    */
/* ------------------------------------------------------------------ */

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth={3}
        stroke="currentColor"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        strokeWidth={3}
        stroke="currentColor"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
