import {
  AdminReviewList,
  type AdminReview,
} from "@/components/admin/admin-review-list";
import { createClient } from "@/lib/supabase/server";

type ReviewWithVendor = {
  id: string;
  rating: number;
  comment: string | null;
  author_role: "couple" | "vendor";
  created_at: string;
  vendors: { business_name: string } | null;
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, author_role, created_at, vendors(business_name)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as ReviewWithVendor[];

  const reviews: AdminReview[] = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    author_role: r.author_role,
    created_at: r.created_at,
    vendorName: r.vendors?.business_name ?? "—",
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Recenzii</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toate recenziile de pe platformă. Șterge-le pe cele nepotrivite.
        </p>
      </div>
      <AdminReviewList initial={reviews} />
    </div>
  );
}
