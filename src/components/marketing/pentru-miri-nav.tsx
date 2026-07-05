"use client";

import { PENTRU_MIRI_PAGES } from "@/lib/marketing/pentru-miri-pages";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export { PENTRU_MIRI_PAGES };

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
