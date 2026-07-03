import { InvitationEditor } from "@/components/dashboard/invitation-editor";
import { RsvpList } from "@/components/dashboard/rsvp-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!wedding) notFound();

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("wedding_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitație digitală</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationEditor
            weddingId={id}
            weddingName={wedding.name}
            weddingDate={wedding.wedding_date}
            initialCouple={wedding.invitation_couple}
            initialMessage={wedding.invitation_message}
            initialPublished={wedding.invitation_published}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmări primite</CardTitle>
        </CardHeader>
        <CardContent>
          <RsvpList initial={rsvps ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
