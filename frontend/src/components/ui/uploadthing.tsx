"use client";

import { useState, useEffect, useCallback } from "react";
import { generateUploadButton, generateUploadDropzone, type UploadDropzoneProps } from "@uploadthing/react";
import type { UploadFile } from "@uploadthing/react";
export type { UploadDropzoneProps };

// Import UploadThing CSS globally so styles always load
import "@uploadthing/react/styles.css";

// ── Shared UploadThing API endpoint ────────────────────────────────────────
// Use relative URL so requests are proxied through Vite as same-origin,
// allowing cookies to be sent (required for admin auth middleware)
const UPLOADTHING_URL = import.meta.env.VITE_UPLOADTHING_URL || "/api/uploadthing";

// ── UploadButton (used in CheckoutPage) ─────────────────────────────────────
export const UploadButton = generateUploadButton({
  url: UPLOADTHING_URL,
});

// ── SafeUploadDropzone: SSR hydration guard ─────────────────────────────────
// Wraps UploadDropzone to only render AFTER client mount, bypassing
// SSR hydration deadlocks that cause the infinite "Loading..." hang.
function SafeUploadDropzone(props: UploadDropzoneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-10 text-slate text-sm">
        جاري التحميل…
      </div>
    );
  }

  return <UploadDropzoneComponent {...props} />;
}

// ── UploadDropzone (large click/drag-drop zone) ─────────────────────────────
// `generateUploadDropzone` returns a full component, not a button element.
const UploadDropzoneComponent = generateUploadDropzone({
  url: UPLOADTHING_URL,
  config: {
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  },
  content: ({ isUploading, isReady, isDragOver, progress, uploadProgress }) => {
    // Dropping / empty state
    if (isDragOver && isReady) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-ignition-start">
          <svg
            className="h-10 w-10 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="font-body font-medium">اسحب الملف هنا…</span>
        </div>
      );
    }

    // Uploading with progress bar
    if (isUploading) {
      const pct = Math.round(uploadProgress ?? progress ?? 0);
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <SpinnerIcon className="h-8 w-8 animate-spin text-ignition-start" />
          <span className="font-body text-sm text-slate">جاري الرفع… {pct}%</span>
          <div
            className="h-1.5 w-48 overflow-hidden rounded-full bg-steel-light"
            role="progressbar"
            aria-valuenow={pct}
          >
            <div
              className="h-full rounded-full bg-ignition-start transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    // Idle / ready state — click me
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <svg
          className="h-10 w-10 text-slate"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="font-body font-medium text-ink">
          اضغط لرفع الملف أو اسحبه هنا
        </span>
        <span className="font-body text-xs text-slate">
          صيغة .docx فقط — حد أقصى 16 ميجابايت
        </span>
      </div>
    );
  },
});

// Export the safe wrapper (with SSR guard) as the public component
export { SafeUploadDropzone as UploadDropzone };

// ── Inline Spinner Icon ──────────────────────────────────────────────────────
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
