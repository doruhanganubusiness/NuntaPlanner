import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function countRows<T extends { count: number | null }>(
  q: PromiseLike<T>,
): Promise<number> {
  return (await q).count ?? 0;
}

function ron(n: number): string {
  return `${n.toLocaleString("ro-RO")} RON`;
}

export default async function AdminOverview() {
  const supabase = await createClient();

  const [
    vendorsTotal,
    vendorsActive,
    vendorsPending,
    leadsTotal,
    leadsUnlocked,
    leadsConverted,
    activeSubs,
  ] = await Promise.all([
    countRows(
      supabase.from("vendors").select("id", { count: "exact", head: true }),
    ),
    countRows(
      supabase
        .from("vendors")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .eq("verified", true),
    ),
    countRows(
      supabase
        .from("vendors")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    countRows(
      supabase.from("leads").select("id", { count: "exact", head: true }),
    ),
    countRows(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("is_unlocked_by_vendor", true),
    ),
    countRows(
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "converted"),
    ),
    countRows(
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ),
  ]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_type, status");
  const succeeded = (payments ?? []).filter((p) => p.status === "succeeded");
  const sumBy = (t: string) =>
    succeeded
      .filter((p) => p.payment_type === t)
      .reduce((s, p) => s + Number(p.amount), 0);
  const cplRevenue = sumBy("cpl_lead");
  const subRevenue = sumBy("subscription_monthly");
  const totalRevenue = cplRevenue + subRevenue;

  const { data: reviews } = await supabase.from("reviews").select("rating");
  const reviewsCount = reviews?.length ?? 0;
  const avgRating = reviewsCount
    ? reviews!.reduce((s, r) => s + r.rating, 0) / reviewsCount
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panou de administrare</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privire de ansamblu asupra platformei.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Furnizori
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total" value={vendorsTotal} />
          <Stat label="Activi & verificați" value={vendorsActive} tone="success" />
          <Stat
            label="În așteptare"
            value={vendorsPending}
            tone={vendorsPending > 0 ? "warning" : "muted"}
            href="/admin/vendors"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Lead-uri
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total cereri" value={leadsTotal} />
          <Stat label="Deblocate" value={leadsUnlocked} />
          <Stat label="Convertite" value={leadsConverted} tone="success" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Venituri
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total încasat" value={ron(totalRevenue)} tone="success" />
          <Stat label="Din CPL (lead-uri)" value={ron(cplRevenue)} />
          <Stat label="Din abonamente" value={ron(subRevenue)} />
        </div>
        <p className="text-xs text-muted-foreground">
          {activeSubs} abonament(e) activ(e). Vezi{" "}
          <Link href="/admin/payments" className="text-primary hover:underline">
            toate plățile
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recenzii
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total recenzii" value={reviewsCount} />
          <Stat
            label="Rating mediu"
            value={reviewsCount ? avgRating.toFixed(1) : "—"}
          />
          <Stat label="Moderare" value="→" href="/admin/reviews" />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "muted",
  href,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "warning" | "muted";
  href?: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-foreground";
  const inner = (
    <Card className={href ? "transition-colors hover:border-primary/40" : ""}>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
