import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { runEngine, type EngineResult } from "./compute";
import { useSession } from "./session";
import { supabase } from "./supabase";
import type { ConfigParameterRow, EventSlotRow, WeddingRow } from "./types";

type WeddingContextValue = {
  loading: boolean;
  wedding: WeddingRow | null;
  slots: EventSlotRow[];
  results: EngineResult | null;
  refresh: () => Promise<void>;
  /** Actualizează câmpuri pe nunta curentă și reîncarcă. */
  updateWedding: (patch: Partial<WeddingRow>) => Promise<void>;
  /** Creează prima nuntă (onboarding) și o încarcă. */
  createWedding: (name: string, region: string | null) => Promise<void>;
};

const WeddingContext = createContext<WeddingContextValue | null>(null);

/**
 * Încarcă „nunta curentă" a mirilor (cea mai recentă), evenimentele ei și
 * parametrii de config, apoi rulează motorul pur pentru plan. Sursă unică de
 * adevăr pentru toate tab-urile planificatorului.
 */
export function WeddingProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<WeddingRow | null>(null);
  const [slots, setSlots] = useState<EventSlotRow[]>([]);
  const [config, setConfig] = useState<ConfigParameterRow[]>([]);

  const load = useCallback(async () => {
    if (!userId) {
      setWedding(null);
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: weddings } = await supabase
      .from("weddings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    const current = weddings?.[0] ?? null;
    setWedding(current);

    if (current) {
      const [{ data: slotRows }, { data: configRows }] = await Promise.all([
        supabase
          .from("event_slots")
          .select("*")
          .eq("wedding_id", current.id)
          .order("order_index"),
        supabase.from("config_parameters").select("*").eq("key", "engine_config"),
      ]);
      setSlots(slotRows ?? []);
      setConfig(configRows ?? []);
    } else {
      setSlots([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateWedding = useCallback(
    async (patch: Partial<WeddingRow>) => {
      if (!wedding) return;
      const { error } = await supabase
        .from("weddings")
        .update(patch)
        .eq("id", wedding.id);
      if (error) throw error;
      await load();
    },
    [wedding, load],
  );

  const createWedding = useCallback(
    async (name: string, region: string | null) => {
      const { error } = await supabase.rpc("create_wedding", {
        p_name: name,
        p_region: region,
      });
      if (error) throw error;
      await load();
    },
    [load],
  );

  const results = useMemo(() => {
    if (!wedding) return null;
    try {
      return runEngine(wedding, slots, config);
    } catch {
      return null;
    }
  }, [wedding, slots, config]);

  const value = useMemo<WeddingContextValue>(
    () => ({
      loading,
      wedding,
      slots,
      results,
      refresh: load,
      updateWedding,
      createWedding,
    }),
    [loading, wedding, slots, results, load, updateWedding, createWedding],
  );

  return (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding trebuie folosit în WeddingProvider");
  return ctx;
}
