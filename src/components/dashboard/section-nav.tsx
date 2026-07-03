"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { seg: "", label: "Overview" },
  { seg: "details", label: "Detalii" },
  { seg: "slots", label: "Sloturi" },
  { seg: "budget", label: "Buget" },
  { seg: "plan", label: "Plan" },
  { seg: "invitation", label: "Invitație" },
  { seg: "members", label: "Membri" },
];

export function SectionNav({ weddingId }: { weddingId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${weddingId}`;

  return (
    // Pastile care se aranjează pe mai multe rânduri — toate tab-urile vizibile pe mobil.
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const href = it.seg ? `${base}/${it.seg}` : base;
        const active = it.seg ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={it.seg}
            href={href}
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
