import { fail, ok, readJson } from "@/lib/api/http";
import { loginSchema } from "@/lib/api/schemas";
import { createClient } from "@/lib/supabase/server";

// POST /api/v1/auth/login
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail(error.message, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, full_name")
    .eq("id", data.user.id)
    .single();

  return ok({
    user_id: data.user.id,
    user_type: profile?.user_type ?? "client",
    full_name: profile?.full_name ?? null,
    // Tokenul e stocat în cookies (SSR). Pentru mobil îl expunem și explicit.
    access_token: data.session?.access_token ?? null,
  });
}
