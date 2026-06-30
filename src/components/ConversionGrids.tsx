import { FROM_PDF_TARGETS, TO_PDF_SOURCES } from "../data/formats";

interface ConversionGridsProps {
  onSelect: (from: string, to: string) => void;
  darkMode: boolean;
}

export default function ConversionGrids({ onSelect, darkMode }: ConversionGridsProps) {
  return (
    <section className="grid gap-10 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
          Conversion types
        </p>
        <h3 className="mb-2 text-lg font-semibold">Convert from PDF</h3>
        <p className="mb-4 text-sm text-gray-400">
          Pick a target format to start a PDF conversion.
        </p>
        <div className="flex flex-wrap gap-2">
          {FROM_PDF_TARGETS.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect("pdf", f.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                darkMode
                  ? "border-surface-border bg-surface-raised hover:border-brand/50 hover:text-brand"
                  : "border-gray-200 bg-white hover:border-brand hover:text-brand"
              }`}
            >
              PDF to {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
          Conversion types
        </p>
        <h3 className="mb-2 text-lg font-semibold">Convert to PDF</h3>
        <p className="mb-4 text-sm text-gray-400">
          Pick a source format to convert into PDF.
        </p>
        <div className="flex flex-wrap gap-2">
          {TO_PDF_SOURCES.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id, "pdf")}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                darkMode
                  ? "border-surface-border bg-surface-raised hover:border-brand/50 hover:text-brand"
                  : "border-gray-200 bg-white hover:border-brand hover:text-brand"
              }`}
            >
              {f.label} to PDF
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
