import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionPanel } from "@/components/vendor/subscription-panel";
import { getCurrentProfile } from "@/lib/auth/profile";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { TIER_PRICING } from "@/lib/vendors/categories";
import { getActiveSubscription } from "@/lib/vendors/subscription";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Abonament furnizor — NuntaPlanner",
  description:
    "Activează abonamentul lunar și deblochează contactele mirilor nelimitat, fără să mai plătești per lead.",
  path: "/vendor/subscription",
});

export default async function VendorSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ active?: string }>;
}) {
  const { active: justActivated } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, tier")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/onboarding");

  const sub = await getActiveSubscription(supabase, vendor.id);
  const pricing = TIER_PRICING[vendor.tier];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Abonament</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tier <b>{pricing.label}</b> — {pricing.monthlyRON} RON/lună sau{" "}
          {pricing.cplRON} RON per lead deblocat.
        </p>
      </div>

      {justActivated && !sub && (
        <div className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          Plată reușită — abonamentul se activează în câteva momente.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Starea abonamentului</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionPanel
            active={sub !== null}
            cancelled={sub?.cancelled_at != null}
            nextRenewalDate={sub?.next_renewal_date ?? null}
            monthlyRON={pricing.monthlyRON}
            tierLabel={`${pricing.cplRON} RON`}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Cu abonament activ, deblochezi contactele din pagina de lead-uri fără
        costuri suplimentare. Anularea păstrează accesul până la finalul
        perioadei plătite.
      </p>
    </div>
  );
}
