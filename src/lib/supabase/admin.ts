import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { serviceRoleKey, supabaseUrl } from "./env";

/**
 * Client Supabase cu service-role — bypasează RLS. A se folosi DOAR pe server,
 * pentru operații privilegiate (ex. seed / întreținere). Niciodată expus în browser.
 */
export function createAdminClient() {
  return createClient<Database>(supabaseUrl(), serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
