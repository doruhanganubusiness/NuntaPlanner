import { SectionNav } from "@/components/dashboard/section-nav";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!wedding) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
      <h1 className="text-2xl font-bold">{wedding.name}</h1>
      <div className="mt-4">
        <SectionNav weddingId={id} />
      </div>
      <div className="py-6">{children}</div>
    </div>
  );
}
