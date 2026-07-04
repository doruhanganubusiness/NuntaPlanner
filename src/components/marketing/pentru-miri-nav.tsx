"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Paginile secțiunii „Pentru miri” — pagina umbrelă + o subpagină per TAB. */
export const PENTRU_MIRI_PAGES = [
  { href: "/pentru-miri", label: "Prezentare" },
  { href: "/pentru-miri/panou-general", label: "Panou general" },
  { href: "/pentru-miri/detalii", label: "Detalii" },
  { href: "/pentru-miri/sloturi", label: "Sloturi" },
  { href: "/pentru-miri/buget", label: "Buget" },
  { href: "/pentru-miri/plan", label: "Plan" },
  { href: "/pentru-miri/invitatie", label: "Invitație" },
  { href: "/pentru-miri/membri", label: "Membri" },
] as const;

export function PentruMiriNav() {
  const pathname = usePathname();

  return (
    // Pastile pe mai multe rânduri — toate paginile vizibile pe mobil.
    <nav className="flex flex-wrap gap-2">
      {PENTRU_MIRI_PAGES.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
