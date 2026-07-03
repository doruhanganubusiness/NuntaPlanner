import { fail, ok, readJson, requireUser } from "@/lib/api/http";
import { createMemberSchema } from "@/lib/api/schemas";
import { sendInviteEmail } from "@/lib/email/resend";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/weddings/:id/members
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const { data, error } = await supabase
    .from("wedding_members")
    .select("*")
    .eq("wedding_id", id)
    .order("invited_at", { ascending: true });

  if (error) return fail(error.message, 400);
  return ok({ members: data });
}

// POST /api/v1/weddings/:id/members — invită un membru (RLS: owner)
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user, unauthorized } = await requireUser();
  if (!user) return unauthorized;

  const parsed = createMemberSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return fail("Date invalide", 422, { issues: parsed.error.issues });
  }

  const { data, error } = await supabase
    .from("wedding_members")
    .insert({
      wedding_id: id,
      email: parsed.data.email,
      role: parsed.data.role,
      permission: parsed.data.permission,
      status: "pending",
    })
    .select("*")
    .maybeSingle();

  if (error) return fail(error.message, 400);

  // Trimite emailul de invitație (best-effort — nu blochează dacă eșuează).
  let emailSent = false;
  if (data) {
    const { data: wedding } = await supabase
      .from("weddings")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    const origin =
      req.headers.get("origin") ?? new URL(req.url).origin;
    const result = await sendInviteEmail({
      to: data.email,
      inviteUrl: `${origin}/invite/${data.invite_token}`,
      weddingName: wedding?.name ?? "nunta",
    });
    emailSent = result.sent;
  }

  // `invite_token` din răspuns se folosește pentru linkul de invitație.
  return ok({ member: data, email_sent: emailSent }, 201);
}
