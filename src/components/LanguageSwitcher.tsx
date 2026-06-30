import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { UI_LANGUAGES, type Locale } from "../i18n/languages";
import { useI18n } from "../i18n/I18nContext";
import FlagIcon from "./FlagIcon";

const ITEM_HEIGHT = 40;
const PANEL_PADDING = 12;
const VIEWPORT_PAD = 8;

function computePosition(btn: HTMLButtonElement) {
  const rect = btn.getBoundingClientRect();
  const width = 200;
  const naturalHeight = UI_LANGUAGES.length * ITEM_HEIGHT + PANEL_PADDING;

  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
  const spaceAbove = rect.top - VIEWPORT_PAD;

  const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
  const maxHeight = Math.min(openUp ? spaceAbove : spaceBelow, 360, naturalHeight);

  let top = openUp ? rect.top - maxHeight - VIEWPORT_PAD : rect.bottom + VIEWPORT_PAD;
  top = Math.max(VIEWPORT_PAD, top);

  let left = rect.right - width;
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));

  return { top, left, width, maxHeight };
}

export default function LanguageSwitcher() {
  const { locale, setLocale, currentLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200, maxHeight: 360 });

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    setPos(computePosition(btn));
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Language: ${currentLanguage.label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-sm transition ${
          open
            ? "border-brand/50 bg-brand/10"
            : "border-[rgb(var(--border))] hover:border-brand/40 hover:bg-[rgb(var(--card-hover))]"
        }`}
      >
        <FlagIcon country={currentLanguage.country} className="h-3.5 w-[1.375rem]" />
        <span className="max-w-[5.5rem] truncate text-xs sm:max-w-none sm:text-sm">
          {currentLanguage.label}
        </span>
        <svg
          className={`h-3 w-3 shrink-0 opacity-60 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Select language"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
            className="modern-card fixed z-[200] overflow-y-auto overscroll-contain p-1 shadow-soft-lg picker-scroll"
          >
            {UI_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={locale === lang.code}
                onClick={() => {
                  setLocale(lang.code as Locale);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-brand/10 ${
                  locale === lang.code ? "bg-brand/10 text-brand" : ""
                }`}
              >
                <FlagIcon country={lang.country} className="h-3.5 w-[1.375rem]" />
                <span className="min-w-0 flex-1 truncate">{lang.label}</span>
                {locale === lang.code && (
                  <svg className="ml-auto h-3.5 w-3.5 shrink-0 text-brand" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
