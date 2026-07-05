"use client";

import { NAV_TREE, type NavNode } from "@/components/main-nav";
import { Combobox, type ComboOption } from "@/components/ui/combobox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Toate subpaginile (copii + nepoți), etichetate cu părintele pentru context. */
function subpageOptions(): ComboOption[] {
  const out: ComboOption[] = [];
  const walk = (node: NavNode, parentLabel: string) => {
    for (const c of node.children ?? []) {
      out.push({ value: c.href, label: `${parentLabel} · ${c.label}` });
      if (c.children?.length) walk(c, `${parentLabel} · ${c.label}`);
    }
  };
  for (const parent of NAV_TREE) walk(parent, parent.label);
  return out;
}

const SUBPAGES = subpageOptions();

/**
 * Footer-ul site-ului: fundal contrastant (închis), toate paginile-părinte și o
 * casetă de căutare care duce direct la orice subpagină. Component client pentru
 * a putea naviga din caseta de căutare; folosit în toate layout-urile publice.
 */
export function SiteFooter() {
  const router = useRouter();
  const [pick, setPick] = useState("");

  function goToSubpage(href: string) {
    setPick("");
    if (href) router.push(href);
  }

  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-semibold">NuntaPlanner</p>
            <p className="mt-2 text-sm text-background/70">
              Planifică-ți nunta de la zero și găsește furnizori verificați în
              toată țara. Gratuit pentru miri.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <p className="mb-2 text-sm font-medium">Caută o pagină</p>
            <Combobox
              value={pick}
              onChange={goToSubpage}
              options={SUBPAGES}
              placeholder="Toate subpaginile…"
              searchPlaceholder="Caută subpagină…"
            />
          </div>
        </div>

        <nav className="mt-10 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-5">
          {NAV_TREE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-background/80 transition-colors hover:text-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-2 border-t border-background/15 pt-6 text-sm text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} NuntaPlanner. Toate drepturile rezervate.</span>
          <span className="flex flex-wrap gap-4">
            <Link href="/pentru-miri" className="hover:text-background">
              Pentru miri
            </Link>
            <Link href="/pentru-furnizori" className="hover:text-background">
              Pentru furnizori
            </Link>
            <Link href="/register?type=client" className="hover:text-background">
              Începe gratuit
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
