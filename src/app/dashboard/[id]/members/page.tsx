import { MembersManager } from "@/components/dashboard/members-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("wedding_members")
    .select("*")
    .eq("wedding_id", id)
    .order("invited_at", { ascending: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membri & permisiuni</CardTitle>
      </CardHeader>
      <CardContent>
        <MembersManager weddingId={id} initialMembers={members ?? []} />
      </CardContent>
    </Card>
  );
}
