import { HeaderAuthNav } from "@/components/header-auth-nav";
import { Logo } from "@/components/logo";
import { MainNav, MobileNav } from "@/components/main-nav";
import Link from "next/link";

/**
 * Header-ul standard al site-ului: logo + meniul principal (mega-menu pe desktop,
 * buton mobil în colț) + acțiuni de cont. Folosit pe paginile care nu au un layout
 * propriu cu header (login, register), ca meniul din top să existe peste tot.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <MainNav />
          <HeaderAuthNav />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
