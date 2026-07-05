import { categoryLabel } from "@/lib/vendors/categories";
import { Star } from "lucide-react";
import Link from "next/link";

export type VendorCardData = {
  id: string;
  business_name: string;
  category: string;
  regions: string[];
  description: string | null;
  logo_url: string | null;
  rating: number;
};

/** Card de furnizor pentru director și paginile de categorie. */
export function VendorCard({ vendor: v }: { vendor: VendorCardData }) {
  return (
    <Link
      href={`/furnizori/${v.id}`}
      className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        {v.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.logo_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{v.business_name}</p>
          <p className="text-xs text-muted-foreground">
            {categoryLabel(v.category)}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-warning" />
            {v.rating.toFixed(1)}
          </p>
        </div>
      </div>
      {v.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {v.description}
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {v.regions.slice(0, 3).join(", ")}
        {v.regions.length > 3 ? "…" : ""}
      </p>
    </Link>
  );
}
