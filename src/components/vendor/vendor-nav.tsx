"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/vendor", label: "Overview" },
  { href: "/vendor/leads", label: "Lead-uri" },
  { href: "/vendor/subscription", label: "Abonament" },
  { href: "/vendor/profile", label: "Profil" },
];

export function VendorNav() {
  const pathname = usePathname();
  // Ascuns în timpul onboarding-ului (nu există încă profil de furnizor).
  if (pathname === "/vendor/onboarding") return null;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active =
          it.href === "/vendor"
            ? pathname === "/vendor"
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
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
