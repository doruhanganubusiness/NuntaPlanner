import { fail, ok, requireUser } from "@/lib/api/http";
import { getCalculations } from "@/lib/wedding/calculations";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/weddings/:id/calculations — rezultatele motorului (cu cache)
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const result = await getCalculations(supabase, id, false);
  if (!result) return fail("Nunta nu a fost găsită", 404);
  return ok(result);
}
