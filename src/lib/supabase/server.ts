import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Client Supabase pentru server (Route Handlers, Server Components).
 * Sesiunea trăiește în cookies, gestionate prin @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Apelat dintr-un Server Component (cookies read-only) — se poate ignora
          // dacă refresh-ul de sesiune e făcut de middleware.
        }
      },
    },
  });
}
