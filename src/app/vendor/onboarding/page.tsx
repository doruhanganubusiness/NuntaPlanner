import { Card, CardContent } from "@/components/ui/card";
import { VendorForm } from "@/components/vendor/vendor-form";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VendorOnboardingPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (vendor) redirect("/vendor");

  // Denumirea + telefonul completate la înregistrare (metadata cont) precompletează.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = (user?.user_metadata ?? {}) as {
    business_name?: string;
    phone?: string;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profilul tău de furnizor</h1>
        <p className="mt-1 text-muted-foreground">
          Completează datele afacerii. După ce trimiți, echipa verifică profilul
          înainte să apară în directorul public.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <VendorForm
            userId={profile.id}
            defaultEmail={profile.email}
            defaultBusinessName={meta.business_name ?? null}
            defaultPhone={meta.phone ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
