import { LogoutButton } from "@/components/dashboard/logout-button";
import { Logo } from "@/components/logo";
import { MainNav, MobileNav } from "@/components/main-nav";
import { VendorNav } from "@/components/vendor/vendor-nav";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  // Doar conturile de furnizor au acces; mirii merg în dashboard-ul lor.
  if (profile.user_type !== "vendor") redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/vendor">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <MainNav />
            <LogoutButton />
            <MobileNav />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <VendorNav />
        <div className="py-6">{children}</div>
      </div>
    </div>
  );
}
