import { NAV_TREE } from "@/lib/site-nav";
import Link from "next/link";

/**
 * Footer-ul site-ului: fundal contrastant (închis), paginile-părinte o singură
 * dată și zona de copyright la final. Fără linkuri duplicate. Folosit în toate
 * layout-urile publice + login/register.
 */
export function SiteFooter() {
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

          <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
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
        </div>

        <div className="mt-10 border-t border-background/15 pt-6 text-sm text-background/60">
          © {new Date().getFullYear()} NuntaPlanner. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
