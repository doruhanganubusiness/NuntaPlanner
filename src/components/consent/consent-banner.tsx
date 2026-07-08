"use client";

import {
  ALL_DENIED,
  ALL_GRANTED,
  readConsent,
  writeConsent,
  type ConsentCategories,
} from "@/lib/consent";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Eveniment prin care butonul „Setări cookies" redeschide bannerul. */
export const OPEN_CONSENT_EVENT = "np-open-consent";

type CategoryDef = {
  key: keyof ConsentCategories;
  title: string;
  description: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "preferences",
    title: "Preferințe",
    description:
      "Rețin opțiuni precum limba, localitatea sau alte setări, ca să nu le reintroduci de fiecare dată.",
  },
  {
    key: "statistics",
    title: "Statistici",
    description:
      "Ne ajută să înțelegem anonim cum este folosit site-ul (pagini vizitate, trafic), prin Google Analytics, ca să îl îmbunătățim.",
  },
  {
    key: "marketing",
    title: "Marketing",
    description:
      "Folosite pentru a măsura campaniile și a-ți afișa conținut relevant pe alte platforme.",
  },
];

/**
 * Bannerul de consimțământ pentru cookies. Apare la prima vizită (când nu există
 * cookie-ul `np_consent`) și poate fi redeschis oricând din footer sau din Politica
 * de cookies. Patru categorii: Strict necesare, Preferințe, Statistici, Marketing.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [choices, setChoices] = useState<ConsentCategories>(ALL_DENIED);

  useEffect(() => {
    let active = true;
    // Prima vizită: fără decizie salvată => afișăm bannerul. Amânat într-un
    // microtask ca să nu fie un setState sincron în corpul efectului.
    queueMicrotask(() => {
      if (active && !readConsent()) setOpen(true);
    });

    const reopen = () => {
      const current = readConsent();
      setChoices(
        current
          ? {
              preferences: current.preferences,
              statistics: current.statistics,
              marketing: current.marketing,
            }
          : ALL_DENIED,
      );
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      active = false;
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  if (!open) return null;

  const decide = (categories: ConsentCategories) => {
    writeConsent(categories);
    setOpen(false);
    setDetails(false);
  };

  const toggle = (key: keyof ConsentCategories) =>
    setChoices((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div
      role="dialog"
      aria-label="Preferințe cookie-uri"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
        <h2 className="text-base font-semibold">Preferințe cookie-uri</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Folosim cookie-uri pentru a face site-ul să funcționeze și, cu acordul
          tău, pentru preferințe, statistici și marketing. Poți afla mai multe în{" "}
          <Link
            href="/politica-cookies"
            className="text-primary underline underline-offset-4"
          >
            Politica de cookies
          </Link>
          .
        </p>

        {details && (
          <div className="mt-4 space-y-2">
            {/* Strict necesare — mereu active */}
            <CategoryRow
              title="Strict necesare"
              description="Esențiale pentru funcționarea site-ului: autentificare, securitate, păstrarea sesiunii și a alegerii tale privind cookie-urile. Nu pot fi dezactivate."
              checked
              disabled
            />
            {CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                title={cat.title}
                description={cat.description}
                checked={choices[cat.key]}
                onChange={() => toggle(cat.key)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {details ? (
            <button
              type="button"
              onClick={() => decide(choices)}
              className="order-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:order-none"
            >
              Salvează preferințele
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDetails(true)}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Personalizează
            </button>
          )}
          <button
            type="button"
            onClick={() => decide(ALL_DENIED)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Respinge neesențiale
          </button>
          <button
            type="button"
            onClick={() => decide(ALL_GRANTED)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Acceptă tot
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-primary"
      />
    </label>
  );
}
