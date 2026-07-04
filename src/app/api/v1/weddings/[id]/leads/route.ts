import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { createLeadSchema } from "@/lib/api/schemas";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/weddings/:id/leads — cererile trimise de mire (cu info furnizor)
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase
    .from("leads")
    .select(
      "*, vendor:vendors(id, business_name, category, logo_url, phone, email, website)",
    )
    .eq("wedding_id", id)
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 400);
  return ok({ leads: data });
}

// POST /api/v1/weddings/:id/leads — creează un lead (RPC create_lead)
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = createLeadSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase.rpc("create_lead", {
    p_wedding_id: id,
    p_vendor_id: parsed.data.vendor_id,
    p_message: parsed.data.message ?? null,
    p_client_phone: parsed.data.client_phone ?? null,
  });

  if (error) return fail(error.message, 400);
  return ok({ lead: data }, 201);
}
