import {
  VendorMessages,
  type VendorConversation,
} from "@/components/vendor/vendor-messages";
import { getCurrentProfile } from "@/lib/auth/profile";
import { pageMeta } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { VendorLeadRow } from "@/lib/supabase/database.types";
import { redirect } from "next/navigation";

export const metadata = pageMeta({
  title: "Mesaje — NuntaPlanner",
  description:
    "Mesageria furnizorului: toate conversațiile cu cuplurile care ți-au deblocat cererea, într-un singur loc.",
  path: "/vendor/mesaje",
});

export default async function VendorMessagesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  if (!profile) redirect("/login");
  if (profile.user_type !== "vendor") redirect("/dashboard");

  const { data: leadsData } = await supabase.rpc("vendor_leads");
  const leads = (leadsData ?? []) as VendorLeadRow[];
  // Chatul e disponibil doar pe lead-urile deblocate.
  const conversations: VendorConversation[] = leads
    .filter((l) => l.is_unlocked_by_vendor)
    .map((l) => ({
      id: l.id,
      clientEmail: l.client_email,
      clientPhone: l.client_phone,
      region: l.event_region,
      eventDate: l.event_date,
      createdAt: l.created_at,
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mesaje</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversațiile tale cu cuplurile. Apar aici după ce le deblochezi
          cererea din pagina de lead-uri.
        </p>
      </div>
      <VendorMessages conversations={conversations} />
    </div>
  );
}
