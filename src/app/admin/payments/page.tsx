import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus, PaymentType } from "@/lib/supabase/database.types";

type PaymentWithVendor = {
  id: string;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  created_at: string;
  vendors: { business_name: string } | null;
};

const TYPE_LABEL: Record<PaymentType, string> = {
  cpl_lead: "Deblocare lead",
  subscription_monthly: "Abonament lunar",
};

const STATUS_TONE: Record<PaymentStatus, "success" | "warning" | "muted"> = {
  succeeded: "success",
  pending: "warning",
  failed: "muted",
  refunded: "muted",
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select(
      "id, amount, currency, payment_type, status, created_at, vendors(business_name)",
    )
    .order("created_at", { ascending: false });
  const payments = (data ?? []) as unknown as PaymentWithVendor[];

  const succeededTotal = payments
    .filter((p) => p.status === "succeeded")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Plăți</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toate încasările platformei. Total reușit:{" "}
          <b>{succeededTotal.toLocaleString("ro-RO")} RON</b>.
        </p>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio plată încă.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium">Furnizor</th>
                <th className="px-4 py-2 font-medium">Tip</th>
                <th className="px-4 py-2 font-medium">Sumă</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-2">
                    {p.vendors?.business_name ?? "—"}
                  </td>
                  <td className="px-4 py-2">{TYPE_LABEL[p.payment_type]}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">
                    {Number(p.amount).toLocaleString("ro-RO")} {p.currency}
                  </td>
                  <td className="px-4 py-2">
                    <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
