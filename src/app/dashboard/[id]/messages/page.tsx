import {
  CoupleMessages,
  type CoupleConversationItem,
} from "@/components/dashboard/couple-messages";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/supabase/database.types";

type SentLead = {
  id: string;
  status: LeadStatus;
  vendor_id: string;
  created_at: string;
  vendors: { business_name: string; category: string } | null;
};

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, status, vendor_id, created_at, vendors(business_name, category)")
    .eq("wedding_id", id)
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as unknown as SentLead[];

  const conversations: CoupleConversationItem[] = leads.map((l) => ({
    id: l.id,
    vendorName: l.vendors?.business_name ?? "Furnizor",
    category: l.vendors?.category ?? null,
    status: l.status,
    createdAt: l.created_at,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Mesaje</h2>
        <p className="text-sm text-muted-foreground">
          Conversațiile tale cu furnizorii. Poți scrie oricând — furnizorul îți
          vede mesajele după ce îți deblochează cererea.
        </p>
      </div>
      <CoupleMessages conversations={conversations} />
    </div>
  );
}
