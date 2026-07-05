import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { adminVendorSchema } from "@/lib/api/schemas";
import { notifyVendorApproved } from "@/lib/email/notifications";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/v1/admin/vendors/:id — admin schimbă status/verified
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return fail("Interzis", 403);

  const parsed = adminVendorSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  // Starea de dinainte, ca să detectăm tranziția în „activ + verificat".
  const { data: before } = await supabase
    .from("vendors")
    .select("verified, status")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("vendors")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);
  if (!data) return fail("Furnizor inexistent", 404);

  // La prima aprobare (activ+verificat) → email „Ești listat" (best-effort).
  const wasLive = !!before?.verified && before?.status === "active";
  const isLive = data.verified && data.status === "active";
  if (isLive && !wasLive) {
    try {
      await notifyVendorApproved(id);
    } catch {
      // ignorat intenționat
    }
  }

  return ok({ vendor: data });
}
