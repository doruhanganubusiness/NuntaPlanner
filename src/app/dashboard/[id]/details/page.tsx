import { EditDetailsForm } from "@/components/dashboard/edit-details-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function DetailsPage({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalii eveniment</CardTitle>
      </CardHeader>
      <CardContent>
        <EditDetailsForm wedding={wedding} />
      </CardContent>
    </Card>
  );
}
