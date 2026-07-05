import { VendorGalleryManager } from "@/components/vendor/vendor-gallery-manager";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { VendorMediaRow } from "@/lib/supabase/database.types";
import { MAX_VENDOR_IMAGES, MAX_VENDOR_VIDEOS } from "@/lib/vendors/media";
import { redirect } from "next/navigation";

export default async function VendorGalleryPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!vendor) redirect("/vendor/onboarding");

  const { data } = await supabase
    .from("vendor_media")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("type")
    .order("position");
  const media = (data ?? []) as VendorMediaRow[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Galerie</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adaugă până la {MAX_VENDOR_IMAGES} imagini și {MAX_VENDOR_VIDEOS}{" "}
          videoclipuri. Apar pe profilul tău public și atrag mai multe cereri.
        </p>
      </div>
      <VendorGalleryManager
        vendorId={vendor.id}
        userId={profile.id}
        initial={media}
      />
    </div>
  );
}
