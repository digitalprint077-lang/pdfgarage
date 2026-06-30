import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { canPreviewBlob, type ConversionResultInfo } from "./ConversionResultBar";

function previewKind(blob: Blob, filename: string): "pdf" | "image" | null {
  if (!canPreviewBlob(blob, filename)) return null;
  const type = blob.type.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase();
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  return "image";
}

interface ConversionPreviewModalProps {
  result: ConversionResultInfo;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

/** A4 portrait aspect ratio (210 × 297 mm) */
const A4_CLASS = "aspect-[210/297] w-full max-w-[420px]";

export default function ConversionPreviewModal({
  result,
  open,
  onClose,
  onDownload,
}: ConversionPreviewModalProps) {
  const objectUrl = useMemo(() => {
    if (!open) return null;
    return URL.createObjectURL(result.blob);
  }, [open, result.blob]);

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !objectUrl) return null;

  const kind = previewKind(result.blob, result.filename);

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-filename"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--card-hover))] px-4 py-2.5">
          <h2 id="preview-filename" className="truncate text-sm font-semibold">
            {result.filename}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded bg-red-600 p-1.5 text-white transition hover:bg-red-500"
            aria-label="Close preview"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center bg-neutral-200 p-4 dark:bg-neutral-800">
          <div className={`${A4_CLASS} overflow-hidden bg-white shadow-md`}>
            {kind === "pdf" ? (
              <iframe
                title={result.filename}
                src={objectUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : kind === "image" ? (
              <img
                src={objectUrl}
                alt={result.filename}
                className="block h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-sm text-gray-600">
                Preview is not available for this file type.
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[rgb(var(--border))] bg-[rgb(var(--card-hover))] px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-2 text-sm font-medium transition hover:bg-[rgb(var(--card-hover))]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
