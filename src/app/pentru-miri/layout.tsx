import { HeaderAuthNav } from "@/components/header-auth-nav";
import { Logo } from "@/components/logo";
import { MainNav, MobileNav } from "@/components/main-nav";
import { PentruMiriNav } from "@/components/marketing/pentru-miri-nav";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";

export default function PentruMiriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <header className="border-b border-border bg-card">
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

      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <PentruMiriNav />
        <div className="py-8">{children}</div>
      </div>

      <SiteFooter />
    </main>
  );
}
