import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { acceptInviteSchema } from "@/lib/api/schemas";

// POST /api/v1/members/accept-invite
export async function POST(req: Request) {
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = acceptInviteSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase.rpc("accept_invite", {
    p_token: parsed.data.invite_token,
  });

  if (error) return fail(error.message, 400);
  return ok({ member: data });
}
