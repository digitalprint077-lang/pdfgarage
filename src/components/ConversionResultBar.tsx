import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatFileSize } from "../utils/outputFormats";

interface DownloadMenuProps {
  onDownload: () => void;
  onPreview: () => void;
  canPreview: boolean;
}

function DownloadMenu({ onDownload, onPreview, canPreview }: DownloadMenuProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuWidth = 160;
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - menuWidth),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!anchorRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={panelRef}
      style={{ top: menuPos.top, left: menuPos.left, width: 160 }}
      className="fixed z-[300] overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] py-1 shadow-soft"
    >
      {canPreview ? (
        <button
          type="button"
          onClick={() => {
            onPreview();
            setOpen(false);
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-[rgb(var(--card-hover))]"
        >
          <svg className="h-4 w-4 text-[rgb(var(--muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Preview
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => {
          onDownload();
          setOpen(false);
        }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-[rgb(var(--card-hover))]"
      >
        <svg className="h-4 w-4 text-[rgb(var(--muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        Download
      </button>
    </div>
  ) : null;

  return (
    <>
      <div ref={anchorRef} className="flex">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-l-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-emerald-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          Download
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-r-lg border-l border-emerald-600/30 bg-emerald-500 px-2 py-2.5 text-zinc-900 transition hover:bg-emerald-400"
          aria-label="More download options"
          aria-expanded={open}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}

export interface ConversionResultInfo {
  filename: string;
  size: number;
  outputFormat: string;
  blob: Blob;
}

export function canPreviewBlob(blob: Blob, filename: string): boolean {
  const type = blob.type.toLowerCase();
  if (type.startsWith("image/") || type === "application/pdf") return true;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "");
}

export function downloadConversionResult(result: ConversionResultInfo) {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ConversionResultBarProps {
  result: ConversionResultInfo;
  onDownload: () => void;
  onPreview: () => void;
}

export default function ConversionResultBar({ result, onDownload, onPreview }: ConversionResultBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--card-hover)/0.35)] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="shrink-0 rounded bg-emerald-600/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Finished
        </span>
        <span className="truncate font-semibold">{result.filename}</span>
        <span className="text-sm text-[rgb(var(--muted))]">{formatFileSize(result.size)}</span>
      </div>
      <DownloadMenu
        onDownload={onDownload}
        onPreview={onPreview}
        canPreview={canPreviewBlob(result.blob, result.filename)}
      />
    </div>
  );
}
