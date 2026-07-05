import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SubscriptionRow } from "@/lib/supabase/database.types";

/**
 * Abonamentul activ al unui furnizor, sau null. Sursă de adevăr = tabela
 * `subscriptions`: rând `active` a cărui dată de reînnoire nu a trecut încă.
 * (Reînnoirea automată se reconciliază printr-un webhook Stripe într-un
 * increment ulterior; până atunci accesul e valabil până la `next_renewal_date`.)
 */
export async function getActiveSubscription(
  client: SupabaseClient<Database>,
  vendorId: string,
): Promise<SubscriptionRow | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await client
    .from("subscriptions")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  if (data.next_renewal_date && data.next_renewal_date < today) return null;
  return data;
}

/** True dacă furnizorul are abonament activ (deblochează lead-urile gratis). */
export async function hasActiveSubscription(
  client: SupabaseClient<Database>,
  vendorId: string,
): Promise<boolean> {
  return (await getActiveSubscription(client, vendorId)) !== null;
}
