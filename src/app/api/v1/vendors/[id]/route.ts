import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { updateVendorSchema } from "@/lib/api/schemas";
import { createClient } from "@/lib/supabase/server";
import type { VendorRow } from "@/lib/supabase/database.types";
import { VENDOR_CATEGORY_SLUGS, tierForCategory } from "@/lib/vendors/categories";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/vendors/:id — RLS decide vizibilitatea (public doar activ+verificat)
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Furnizor inexistent", 404);
  return ok({ vendor: data });
}

// PATCH /api/v1/vendors/:id — update propriu (RLS: own or admin)
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = updateVendorSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }
  const d = parsed.data;
  const patch: Partial<VendorRow> = { ...d };
  if (d.category !== undefined) {
    if (!VENDOR_CATEGORY_SLUGS.includes(d.category)) {
      return fail("Categorie invalidă", 422);
    }
    patch.tier = tierForCategory(d.category);
  }

  const { data, error } = await supabase
    .from("vendors")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Furnizor inexistent sau fără permisiune", 404);
  return ok({ vendor: data });
}
