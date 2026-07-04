import { BudgetForm } from "@/components/dashboard/budget-form";
import { Donut, type DonutSegment } from "@/components/dashboard/donut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCalculations } from "@/lib/wedding/calculations";
import { createClient } from "@/lib/supabase/server";
import { formatRON } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function BudgetPage({
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
  if (!wedding) notFound();

  const calc = await getCalculations(supabase, id);
  const budget = calc?.results.budget;
  const segments: DonutSegment[] =
    budget?.allocations.map((a) => ({
      label: a.label,
      pct: a.pct,
      amount: a.amountRON,
    })) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Buget & priorități</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm
            wedding={wedding}
            recommendedTotal={budget?.recommendedTotalRON ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alocare estimată</CardTitle>
        </CardHeader>
        <CardContent>
          {segments.length > 0 && budget?.effectiveTotalRON != null ? (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {budget.usingRecommended
                  ? "Pe baza bugetului recomandat"
                  : "Pe baza bugetului tău"}
                : <b className="text-foreground">{formatRON(budget.effectiveTotalRON)}</b>
              </p>
              <Donut segments={segments} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Adaugă un eveniment de petrecere cu invitați pentru a vedea alocarea.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
