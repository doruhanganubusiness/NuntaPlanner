import { AdminVendorList } from "@/components/admin/admin-vendor-list";
import { createClient } from "@/lib/supabase/server";

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  // RLS: adminul vede toți furnizorii (is_admin()).
  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  const list = vendors ?? [];
  // Pending înainte, ca aprobările să fie ușor de găsit.
  list.sort((a, b) => (a.status === "pending" ? -1 : 0) - (b.status === "pending" ? -1 : 0));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Furnizori</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifică și aprobă furnizorii înainte să apară în directorul public.
        </p>
      </div>
      <AdminVendorList initial={list} />
    </div>
  );
}
