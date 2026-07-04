import { MusicChoiceSelect } from "@/components/dashboard/music-choice-select";
import { PlanActions } from "@/components/dashboard/plan-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCalculations } from "@/lib/wedding/calculations";
import { createClient } from "@/lib/supabase/server";
import { formatNum, formatRON } from "@/lib/utils";
import { musicLabel, slotTypeLabel } from "@/lib/wedding/labels";
import type { SlotType } from "@/lib/engine";

function Line({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const calc = await getCalculations(supabase, id);
  const r = calc?.results;

  if (!r) {
    return (
      <p className="text-sm text-muted-foreground">
        Nu există date suficiente. Adaugă evenimente și un buget.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Planul generat</h2>
        <PlanActions weddingId={id} />
      </div>

      {(r.warnings.length > 0 || r.notes.length > 0) && (
        <div className="space-y-2">
          {r.warnings.map((w, i) => (
            <div
              key={`w${i}`}
              className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning"
            >
              ⚠️ {w}
            </div>
          ))}
          {r.notes.map((n, i) => (
            <div
              key={`n${i}`}
              className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              ℹ️ {n}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Băutură */}
        <Card>
          <CardHeader>
            <CardTitle>Băutură</CardTitle>
          </CardHeader>
          <CardContent>
            {r.drinks.mode === "cost" ? (
              <>
                <Line
                  label="Cost / persoană"
                  value={formatRON(r.drinks.cost?.perPersonRON)}
                />
                <Line
                  label="Cost total băutură"
                  value={formatRON(r.drinks.cost?.totalRON)}
                />
              </>
            ) : r.drinks.quantities ? (
              <>
                <Line
                  label="Vin"
                  value={`${r.drinks.quantities.wine.bottles} sticle`}
                />
                <Line
                  label="Bere"
                  value={`${r.drinks.quantities.beer.bottles} sticle`}
                />
                <Line
                  label="Tărie"
                  value={`${r.drinks.quantities.spirits.bottles} sticle`}
                />
                <Line
                  label="Șampanie"
                  value={`${r.drinks.quantities.champagne.bottles} sticle`}
                />
                <Line
                  label="Apă"
                  value={`${formatNum(r.drinks.quantities.water.liters)} L`}
                />
                <Line
                  label="Sucuri"
                  value={`${formatNum(r.drinks.quantities.juice.liters)} L`}
                />
                <Line
                  label="Pahare (vin / șampanie / apă / tărie)"
                  value={`${r.drinks.quantities.glasses.wine} / ${r.drinks.quantities.glasses.champagne} / ${r.drinks.quantities.glasses.water} / ${r.drinks.quantities.glasses.spirits}`}
                />
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Sală + Muzică */}
        <Card>
          <CardHeader>
            <CardTitle>Sală & Muzică</CardTitle>
          </CardHeader>
          <CardContent>
            {r.venue ? (
              <>
                <Line
                  label="Suprafață recomandată"
                  value={`${formatNum(r.venue.recommendedSqm)} mp`}
                />
                <Line
                  label="Interval"
                  value={`${formatNum(r.venue.minSqm)}–${formatNum(r.venue.maxSqm)} mp`}
                />
                <Line label="Mese rotunde" value={r.venue.roundTables} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Fără petrecere.</p>
            )}
            {r.music && (
              <div className="mt-3">
                <Badge>{musicLabel(r.music.selected)}</Badge>
                {r.music.overridden && (
                  <Badge tone="muted" className="ml-2">
                    recomandat: {musicLabel(r.music.recommendation)}
                  </Badge>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  {r.music.reason}
                </p>
                <MusicChoiceSelect
                  weddingId={id}
                  current={r.music.overridden ? r.music.selected : null}
                  recommendation={r.music.recommendation}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dulciuri */}
        <Card>
          <CardHeader>
            <CardTitle>Dulciuri, tort & mărturii</CardTitle>
          </CardHeader>
          <CardContent>
            <Line label="Tort" value={`${formatNum(r.sweets.totals.cakeKg)} kg`} />
            <Line
              label="Mărturii"
              value={`${formatNum(r.sweets.totals.favors)} buc.`}
            />
            <Line
              label="Candy bar"
              value={`${formatNum(r.sweets.totals.candyBarKg)} kg`}
            />
            <Line
              label="Dulciuri ceremonie"
              value={`${formatNum(r.sweets.totals.civilSweetsKg)} kg`}
            />
            <Line
              label="Șampanie ceremonie"
              value={`${r.sweets.totals.champagneBottles} sticle`}
            />
            <div className="mt-3 space-y-1">
              {r.sweets.perSlot.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {slotTypeLabel(s.slotType as SlotType)}: {s.adults} adulți,{" "}
                  {s.children} copii
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buget */}
        <Card>
          <CardHeader>
            <CardTitle>Buget pe categorii</CardTitle>
          </CardHeader>
          <CardContent>
            {r.budget && r.budget.allocations.length > 0 ? (
              r.budget.allocations.map((a) => (
                <Line
                  key={a.key}
                  label={`${a.label} (${Math.round(a.pct * 100)}%)`}
                  value={a.amountRON != null ? formatRON(a.amountRON) : "—"}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Fără buget.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Calculat: {new Date(calc!.computed_at).toLocaleString("ro-RO")}
        {calc!.cached ? " (din cache)" : ""}
      </p>
    </div>
  );
}
