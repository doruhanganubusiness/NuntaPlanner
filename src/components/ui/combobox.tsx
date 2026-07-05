"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ComboOption = { value: string; label: string };

/** Elimină diacriticele + lowercase, pentru căutare tolerantă (ex. „targu" → „Târgu"). */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Select cu casetă de căutare — pentru liste lungi (județe, localități, categorii).
 * Single-select controlat. Valoarea "" = nimic selectat (afișează placeholder).
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder = "Alege…",
  searchPlaceholder = "Caută…",
  emptyText = "Niciun rezultat.",
  disabled,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const q = normalize(query.trim());
  const filtered = q
    ? options.filter((o) => normalize(o.label).includes(q))
    : options;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <ul className="max-h-60 overflow-auto p-1" role="listbox">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {emptyText}
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    o.value === value && "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {o.value === value && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
