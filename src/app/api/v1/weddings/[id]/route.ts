import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { updateWeddingSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/weddings/:id
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Nunta nu a fost găsită", 404);
  return ok({ wedding: data });
}

// PATCH /api/v1/weddings/:id — update parțial (RLS: owner/editor)
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = updateWeddingSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase
    .from("weddings")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Nunta nu a fost găsită sau nu ai permisiune", 404);
  return ok({ wedding: data });
}

// DELETE /api/v1/weddings/:id — RLS: owner
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { error } = await supabase.from("weddings").delete().eq("id", id);
  if (error) return fail(error.message, 400);
  return ok({ success: true });
}
