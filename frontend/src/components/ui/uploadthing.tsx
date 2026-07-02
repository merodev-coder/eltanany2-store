// frontend/src/components/ui/uploadthing.tsx
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

// ── Shared UploadThing API endpoint ────────────────────────────────────────
const UPLOADTHING_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── UploadButton (used in CheckoutPage for small inline triggers) ──────────
export const UploadButton = generateUploadButton({
  url: `${UPLOADTHING_URL}/api/uploadthing`,
});

// ── UploadDropzone (large click/drag-drop zone — full surface area) ─────────
// `generateUploadDropzone` returns a full-component, not a button element.
// The `config.content` function receives full UploadThing state:
//   - `isUploading`, `isReady`, `isDragOver`, `progress`
// so we can wire every visual state (idle / uploading / dragging / error).
export const UploadDropzone = generateUploadDropzone({
  url: `${UPLOADTHING_URL}/api/uploadthing`,
  config: {
    // The .docx MIME type from uploadthing's allowed-types.
    // The actual MIME check is enforced server-side in uploadthing.ts;
    // this is a client-side hint only.
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  },
  // Render the full dropzone surface — every visual state in one function.
  content: ({
    isUploading,
    isReady,
    isDragOver,
    progress,
    uploadProgress,
  }) => {
    // Dropping / empty state
    if (isDragOver && isReady) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-ignition-start">
          <svg
            className="h-10 w-10 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
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

    // Idle / ready state — the "click me" prompt
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <svg
          className="h-10 w-10 text-slate"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
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

// ── Tiny inline spinner icon (no lucide export needed) ─────────────────────
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
