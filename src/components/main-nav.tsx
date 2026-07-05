"use client";

import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES } from "@/lib/blog/wordpress";
import { COUNTIES_SORTED, countySlug } from "@/lib/localities/geo";
import { PENTRU_MIRI_PAGES } from "@/components/marketing/pentru-miri-nav";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Un nod din arborele de navigație; poate avea subpagini (recursiv). */
export type NavNode = {
  href: string;
  label: string;
  children?: NavNode[];
};

/**
 * Meniul principal al site-ului, ca arbore: fiecare pagină-părinte listează
 * subpaginile ei (mega-menu pe desktop/tabletă, acordeon pe mobil). Sursele de
 * date sunt constantele deja existente, ca meniul să rămână sincron cu rutele.
 */
export const NAV_TREE: NavNode[] = [
  {
    href: "/pentru-miri",
    label: "Pentru miri",
    children: PENTRU_MIRI_PAGES.filter((p) => p.href !== "/pentru-miri").map(
      (p) => ({ href: p.href, label: p.label }),
    ),
  },
  { href: "/pentru-furnizori", label: "Pentru furnizori" },
  {
    href: "/furnizori",
    label: "Director furnizori",
    children: VENDOR_CATEGORIES_SORTED.map((c) => ({
      href: `/furnizori/categorie/${c.slug}`,
      label: c.label,
    })),
  },
  {
    href: "/zone",
    label: "Zone",
    children: COUNTIES_SORTED.map((c) => ({
      href: `/zone/${countySlug(c)}`,
      label: c.name,
    })),
  },
  {
    href: "/blog",
    label: "Blog",
    children: BLOG_CATEGORIES.map((c) => ({
      href: `/blog/categorie/${c.slug}`,
      label: c.name,
    })),
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null); // mega-menu desktop
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Închide meniurile la schimbarea rutei (ajustare de stare la render, nu în
  // efect — evită regula strictă react-hooks/set-state-in-effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
    setExpanded(new Set());
  }

  // Escape închide tot; click în afară închide mega-menu-ul desktop.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  function toggleExpanded(href: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  const active = NAV_TREE.find((n) => n.href === openMenu);

  return (
    <div ref={rootRef} className="contents">
      {/* ---------- Desktop / tabletă: bară + mega-menu ---------- */}
      <nav
        className={cn(
          "relative hidden items-center gap-1 md:flex",
          className,
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        {NAV_TREE.map((item) => {
          const on = isActive(pathname, item.href);
          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          }
          const isOpen = openMenu === item.href;
          return (
            <div
              key={item.href}
              className="flex items-center"
              onMouseEnter={() => setOpenMenu(item.href)}
            >
              <Link
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "rounded-md py-1.5 pl-3 pr-1 text-sm font-medium transition-colors",
                  on || isOpen
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
              <button
                type="button"
                aria-label={`Subpagini ${item.label}`}
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenMenu((m) => (m === item.href ? null : item.href))
                }
                className={cn(
                  "rounded-md p-1 transition-colors",
                  on || isOpen
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </div>
          );
        })}

        {active?.children && (
          // Panoul e ancorat la dreapta (bara e în partea dreaptă a header-ului),
          // cu pt-2 în loc de mt-2 ca să nu existe „gol" între trigger și panou.
          <div className="absolute right-0 top-full z-50 pt-2">
            <div className="w-[min(44rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-xl">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {active.label}
              </p>
              <ul className="grid max-h-[70vh] grid-cols-2 gap-x-4 gap-y-0.5 overflow-y-auto sm:grid-cols-3">
                {active.children.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(pathname, c.href)
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>

      {/* ---------- Mobil: buton toggle (pătrat outline) + acordeon ---------- */}
      <div className="relative md:hidden">
        <button
          type="button"
          aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {mobileOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 max-h-[80vh] w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl">
            <ul>
              {NAV_TREE.map((node) => (
                <MobileBranch
                  key={node.href}
                  node={node}
                  depth={0}
                  pathname={pathname}
                  expanded={expanded}
                  onToggle={toggleExpanded}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** Un nod al acordeonului mobil — recursiv (părinte → subpagini → subpagini). */
function MobileBranch({
  node,
  depth,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  node: NavNode;
  depth: number;
  pathname: string;
  expanded: Set<string>;
  onToggle: (href: string) => void;
  onNavigate: () => void;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.href);
  const on = isActive(pathname, node.href);

  return (
    <li>
      <div className="flex items-center">
        <Link
          href={node.href}
          onClick={onNavigate}
          aria-current={pathname === node.href ? "page" : undefined}
          className={cn(
            "flex-1 rounded-md py-2 pr-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            depth === 0 ? "font-medium" : "",
            on ? "text-foreground" : "text-muted-foreground",
          )}
          style={{ paddingLeft: `${0.5 + depth * 0.85}rem` }}
        >
          {node.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            aria-label={
              isOpen ? `Restrânge ${node.label}` : `Extinde ${node.label}`
            }
            aria-expanded={isOpen}
            onClick={() => onToggle(node.href)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="border-l border-border/60 pb-1 pl-1">
          {node.children!.map((c) => (
            <MobileBranch
              key={c.href}
              node={c}
              depth={depth + 1}
              pathname={pathname}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
