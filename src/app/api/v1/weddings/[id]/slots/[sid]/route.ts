import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { updateSlotSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string; sid: string }> };

// PATCH /api/v1/weddings/:id/slots/:sid (RLS: owner/editor)
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, sid } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = updateSlotSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase
    .from("event_slots")
    .update(parsed.data)
    .eq("id", sid)
    .eq("wedding_id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Slotul nu a fost găsit sau nu ai permisiune", 404);
  return ok({ slot: data });
}

// DELETE /api/v1/weddings/:id/slots/:sid (RLS: owner/editor)
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, sid } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { error } = await supabase
    .from("event_slots")
    .delete()
    .eq("id", sid)
    .eq("wedding_id", id);

  if (error) return fail(error.message, 400);
  return ok({ success: true });
}
