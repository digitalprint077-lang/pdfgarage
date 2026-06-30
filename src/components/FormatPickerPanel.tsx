import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface PickerOption {
  id: string;
  label: string;
  category: string;
}

export const FORMAT_CATEGORY_LABELS: Record<string, string> = {
  archive: "Archive",
  audio: "Audio",
  cad: "Cad",
  document: "Document",
  ebook: "Ebook",
  font: "Font",
  image: "Image",
  presentation: "Presentation",
  spreadsheet: "Spreadsheet",
  vector: "Vector",
  video: "Video",
};

export const FORMAT_CATEGORY_ORDER = [
  "archive",
  "audio",
  "cad",
  "document",
  "ebook",
  "font",
  "image",
  "presentation",
  "spreadsheet",
  "vector",
  "video",
];

interface FormatPickerPanelProps {
  open: boolean;
  onClose: () => void;
  options: PickerOption[];
  value: string;
  onChange: (id: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export default function FormatPickerPanel({
  open,
  onClose,
  options,
  value,
  onChange,
  anchorRef,
}: FormatPickerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("document");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 520 });

  const categories = useMemo(() => {
    const set = new Set(options.map((o) => o.category));
    return FORMAT_CATEGORY_ORDER.filter((c) => set.has(c));
  }, [options]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter((o) => {
      const matchesCat = q ? true : o.category === category;
      const matchesSearch =
        !q || o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [options, category, search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const selected = options.find((o) => o.id === value);
    if (selected?.category) setCategory(selected.category);
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(520, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
    setPos({ top: rect.bottom + 10, left, width });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (open && categories.length && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [open, categories, category]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[200] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--picker-surface)/0.98)] shadow-2xl backdrop-blur-xl"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      role="dialog"
      aria-label="Select format"
    >
      <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--picker-inset))] px-3 py-2">
          <svg
            className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Format"
            className="w-full bg-transparent text-sm text-[rgb(var(--foreground))] outline-none placeholder:text-[rgb(var(--muted))]"
          />
        </div>
      </div>

      <div className="flex max-h-[340px]">
        {!search.trim() ? (
          <div className="picker-scroll w-[132px] shrink-0 overflow-y-auto border-r border-[rgb(var(--border))] py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition ${
                  category === cat
                    ? "text-[rgb(var(--foreground))]"
                    : "text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
                }`}
              >
                {FORMAT_CATEGORY_LABELS[cat] || cat}
                {category === cat ? (
                  <svg className="h-3 w-3 text-[rgb(var(--muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <div className="picker-scroll flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  onClose();
                }}
                className={`rounded-md border px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide transition ${
                  value === opt.id
                    ? "border-brand/60 bg-brand/15 text-brand"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--picker-chip))] text-[rgb(var(--foreground))] hover:border-brand/40 hover:bg-[rgb(var(--picker-chip-hover))]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[rgb(var(--muted))]">No formats found</p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
