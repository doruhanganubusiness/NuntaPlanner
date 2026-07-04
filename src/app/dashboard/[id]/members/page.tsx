import { DeleteWeddingButton } from "@/components/dashboard/delete-wedding-button";
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membri & permisiuni</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersManager weddingId={id} initialMembers={members ?? []} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Zonă periculoasă</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ștergerea planificării elimină definitiv toate detaliile,
            evenimentele și membrii. Acțiunea nu poate fi anulată.
          </p>
          <DeleteWeddingButton weddingId={id} redirectTo="/dashboard" />
        </CardContent>
      </Card>
    </div>
  );
}
