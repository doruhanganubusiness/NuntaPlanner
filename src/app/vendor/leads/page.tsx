import { VendorLeadsList } from "@/components/vendor/vendor-leads-list";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { VendorLeadRow } from "@/lib/supabase/database.types";
import { TIER_PRICING } from "@/lib/vendors/categories";
import { redirect } from "next/navigation";

export default async function VendorLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ unlocked?: string }>;
}) {
  const { unlocked } = await searchParams;
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

  const { data } = await supabase.rpc("vendor_leads");
  const leads = (data ?? []) as VendorLeadRow[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Cereri primite</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cererile de la miri. Deblochează contactul pentru a suna sau scrie
          direct.
        </p>
      </div>

      {unlocked && (
        <div className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          Plată reușită! Contactul se dezvăluie în câteva secunde — reîncarcă
          pagina dacă nu apare imediat.
        </div>
      )}

      <VendorLeadsList
        initial={leads}
        unlockPriceRON={TIER_PRICING[vendor.tier].cplRON}
      />
    </div>
  );
}
