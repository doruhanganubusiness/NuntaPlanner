import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { VendorLeadRow, VendorStatus } from "@/lib/supabase/database.types";
import { TIER_PRICING, categoryLabel } from "@/lib/vendors/categories";
import { getActiveSubscription } from "@/lib/vendors/subscription";
import Link from "next/link";
import { redirect } from "next/navigation";

const STATUS: Record<
  VendorStatus,
  { label: string; tone: "success" | "warning" | "muted"; hint: string }
> = {
  pending: {
    label: "În verificare",
    tone: "warning",
    hint: "Profilul tău e în curs de verificare. Vei apărea în director după aprobare.",
  },
  active: {
    label: "Activ",
    tone: "success",
    hint: "Profilul tău e public în directorul de furnizori.",
  },
  suspended: {
    label: "Suspendat",
    tone: "muted",
    hint: "Profilul a fost suspendat. Contactează echipa pentru detalii.",
  },
  inactive: {
    label: "Inactiv",
    tone: "muted",
    hint: "Profilul e inactiv și nu apare în director.",
  },
};

export default async function VendorOverview() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/onboarding");

  const { data: leadsData } = await supabase.rpc("vendor_leads");
  const leads = (leadsData ?? []) as VendorLeadRow[];
  const count = (s: string) => leads.filter((l) => l.status === s).length;

  const sub = await getActiveSubscription(supabase, vendor.id);
  const st = STATUS[vendor.status];
  const pricing = TIER_PRICING[vendor.tier];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
          <p className="text-sm text-muted-foreground">
            {categoryLabel(vendor.category)} · {vendor.regions.length} regiuni
          </p>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        {st.hint}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Lead-uri totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Noi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{count("new")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Convertite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{count("converted")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model de plată</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Tier <b>{pricing.label}</b> — {pricing.cplRON} RON per lead deblocat
            sau {pricing.monthlyRON} RON/lună abonament.
          </p>
          {sub ? (
            <p className="text-success">
              Ai abonament activ — deblochezi contactele nelimitat, fără costuri
              per lead.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Vezi cererile primite cu contactul mascat și plătești{" "}
              {pricing.cplRON} RON per lead ca să dezvălui contactul mirelui.
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/vendor/leads">Vezi lead-urile</Link>
            </Button>
            <Button variant={sub ? "ghost" : "outline"} size="sm" asChild>
              <Link href="/vendor/subscription">
                {sub ? "Gestionează abonamentul" : "Activează abonamentul"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
