import { LogoutButton } from "@/components/dashboard/logout-button";
import { Logo } from "@/components/logo";
import { MainNav, MobileNav } from "@/components/main-nav";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Furnizorii au dashboard-ul lor — nu au ce căuta în cel al mirilor.
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.user_type === "vendor") redirect("/vendor");

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <MainNav />
            <LogoutButton />
            <MobileNav />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
