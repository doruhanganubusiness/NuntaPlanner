import { DeleteWeddingButton } from "@/components/dashboard/delete-wedding-button";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CalendarHeart, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: weddings } = await supabase
    .from("weddings")
    .select("*")
    .order("created_at", { ascending: false });

  const list = weddings ?? [];

  if (list.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold">Să începem planificarea</h1>
        <p className="mt-1 text-muted-foreground">
          Completează ce știi acum — restul îl poți ajusta oricând din tab-uri.
          Câmpurile sunt opționale.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nunțile tale</h1>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4" /> Nuntă nouă
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((w) => (
          <div key={w.id} className="relative">
            <Link href={`/dashboard/${w.id}`} className="block">
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <CalendarHeart className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2 pr-8">{w.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {w.wedding_date ?? "Dată nestabilită"}
                  </p>
                </CardContent>
              </Card>
            </Link>
            <div className="absolute right-2 top-2">
              <DeleteWeddingButton weddingId={w.id} iconOnly />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
