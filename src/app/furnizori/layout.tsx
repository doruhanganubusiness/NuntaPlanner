import { HeaderAuthNav } from "@/components/header-auth-nav";
import { Logo } from "@/components/logo";
import { MainNav, MobileNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";

export default function FurnizoriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
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

      <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>

      <SiteFooter />
    </main>
  );
}
