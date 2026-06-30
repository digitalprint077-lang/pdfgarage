import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export type CloudProvider = "google-drive" | "dropbox" | "onedrive";

interface AddFilesMenuProps {
  onAddFiles: () => void;
  onAddUrl: () => void;
  onCloudImport?: (provider: CloudProvider) => void;
  label?: string;
  variant?: "default" | "primary";
  /** "below" for upload zone Select File; "above" for footer Add more files */
  placement?: "below" | "above";
}

type MenuItem =
  | { type: "action"; id: string; label: string; icon: "folder" | "link" | CloudProvider; action: () => void }
  | { type: "separator" };

function MenuIcon({ icon }: { icon: MenuItem extends { type: "action" } ? MenuItem["icon"] : never }) {
  if (icon === "folder") {
    return (
      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    );
  }
  if (icon === "link") {
    return (
      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  }
  if (icon === "google-drive") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path fill="#0066DA" d="M7.71 6.5L1.15 12l3.28 3.5L12 9.5 7.71 6.5z" />
        <path fill="#00AC47" d="M12 9.5l7.57 6-3.28 3.5L12 16.5 4.43 10.5 12 9.5z" />
        <path fill="#EA4335" d="M12 9.5L4.43 3.5 7.71 0 16.28 6 12 9.5z" />
        <path fill="#FFBA00" d="M12 9.5l4.29 3 3.28-3.5L16.28 6 12 9.5z" />
      </svg>
    );
  }
  if (icon === "dropbox") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path fill="#0061FF" d="M6 2L1 6l5 4-5 4 5 4 5-4 5 4 5-4-5-4 5-4-5-4 5-4-5-4L6 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#0078D4"
        d="M18.5 8.5c-.3-2.8-2.6-5-5.5-5-2.2 0-4.1 1.3-4.9 3.2C6.8 6.2 5 7.5 5 9.5 3.3 9.5 2 10.9 2 12.5S3.3 15.5 5 15.5h13c1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3-3.5z"
      />
    </svg>
  );
}

export default function AddFilesMenu({
  onAddFiles,
  onAddUrl,
  onCloudImport,
  label = "Add more files",
  variant = "default",
  placement = "above",
}: AddFilesMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });

  useEffect(() => {
    if (!open || !wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    const width = Math.max(r.width, 240);
    if (placement === "below") {
      setPos({ top: r.bottom + 8, left: r.left + r.width / 2 - width / 2, width });
    } else {
      setPos({ top: r.top - 8, left: r.right, width });
    }
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapperRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const closeMenu = () => setOpen(false);

  const items: MenuItem[] = [
    { type: "action", id: "computer", label: "From my computer", icon: "folder", action: () => { onAddFiles(); closeMenu(); } },
    { type: "action", id: "url", label: "By URL", icon: "link", action: () => { onAddUrl(); closeMenu(); } },
    { type: "separator" },
    {
      type: "action",
      id: "google-drive",
      label: "From Google Drive",
      icon: "google-drive",
      action: () => { onCloudImport?.("google-drive"); closeMenu(); },
    },
    {
      type: "action",
      id: "dropbox",
      label: "From Dropbox",
      icon: "dropbox",
      action: () => { onCloudImport?.("dropbox"); closeMenu(); },
    },
    {
      type: "action",
      id: "onedrive",
      label: "From OneDrive",
      icon: "onedrive",
      action: () => { onCloudImport?.("onedrive"); closeMenu(); },
    },
  ];

  const panelStyle =
    placement === "below"
      ? { top: pos.top, left: pos.left, width: pos.width }
      : { top: pos.top, left: pos.left, width: pos.width, transform: "translate(-100%, -100%)" };

  const fileIcon =
    variant === "primary" ? (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) : (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );

  const chevron = (
    <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <>
      <div
        ref={wrapperRef}
        className={
          variant === "primary"
            ? "inline-flex min-w-[220px] overflow-hidden rounded-xl shadow-lg shadow-brand/30"
            : "inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-white/15"
        }
      >
        <button
          type="button"
          onClick={onAddFiles}
          className={
            variant === "primary"
              ? "inline-flex flex-1 items-center gap-3 bg-brand px-5 py-3.5 text-base font-semibold text-white transition hover:bg-brand-hover"
              : "inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          }
        >
          {fileIcon}
          {label}
        </button>
        <button
          type="button"
          aria-label="More upload options"
          onClick={() => setOpen((o) => !o)}
          className={
            variant === "primary"
              ? "inline-flex items-center border-l border-white/25 bg-brand px-3 py-3.5 text-white transition hover:bg-brand-hover"
              : "inline-flex items-center border-l border-gray-300 bg-white px-2.5 py-2.5 text-gray-700 transition hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
          }
        >
          {chevron}
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="fixed z-[200] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-white/10 dark:bg-[#2a2a2a]"
          >
            {items.map((item, i) =>
              item.type === "separator" ? (
                <div key={`sep-${i}`} className="my-1 border-t border-gray-200 dark:border-white/10" />
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                >
                  <MenuIcon icon={item.icon} />
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}
