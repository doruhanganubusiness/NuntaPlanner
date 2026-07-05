import { NAV_TREE } from "@/lib/site-nav";
import Link from "next/link";
import { Fragment } from "react";

/**
 * Footer-ul site-ului: fundal contrastant (închis), paginile-părinte (cu separator
 * între ele) și zona de copyright la final. Fără linkuri duplicate. Folosit în toate
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

          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 md:justify-end">
            {NAV_TREE.map((item, i) => (
              <Fragment key={item.href}>
                {i > 0 && (
                  <span aria-hidden className="text-background/30">
                    ·
                  </span>
                )}
                <Link
                  href={item.href}
                  className="text-sm font-medium text-background/85 underline-offset-4 transition-colors hover:text-background hover:underline"
                >
                  {item.label}
                </Link>
              </Fragment>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-background/15 pt-6 text-center text-sm text-background/60 md:flex-row md:justify-between md:text-left">
          <span>
            ©{" "}
            <Link
              href="/"
              className="font-medium text-background/85 underline-offset-4 transition-colors hover:text-background hover:underline"
            >
              NuntaPlanner
            </Link>{" "}
            {new Date().getFullYear()}. Toate drepturile rezervate.
          </span>
          <a
            href="https://seo2agency.com/"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 transition-colors hover:text-background hover:underline"
          >
            O platformă marca O2 Digital
          </a>
        </div>
      </div>
    </footer>
  );
}
