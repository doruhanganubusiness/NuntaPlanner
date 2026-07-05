"use client";

import { cn } from "@/lib/utils";
import { NAV_TREE, flattenChildren, isActive } from "@/lib/site-nav";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/* ==================================================================== */
/*  Desktop / tabletă — bară + mega-menu                                 */
/* ==================================================================== */

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpenMenu(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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

  const active = NAV_TREE.find((n) => n.href === openMenu);

  return (
    <nav
      ref={ref}
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
              onMouseEnter={() => setOpenMenu(null)}
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
  );
}

/* ==================================================================== */
/*  Mobil — buton toggle (colț dreapta-sus) + acordeon cu căutare        */
/* ==================================================================== */

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
    setExpanded(null);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleParent(href: string) {
    setQuery("");
    setExpanded((e) => (e === href ? null : href));
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div ref={ref} className={cn("relative md:hidden", className)}>
      <button
        type="button"
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-[80vh] w-[min(20rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border-2 border-foreground bg-card shadow-2xl">
            <ul className="divide-y divide-border">
              {NAV_TREE.map((parent) => {
                const on = isActive(pathname, parent.href);
                const isOpen = expanded === parent.href;
                const kids = parent.children ? flattenChildren(parent) : [];
                // Caseta de căutare doar la listele lungi (Director furnizori, Zone).
                const showSearch =
                  parent.href === "/furnizori" || parent.href === "/zone";
                const q = normalize(query.trim());
                const filtered =
                  showSearch && q
                    ? kids.filter((k) => normalize(k.node.label).includes(q))
                    : kids;
                return (
                  <li key={parent.href}>
                    {/* Rând PĂRINTE — contrastant, bold */}
                    <div
                      className={cn(
                        "flex items-stretch",
                        isOpen ? "bg-foreground text-background" : "bg-muted",
                      )}
                    >
                      <Link
                        href={parent.href}
                        onClick={() => setOpen(false)}
                        aria-current={on ? "page" : undefined}
                        className={cn(
                          "flex-1 px-4 py-3 text-base font-semibold",
                          !isOpen && on && "text-primary",
                        )}
                      >
                        {parent.label}
                      </Link>
                      {parent.children && (
                        <button
                          type="button"
                          aria-label={
                            isOpen
                              ? `Restrânge ${parent.label}`
                              : `Extinde ${parent.label}`
                          }
                          aria-expanded={isOpen}
                          onClick={() => toggleParent(parent.href)}
                          className="flex w-12 items-center justify-center"
                        >
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subpagini — vizual distincte (copil); căutare doar la listele lungi */}
                    {isOpen && parent.children && (
                      <div className="bg-card px-2 py-2">
                        {showSearch && (
                          <div className="relative mb-2">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              autoFocus
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder={`Caută în ${parent.label}…`}
                              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        )}
                        <ul className="max-h-64 overflow-y-auto">
                          {filtered.length === 0 && (
                            <li className="px-2 py-1.5 text-sm text-muted-foreground">
                              Niciun rezultat.
                            </li>
                          )}
                          {filtered.map(({ node, depth }) => (
                            <li key={node.href}>
                              <button
                                type="button"
                                onClick={() => go(node.href)}
                                className={cn(
                                  "block w-full rounded-md py-2 pr-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                  isActive(pathname, node.href)
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground",
                                )}
                                style={{ paddingLeft: `${0.5 + depth * 0.6}rem` }}
                              >
                                {node.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
