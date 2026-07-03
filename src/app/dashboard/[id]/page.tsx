import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCalculations } from "@/lib/wedding/calculations";
import { musicLabel } from "@/lib/wedding/labels";
import { createClient } from "@/lib/supabase/server";
import { formatNum, formatRON } from "@/lib/utils";
import { CalendarDays, Users, Wine } from "lucide-react";
import Link from "next/link";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const { data: slots } = await supabase
    .from("event_slots")
    .select("*")
    .eq("wedding_id", id);

  const calc = await getCalculations(supabase, id);
  const results = calc?.results;

  const totalGuests = (slots ?? []).reduce(
    (s, x) => s + x.guests_adults + x.guests_children,
    0,
  );

  const daysLeft =
    wedding?.wedding_date != null
      ? Math.ceil(
          (new Date(wedding.wedding_date).getTime() - Date.now()) /
            86_400_000,
        )
      : null;

  // Progres de planificare — câte informații-cheie sunt completate.
  const checks = [
    !!wedding?.region,
    wedding?.date_status !== "undecided",
    (wedding?.wedding_type?.length ?? 0) > 0,
    !!wedding?.style,
    (slots?.length ?? 0) > 0,
    (slots ?? []).some((s) => s.slot_type === "reception"),
    totalGuests > 0,
    wedding?.total_budget != null,
  ];
  const progress = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Progres planificare</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm text-muted-foreground">
              Data nunții
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {daysLeft != null
                ? daysLeft >= 0
                  ? `${daysLeft} zile`
                  : "A trecut"
                : "Nestabilită"}
            </p>
            <p className="text-sm text-muted-foreground">
              {wedding?.wedding_date
                ? wedding.date_status === "estimated"
                  ? `${wedding.wedding_date} (dată estimată)`
                  : wedding.wedding_date
                : "Adaugă data în Detalii"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm text-muted-foreground">
              Invitați (total sloturi)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNum(totalGuests)}</p>
            <p className="text-sm text-muted-foreground">
              {slots?.length ?? 0} sloturi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Wine className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm text-muted-foreground">
              Buget total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatRON(
                results?.budget?.effectiveTotalRON ??
                  wedding?.total_budget ??
                  null,
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {results?.budget?.usingRecommended
                ? "Buget recomandat (poți introduce al tău)"
                : wedding?.drink_mode === "cost"
                  ? "Băutură inclusă în meniu"
                  : "Băutură calculată separat"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recomandări rapide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results ? (
            <>
              {results.music && (
                <Row
                  label="Muzică"
                  value={musicLabel(results.music.recommendation)}
                />
              )}
              {results.venue && (
                <Row
                  label="Sală"
                  value={`~${formatNum(results.venue.recommendedSqm)} mp · ${
                    results.venue.roundTables
                  } mese`}
                />
              )}
              {results.drinks.mode === "quantities" &&
                results.drinks.quantities && (
                  <Row
                    label="Vin"
                    value={`${results.drinks.quantities.wine.bottles} sticle`}
                  />
                )}
              {results.warnings.length > 0 && (
                <div className="pt-2">
                  {results.warnings.map((w, i) => (
                    <Badge key={i} tone="warning" className="mr-2">
                      {w}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href={`/dashboard/${id}/plan`}>Vezi planul complet</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Adaugă sloturi ca să primești recomandări.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
