import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { createWeddingSchema } from "@/lib/api/schemas";

// GET /api/v1/weddings — nunțile userului curent
export async function GET() {
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 400);
  return ok({ weddings: data });
}

// POST /api/v1/weddings — creează nunta + membru owner (RPC)
export async function POST(req: Request) {
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = createWeddingSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase.rpc("create_wedding", {
    p_name: parsed.data.name,
    p_region: parsed.data.region ?? null,
  });

  if (error) return fail(error.message, 400);
  return ok({ wedding: data }, 201);
}
