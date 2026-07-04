import { fail, ok, requireUser } from "@/lib/api/http";

// GET /api/v1/vendor/leads — lead-urile furnizorului curent (contact mascat)
export async function GET() {
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase.rpc("vendor_leads");
  if (error) return fail(error.message, 400);
  return ok({ leads: data });
}
