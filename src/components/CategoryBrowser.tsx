import { type ReactNode } from "react";
import {
  CATEGORIES,
  ALL_FORMATS,
  CATEGORY_COMMON_CONVERSIONS,
  getCategoryFormatCount,
  getTotalFormatCount,
  type FormatCategory,
} from "../data/catalog";
import { useI18n } from "../i18n/I18nContext";

interface CategoryBrowserProps {
  activeCategory: FormatCategory;
  onCategoryChange: (c: FormatCategory) => void;
  onFormatSelect: (formatId: string) => void;
  onConversionSelect: (from: string, to: string) => void;
}

const CATEGORY_ICONS: Record<FormatCategory, ReactNode> = {
  document: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  image: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  spreadsheet: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  presentation: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zM4 20h16" />
    </svg>
  ),
  ebook: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  archive: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  vector: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  cad: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  font: (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
};

const CATEGORY_HEADING: Record<FormatCategory, string> = {
  document: "Document formats",
  image: "Image formats",
  spreadsheet: "Spreadsheet formats",
  presentation: "Presentation formats",
  ebook: "E-book formats",
  archive: "Archive formats",
  vector: "Vector formats",
  cad: "CAD formats",
  font: "Font formats",
};

export default function CategoryBrowser({
  activeCategory,
  onCategoryChange,
  onFormatSelect,
  onConversionSelect,
}: CategoryBrowserProps) {
  const { t } = useI18n();
  const formats = ALL_FORMATS.filter((f) => f.category === activeCategory);
  const listedCount = formats.length;
  const common = CATEGORY_COMMON_CONVERSIONS[activeCategory];
  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section className="mb-16">
      <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{t("formatCatalog")}</h2>
      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[rgb(var(--muted))]">
        {t("formatCatalogDesc")
          .replace("{total}", String(getTotalFormatCount()))
          .replace("{categories}", String(CATEGORIES.length))}
      </p>

      <div className="mb-8 flex flex-wrap gap-x-1 gap-y-2 border-b border-[rgb(var(--border))] pb-4">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          const count = getCategoryFormatCount(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? "bg-brand/10 text-brand" : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--card-hover))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              <span className={active ? "text-brand" : "text-[rgb(var(--muted))]"}>
                {CATEGORY_ICONS[cat.id]}
              </span>
              {cat.label}
              <span className={`text-xs ${active ? "text-brand/70" : "opacity-50"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(240px,320px)] lg:gap-12">
        <div>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
              {CATEGORY_HEADING[activeCategory] || `${activeCat?.label} formats`}
            </h3>
            <span className="shrink-0 text-xs text-[rgb(var(--muted))]">
              {listedCount} {t("formatsListed")}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFormatSelect(f.id)}
                className="min-w-[4.5rem] rounded-lg bg-[rgb(var(--card-hover))] px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-[rgb(var(--foreground))] transition hover:bg-brand/10 hover:text-brand"
              >
                {f.label}
              </button>
            ))}
            {formats.length === 0 && (
              <p className="text-sm text-[rgb(var(--muted))]">
                Browse related formats in{" "}
                {activeCategory === "vector" ? "Images" : activeCat?.label}.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-500">
            {t("commonConversionTypes")}
          </h3>
          <ul className="space-y-4">
            {common.map((c) => (
              <li key={`${c.from}-${c.to}`}>
                <button
                  type="button"
                  onClick={() => onConversionSelect(c.from, c.to)}
                  className="group w-full text-left"
                >
                  <span className="font-semibold uppercase tracking-wide">
                    <span className="group-hover:text-brand">
                      {c.from}
                    </span>
                    <span className="mx-1.5 text-[rgb(var(--muted))]">→</span>
                    <span className="group-hover:text-brand">
                      {c.to}
                    </span>
                  </span>
                  <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">{c.tag}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
