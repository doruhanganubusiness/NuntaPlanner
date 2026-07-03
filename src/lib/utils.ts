import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combină clase Tailwind, rezolvând conflictele. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatează o sumă în RON. */
export function formatRON(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatează un număr cu separatori (ex. litri, pahare). */
export function formatNum(value: number | null | undefined, digits = 0): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: digits,
  }).format(value);
}
