import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_FORMATS } from "../data/catalog";
import type { Operation } from "../data/catalog";
import {
  CALCULATOR_OPERATIONS,
  FORMAT_CATEGORY_LABELS,
  FORMAT_CATEGORY_ORDER,
  estimateJobCredits,
  type CalculatorOperationDef,
} from "../data/creditCalculator";
import { getOutputFormatOptions } from "../utils/outputFormats";
import type { PickerOption } from "./FormatPickerPanel";

type PanelId = "operation" | "input" | "output" | null;

function OperationIcon({ id, className = "h-4 w-4" }: { id: Operation; className?: string }) {
  switch (id) {
    case "convert":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    case "compress":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      );
    case "merge":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case "extract":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case "ocr":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      );
    case "translate":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      );
  }
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-[rgb(var(--muted))] transition ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
      <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card-hover)/0.5)] px-3 py-2">
        <svg className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--muted))]"
        />
      </div>
    </div>
  );
}

function OperationPanel({
  value,
  search,
  onSearchChange,
  onSelect,
}: {
  value: Operation;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (op: CalculatorOperationDef) => void;
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CALCULATOR_OPERATIONS;
    return CALCULATOR_OPERATIONS.filter((op) => op.label.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft">
      <SearchField value={search} onChange={onSearchChange} placeholder="Search..." />
      <ul className="picker-scroll max-h-56 overflow-y-auto py-1">
        {filtered.map((op) => (
          <li key={op.id}>
            <button
              type="button"
              onClick={() => onSelect(op)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[rgb(var(--card-hover))] ${
                value === op.id ? "bg-brand/5" : ""
              }`}
            >
              <OperationIcon id={op.id} className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="flex-1">{op.label}</span>
              {value === op.id ? (
                <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </button>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-[rgb(var(--muted))]">No operations found</li>
        ) : null}
      </ul>
    </div>
  );
}

function FormatPanel({
  options,
  value,
  search,
  onSearchChange,
  onSelect,
}: {
  options: PickerOption[];
  value: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const [category, setCategory] = useState("document");

  const categories = useMemo(() => {
    const set = new Set(options.map((o) => o.category));
    return FORMAT_CATEGORY_ORDER.filter((c) => set.has(c));
  }, [options]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options.filter((o) => {
      const matchesCat = q ? true : o.category === category;
      const matchesSearch = !q || o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [options, category, search]);

  useEffect(() => {
    if (categories.length && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  return (
    <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft">
      <SearchField value={search} onChange={onSearchChange} placeholder="Search Format" />
      <div className="flex max-h-64">
        {!search.trim() ? (
          <div className="picker-scroll w-32 shrink-0 overflow-y-auto border-r border-[rgb(var(--border))] py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs capitalize transition ${
                  category === cat
                    ? "bg-brand/10 text-brand"
                    : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--card-hover))]"
                }`}
              >
                {FORMAT_CATEGORY_LABELS[cat] || cat}
                {category === cat ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
        <div className="picker-scroll flex-1 overflow-y-auto p-3">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  value === opt.id
                    ? "border-brand/50 bg-brand/15 text-brand"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--card-hover)/0.5)] hover:border-brand/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-sm text-[rgb(var(--muted))]">No formats found</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatLabel(id: string, options: PickerOption[]) {
  return options.find((o) => o.id === id)?.label || id.toUpperCase();
}

interface CreditsCalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreditsCalculatorModal({ open, onClose }: CreditsCalculatorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [operation, setOperation] = useState<CalculatorOperationDef>(CALCULATOR_OPERATIONS[0]);
  const [inputFormat, setInputFormat] = useState("pdf");
  const [outputFormat, setOutputFormat] = useState("docx");
  const [minutes, setMinutes] = useState("1");
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const [opSearch, setOpSearch] = useState("");
  const [inSearch, setInSearch] = useState("");
  const [outSearch, setOutSearch] = useState("");

  const inputOptions = useMemo(
    () => ALL_FORMATS.map((f) => ({ id: f.id, label: f.label, category: f.category })),
    []
  );

  const outputOptions = useMemo(() => getOutputFormatOptions(inputFormat), [inputFormat]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openPanel) setOpenPanel(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, openPanel, onClose]);

  useEffect(() => {
    if (!open) {
      setOpenPanel(null);
      setOpSearch("");
      setInSearch("");
      setOutSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (!outputOptions.some((o) => o.id === outputFormat)) {
      setOutputFormat(outputOptions[0]?.id || "docx");
    }
  }, [outputOptions, outputFormat]);

  const parsedMinutes = Math.max(0.1, Number(minutes) || 1);
  const estimate = estimateJobCredits({
    operation: operation.id,
    inputFormat,
    outputFormat: operation.needsOutput ? outputFormat : undefined,
    minutes: parsedMinutes,
  });

  const selectOperation = (op: CalculatorOperationDef) => {
    setOperation(op);
    if (op.defaultInput) setInputFormat(op.defaultInput);
    if (op.defaultOutput) setOutputFormat(op.defaultOutput);
    setOpenPanel(null);
    setOpSearch("");
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh] backdrop-blur-sm sm:items-center sm:pt-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modern-card w-full max-w-md p-5 shadow-glow sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="credits-calculator-title"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 id="credits-calculator-title" className="text-lg font-bold">
            Credits Calculator
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Operation */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--muted))]">Operation</label>
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "operation" ? null : "operation")}
              className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-left text-sm transition hover:border-brand/30"
            >
              <OperationIcon id={operation.id} className="h-4 w-4 text-[rgb(var(--muted))]" />
              <span className="flex-1">{operation.label}</span>
              <ChevronDown open={openPanel === "operation"} />
            </button>
            {openPanel === "operation" ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-1">
                <OperationPanel
                  value={operation.id}
                  search={opSearch}
                  onSearchChange={setOpSearch}
                  onSelect={selectOperation}
                />
              </div>
            ) : null}
          </div>

          {/* Input format */}
          {operation.needsInput ? (
            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--muted))]">Input Format</label>
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === "input" ? null : "input")}
                className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-left text-sm transition hover:border-brand/30"
              >
                <span className={inputFormat ? "" : "text-[rgb(var(--muted))]"}>
                  {inputFormat ? formatLabel(inputFormat, inputOptions) : "Select format..."}
                </span>
                <span className="flex-1" />
                <ChevronDown open={openPanel === "input"} />
              </button>
              {openPanel === "input" ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1">
                  <FormatPanel
                    options={inputOptions}
                    value={inputFormat}
                    search={inSearch}
                    onSearchChange={setInSearch}
                    onSelect={(id) => {
                      setInputFormat(id);
                      setOpenPanel(null);
                      setInSearch("");
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Output format */}
          {operation.needsOutput ? (
            <div className="relative">
              <label className="mb-1.5 block text-sm font-medium text-[rgb(var(--muted))]">Output Format</label>
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === "output" ? null : "output")}
                className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-left text-sm transition hover:border-brand/30"
              >
                <span className={outputFormat ? "" : "text-[rgb(var(--muted))]"}>
                  {outputFormat ? formatLabel(outputFormat, outputOptions) : "Select format..."}
                </span>
                <span className="flex-1" />
                <ChevronDown open={openPanel === "output"} />
              </button>
              {openPanel === "output" ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1">
                  <FormatPanel
                    options={outputOptions}
                    value={outputFormat}
                    search={outSearch}
                    onSearchChange={setOutSearch}
                    onSelect={(id) => {
                      setOutputFormat(id);
                      setOpenPanel(null);
                      setOutSearch("");
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Duration */}
          <div>
            <label htmlFor="calc-duration" className="mb-1.5 block text-sm font-medium text-[rgb(var(--muted))]">
              Estimated duration (minutes)
            </label>
            <input
              id="calc-duration"
              type="number"
              min={0.1}
              step={0.5}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="input-modern"
            />
          </div>

          {/* Result */}
          <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-[rgb(var(--muted))]">Estimated credits</span>
              <span className="text-3xl font-bold tabular-nums text-brand">{estimate.total}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
              Base {estimate.base} credit{estimate.base !== 1 ? "s" : ""}
              {estimate.extraMinutes > 0
                ? ` + ${estimate.extraMinutes} extra minute${estimate.extraMinutes !== 1 ? "s" : ""}`
                : ""}
              . Only successful jobs are charged.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
