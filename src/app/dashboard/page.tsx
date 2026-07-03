import { CreateWeddingForm } from "@/components/dashboard/create-wedding-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CalendarHeart } from "lucide-react";
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
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <h1 className="text-2xl font-bold">Să începem planificarea</h1>
        <p className="mt-1 text-muted-foreground">
          Creează-ți evenimentul. Poți completa restul detaliilor oricând.
        </p>
        <Card className="mt-6">
          <CardContent className="pt-6">
            <CreateWeddingForm />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nunțile tale</h1>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((w) => (
          <Link key={w.id} href={`/dashboard/${w.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CalendarHeart className="h-6 w-6 text-primary" />
                <CardTitle className="mt-2">{w.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {w.locality
                    ? `${w.locality}, ${w.county}`
                    : (w.county ?? "Locație necompletată")}{" "}
                  · {w.wedding_date ?? "dată nestabilită"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 max-w-md">
        <CardHeader>
          <CardTitle>Creează o nuntă nouă</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWeddingForm />
        </CardContent>
      </Card>
    </main>
  );
}
