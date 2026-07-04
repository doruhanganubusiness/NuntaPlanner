import { Card, CardContent } from "@/components/ui/card";
import { VendorForm } from "@/components/vendor/vendor-form";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VendorProfilePage() {
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editează profilul</h1>
      <Card>
        <CardContent className="pt-6">
          <VendorForm
            userId={profile.id}
            defaultEmail={profile.email}
            initial={vendor}
          />
        </CardContent>
      </Card>
    </div>
  );
}
