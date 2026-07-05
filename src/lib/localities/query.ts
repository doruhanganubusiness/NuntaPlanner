import type { Database } from "@/lib/supabase/database.types";
import { slugify } from "@/lib/localities/geo";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Rezolvă numele canonic al unei localități dintr-un slug, în interiorul unui
 * județ. Localitățile unui județ (index pe county_code) se aduc și se compară
 * pe slug în JS — slugify nu e ușor de reprodus în SQL.
 */
export async function findLocalityName(
  client: SupabaseClient<Database>,
  countyCode: string,
  localitySlug: string,
): Promise<string | null> {
  const { data } = await client
    .from("localities")
    .select("name")
    .eq("county_code", countyCode);
  const match = (data ?? []).find((l) => slugify(l.name) === localitySlug);
  return match?.name ?? null;
}

/** Numele localităților dintr-un județ (ordonate alfabetic). */
export async function listLocalityNames(
  client: SupabaseClient<Database>,
  countyCode: string,
): Promise<string[]> {
  const { data } = await client
    .from("localities")
    .select("name")
    .eq("county_code", countyCode)
    .order("name");
  return (data ?? []).map((l) => l.name);
}
