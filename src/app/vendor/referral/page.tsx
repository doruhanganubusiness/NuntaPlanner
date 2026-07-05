import { ReferralPanel } from "@/components/vendor/referral-panel";
import { getCurrentProfile } from "@/lib/auth/profile";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { VendorReferralRow } from "@/lib/supabase/database.types";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Recomandă furnizori — NuntaPlanner",
  description:
    "Invită alți furnizori pe NuntaPlanner. Când sunt verificați, primești o lună de abonament gratuită.",
  path: "/vendor/referral",
});

export default async function VendorReferralPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, referral_code")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/onboarding");

  const { data: referralsData } = await supabase.rpc("vendor_referrals");
  const referrals = (referralsData ?? []) as VendorReferralRow[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Recomandă furnizori</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invită colegi din industrie. Pentru fiecare furnizor pe care îl aduci
          și e verificat de platformă, primești o lună de abonament gratuită
          (maxim 5 pe lună).
        </p>
      </div>

      <ReferralPanel code={vendor.referral_code} referrals={referrals} />
    </div>
  );
}
