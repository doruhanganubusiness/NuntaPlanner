"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Meniul principal al site-ului — linkuri către paginile publice.
 * Momentan există o singură pagină de site („Pentru miri”); lista e gândită
 * să crească ușor pe măsură ce apar pagini noi.
 */
export const SITE_NAV = [
  { href: "/pentru-miri", label: "Pentru miri" },
  { href: "/pentru-furnizori", label: "Pentru furnizori" },
  { href: "/furnizori", label: "Director furnizori" },
  { href: "/zone", label: "Zone" },
  { href: "/blog", label: "Blog" },
] as const;

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {SITE_NAV.map((it) => {
        const active =
          pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
