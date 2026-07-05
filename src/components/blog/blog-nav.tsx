"use client";

import { BLOG_CATEGORIES } from "@/lib/blog/wordpress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sub-navigația blogului: toate articolele + categoriile ancoră. */
export function BlogNav() {
  const pathname = usePathname();
  const items = [
    { href: "/blog", label: "Toate" },
    ...BLOG_CATEGORIES.map((c) => ({
      href: `/blog/categorie/${c.slug}`,
      label: c.name,
    })),
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active =
          it.href === "/blog"
            ? pathname === "/blog"
            : pathname === it.href;
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
