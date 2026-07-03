import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Neautentificat: cere login/register, apoi revine pe acest link.
  if (!user) {
    const next = `/invite/${token}`;
    return (
      <Shell title="Ai o invitație la o nuntă 💍">
        <p className="text-sm text-muted-foreground">
          Autentifică-te sau creează-ți un cont ca să te alături planificării.
        </p>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <Link href={`/register?next=${encodeURIComponent(next)}`}>
              Creează cont
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/login?next=${encodeURIComponent(next)}`}>
              Autentificare
            </Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const { data, error } = await supabase.rpc("accept_invite", {
    p_token: token,
  });

  if (error || !data) {
    return (
      <Shell title="Invitație invalidă">
        <p className="text-sm text-muted-foreground">
          Linkul de invitație nu mai este valid sau a fost deja folosit.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard">Mergi la dashboard</Link>
        </Button>
      </Shell>
    );
  }

  redirect(`/dashboard/${data.wedding_id}`);
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Logo />
          <CardTitle className="mt-2 text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
