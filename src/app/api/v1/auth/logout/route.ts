import { ok } from "@/lib/api/http";
import { createClient } from "@/lib/supabase/server";

// POST /api/v1/auth/logout
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok({ success: true });
}
