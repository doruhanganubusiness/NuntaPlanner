"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

/** Afișare read-only a unui rating (1–5). */
export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= rounded
              ? "fill-current text-warning"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

/** Selector de rating (1–5) pentru formulare. */
export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} stele`}
          onClick={() => onChange(i)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              i <= value
                ? "fill-current text-warning"
                : "text-muted-foreground/40 hover:text-warning",
            )}
          />
        </button>
      ))}
    </span>
  );
}
