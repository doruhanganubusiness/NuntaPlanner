import { HeaderAuthNav } from "@/components/header-auth-nav";
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { PentruMiriNav } from "@/components/marketing/pentru-miri-nav";
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
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <PentruMiriNav />
        <div className="py-8">{children}</div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} NuntaPlanner. Gratuit pentru miri.
          </span>
          <span className="flex gap-4">
            <Link href="/pentru-miri" className="hover:text-foreground">
              Pentru miri
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Începe gratuit
            </Link>
          </span>
        </div>
      </footer>
    </main>
  );
}
