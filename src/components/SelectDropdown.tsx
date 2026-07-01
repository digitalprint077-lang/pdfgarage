import { useRef, useState, useEffect, useCallback } from "react";

import { createPortal } from "react-dom";

import FlagIcon from "./FlagIcon";



export interface SelectOption {

  code: string;

  label: string;

  country?: string;

}



interface SelectDropdownProps {

  value: string;

  onChange: (value: string) => void;

  options: SelectOption[];

  ariaLabel?: string;

  compact?: boolean;

}



const ITEM_HEIGHT = 36;

const PANEL_PADDING = 8;

const VIEWPORT_PAD = 8;



function computePosition(btn: HTMLButtonElement, optionCount: number) {

  const rect = btn.getBoundingClientRect();

  const width = Math.max(rect.width, 160);

  const naturalHeight = optionCount * ITEM_HEIGHT + PANEL_PADDING;



  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;

  const spaceAbove = rect.top - VIEWPORT_PAD;



  const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

  const maxHeight = Math.min(openUp ? spaceAbove : spaceBelow, 320, naturalHeight);



  let top = openUp ? rect.top - maxHeight - VIEWPORT_PAD : rect.bottom + VIEWPORT_PAD;

  top = Math.max(VIEWPORT_PAD, top);



  let left = rect.left;

  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));



  return { top, left, width, maxHeight, openUp };
}

export default function SelectDropdown({

  value,

  onChange,

  options,

  ariaLabel,

  compact,

}: SelectDropdownProps) {

  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ top: 0, left: 0, width: 160, maxHeight: 320, openUp: false });



  const selected = options.find((o) => o.code === value) || options[0];



  const updatePosition = useCallback(() => {

    const btn = buttonRef.current;

    if (!btn) return;

    setPos(computePosition(btn, options.length));

  }, [options.length]);



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

        aria-label={ariaLabel || selected.label}

        aria-expanded={open}

        aria-haspopup="listbox"

        className={`inline-flex items-center gap-1.5 rounded-xl border text-sm outline-none transition ${

          compact ? "px-2 py-1.5" : "px-3 py-1.5"

        } ${

          open

            ? "border-brand/50 bg-brand/10 text-brand"

            : "border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-brand/30"

        }`}

      >

        {selected.country ? (

          <FlagIcon country={selected.country} className="h-3 w-[1.125rem]" />

        ) : null}

        <span className="max-w-[7rem] truncate">{selected.label}</span>

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

            aria-label={ariaLabel || "Select option"}

            style={{

              top: pos.top,

              left: pos.left,

              width: pos.width,

              maxHeight: pos.maxHeight,

            }}

            className={`fixed z-[200] overflow-y-auto overscroll-contain rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-1 shadow-soft picker-scroll animate-dropdown-scale-in ${
              pos.openUp ? "origin-bottom" : "origin-top"
            }`}

          >

            {options.map((opt) => (

              <button

                key={opt.code}

                type="button"

                role="option"

                aria-selected={value === opt.code}

                onClick={() => {

                  onChange(opt.code);

                  setOpen(false);

                }}

                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-brand/10 ${

                  value === opt.code ? "bg-brand/10 text-brand" : "text-[rgb(var(--foreground))]"

                }`}

              >

                {opt.country ? (

                  <FlagIcon country={opt.country} className="h-3 w-[1.125rem]" />

                ) : null}

                <span className="min-w-0 flex-1 truncate">{opt.label}</span>

              </button>

            ))}

          </div>,

          document.body

        )}

    </>

  );

}

