import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { updateLeadStatusSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/v1/leads/:id/status — furnizorul schimbă statusul (RPC set_lead_status)
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = updateLeadStatusSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { error } = await supabase.rpc("set_lead_status", {
    p_lead_id: id,
    p_status: parsed.data.status,
  });

  if (error) return fail(error.message, 400);
  return ok({ success: true });
}
