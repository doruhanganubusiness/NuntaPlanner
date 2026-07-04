import { LogoutButton } from "@/components/dashboard/logout-button";
import { Logo } from "@/components/logo";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  // Zona de admin e ascunsă pentru non-admini.
  if (!profile.is_admin) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/vendors">
              <Logo />
            </Link>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Admin
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">{children}</div>
    </div>
  );
}
