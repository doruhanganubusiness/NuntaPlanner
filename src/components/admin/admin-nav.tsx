"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Panou" },
  { href: "/admin/vendors", label: "Furnizori" },
  { href: "/admin/payments", label: "Plăți" },
  { href: "/admin/reviews", label: "Recenzii" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active =
          it.href === "/admin"
            ? pathname === "/admin"
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
