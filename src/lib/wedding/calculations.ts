import { computeWedding, stableHash, type EngineResult } from "@/lib/engine";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeEngineOverride, toWeddingInput } from "./compute";

type DB = SupabaseClient<Database>;

export type CalculationsResponse = {
  results: EngineResult;
  cached: boolean;
  computed_at: string;
};

/**
 * Returnează recomandările motorului pentru o nuntă, folosind cache-ul din
 * `calc_results` când inputul nu s-a schimbat. `force` recalculează mereu.
 * Întoarce null dacă nunta nu există / nu e accesibilă (RLS).
 */
export async function getCalculations(
  supabase: DB,
  weddingId: string,
  force = false,
): Promise<CalculationsResponse | null> {
  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .maybeSingle();
  if (!wedding) return null;

  const { data: slots } = await supabase
    .from("event_slots")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("order_index", { ascending: true });

  const { data: configRows } = await supabase
    .from("config_parameters")
    .select("*")
    .eq("key", "engine_config");

  const input = toWeddingInput(wedding, slots ?? []);
  const override = mergeEngineOverride(configRows ?? [], wedding.region);
  const inputHash = stableHash({ input, configOverride: override ?? null });

  if (!force) {
    const { data: cached } = await supabase
      .from("calc_results")
      .select("*")
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (cached && cached.input_hash === inputHash) {
      return {
        results: cached.results as unknown as EngineResult,
        cached: true,
        computed_at: cached.computed_at,
      };
    }
  }

  const results = computeWedding(input, override);

  await supabase.from("calc_results").upsert(
    {
      wedding_id: weddingId,
      input_hash: results.inputHash,
      results: results as unknown as Database["public"]["Tables"]["calc_results"]["Insert"]["results"],
      computed_at: results.computedAt,
    },
    { onConflict: "wedding_id" },
  );

  return { results, cached: false, computed_at: results.computedAt };
}
