import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { createVendorSchema } from "@/lib/api/schemas";
import { createClient } from "@/lib/supabase/server";
import { VENDOR_CATEGORY_SLUGS, tierForCategory } from "@/lib/vendors/categories";

// GET /api/v1/vendors?category=&region= — director public (RLS: activi+verificați)
export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const region = url.searchParams.get("region");

  let q = supabase
    .from("vendors")
    .select(
      "id, business_name, category, tier, regions, description, logo_url, website, rating",
    )
    .eq("status", "active")
    .eq("verified", true)
    .order("rating", { ascending: false });

  if (category) q = q.eq("category", category);
  if (region) q = q.contains("regions", [region]);

  const { data, error } = await q;
  if (error) return fail(error.message, 400);
  return ok({ vendors: data });
}

// POST /api/v1/vendors — creează profilul furnizorului curent (status: pending)
export async function POST(req: Request) {
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = createVendorSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }
  const d = parsed.data;
  if (!VENDOR_CATEGORY_SLUGS.includes(d.category)) {
    return fail("Categorie invalidă", 422);
  }

  const { data, error } = await supabase
    .from("vendors")
    .insert({
      user_id: user.id,
      business_name: d.business_name,
      category: d.category,
      tier: tierForCategory(d.category),
      regions: d.regions,
      description: d.description ?? null,
      phone: d.phone ?? null,
      email: d.email ?? user.email ?? null,
      website: d.website ?? null,
      logo_url: d.logo_url ?? null,
    })
    .select("*")
    .single();

  if (error) return fail(error.message, 400);
  return ok({ vendor: data }, 201);
}
