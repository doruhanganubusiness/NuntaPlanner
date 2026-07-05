"use client";

export type AccountType = "client" | "vendor";

const OPTIONS = [
  { v: "client", label: "Miri" },
  { v: "vendor", label: "Furnizor" },
] as const;

/**
 * Comutator Miri / Furnizor folosit pe paginile de autentificare, ca vizitatorul
 * să aleagă tipul de cont. Valoarea vine din `?type=` sau din alegerea manuală.
 */
export function AccountTypeToggle({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (v: AccountType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.v}
          type="button"
          aria-pressed={value === opt.v}
          onClick={() => onChange(opt.v)}
          className={
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors " +
            (value === opt.v
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:bg-muted")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Normalizează parametrul `?type=` la un AccountType valid (implicit „client"). */
export function accountTypeFromParam(raw: string | null): AccountType {
  return raw === "vendor" ? "vendor" : "client";
}
