"use client";

import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Navigația de cont din header-ul public.
 * - Desktop (≥ sm): butoanele Autentificare / Începe gratuit vizibile.
 * - Mobil (< sm): o iconiță de cont care deschide un drop-down cu aceleași opțiuni.
 */
export function HeaderAuthNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="flex items-center gap-2">
      {/* Desktop */}
      <div className="hidden items-center gap-2 sm:flex">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Autentificare</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Începe gratuit</Link>
        </Button>
      </div>

      {/* Mobil */}
      <div className="relative sm:hidden" ref={ref}>
        <Button
          variant="outline"
          size="icon"
          aria-label="Cont"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <UserRound className="h-5 w-5" />
        </Button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-border bg-card p-1 shadow-lg"
            >
              <Link
                href="/login"
                role="menuitem"
                className="block rounded px-3 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Autentificare
              </Link>
              <Link
                href="/register"
                role="menuitem"
                className="block rounded px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Începe gratuit
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
