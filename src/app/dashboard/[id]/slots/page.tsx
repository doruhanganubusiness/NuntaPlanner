import { SlotsManager } from "@/components/dashboard/slots-manager";
import { createClient } from "@/lib/supabase/server";

export default async function SlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("event_slots")
    .select("*")
    .eq("wedding_id", id)
    .order("order_index", { ascending: true });

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Programul zilei</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Adaugă fiecare moment — cununie, botez, petrecere — cu invitații lui.
      </p>
      <SlotsManager weddingId={id} initialSlots={slots ?? []} />
    </div>
  );
}
