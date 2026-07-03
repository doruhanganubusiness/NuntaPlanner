import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { createSlotSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/weddings/:id/slots
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase
    .from("event_slots")
    .select("*")
    .eq("wedding_id", id)
    .order("order_index", { ascending: true });

  if (error) return fail(error.message, 400);
  return ok({ slots: data });
}

// POST /api/v1/weddings/:id/slots (RLS: owner/editor)
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = createSlotSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase
    .from("event_slots")
    .insert({ wedding_id: id, ...parsed.data })
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  return ok({ slot: data }, 201);
}
