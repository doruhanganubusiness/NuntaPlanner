"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { seg: "", label: "Overview" },
  { seg: "details", label: "Detalii" },
  { seg: "slots", label: "Sloturi" },
  { seg: "budget", label: "Buget" },
  { seg: "plan", label: "Planul generat" },
  { seg: "members", label: "Membri" },
];

export function SectionNav({ weddingId }: { weddingId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${weddingId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {items.map((it) => {
        const href = it.seg ? `${base}/${it.seg}` : base;
        const active = it.seg
          ? pathname.startsWith(href)
          : pathname === base;
        return (
          <Link
            key={it.seg}
            href={href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
