import { fail, ok, readJson } from "@/lib/api/http";
import { rsvpSchema } from "@/lib/api/schemas";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/v1/invitations/:id/rsvp — PUBLIC (invitații confirmă prezența)
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const parsed = rsvpSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const admin = createAdminClient();

  // Acceptăm confirmări doar pentru invitații publicate.
  const { data: wedding } = await admin
    .from("weddings")
    .select("id, invitation_published")
    .eq("id", id)
    .maybeSingle();
  if (!wedding || !wedding.invitation_published) {
    return fail("Invitația nu este disponibilă", 404);
  }

  const { attending } = parsed.data;
  const adults = attending ? parsed.data.adults_count : 0;
  const children = attending ? parsed.data.children_count : 0;
  const { error } = await admin.from("rsvps").insert({
    wedding_id: id,
    guest_name: parsed.data.guest_name,
    attending,
    adults_count: adults,
    children_count: children,
    guests_count: adults + children,
    message: parsed.data.message ?? null,
  });
  if (error) return fail(error.message, 400);

  return ok({ success: true }, 201);
}
