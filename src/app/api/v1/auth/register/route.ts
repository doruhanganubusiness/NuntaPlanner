import { fail, ok, readJson } from "@/lib/api/http";
import { registerSchema } from "@/lib/api/schemas";
import { createClient } from "@/lib/supabase/server";

// POST /api/v1/auth/register
export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }
  const { email, password, full_name, user_type } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, user_type } },
  });

  if (error) return fail(error.message, 400);

  return ok(
    {
      user_id: data.user?.id ?? null,
      user_type,
      // Fără sesiune înseamnă că e nevoie de confirmarea emailului.
      needs_email_verification: data.session === null,
    },
    201,
  );
}
