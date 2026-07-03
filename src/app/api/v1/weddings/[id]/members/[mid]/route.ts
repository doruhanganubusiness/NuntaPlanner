import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { updateMemberSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string; mid: string }> };

// PATCH /api/v1/weddings/:id/members/:mid (RLS: owner)
export async function PATCH(req: Request, { params }: Ctx) {
  const { id, mid } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = updateMemberSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase
    .from("wedding_members")
    .update(parsed.data)
    .eq("id", mid)
    .eq("wedding_id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Membrul nu a fost găsit sau nu ai permisiune", 404);
  return ok({ member: data });
}

// DELETE /api/v1/weddings/:id/members/:mid (RLS: owner)
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, mid } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { error } = await supabase
    .from("wedding_members")
    .delete()
    .eq("id", mid)
    .eq("wedding_id", id);

  if (error) return fail(error.message, 400);
  return ok({ success: true });
}
