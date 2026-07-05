import { COUNTIES_SORTED, countySlug } from "@/lib/localities/geo";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

const TITLE = "Furnizori de nuntă pe zone și județe";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Explorează furnizorii de nuntă din fiecare județ al României și din localitățile lor. Alege zona ta și găsește furnizori verificați.",
  path: "/zone",
  keywords: [
    "furnizori nuntă pe județe",
    "furnizori nuntă zone",
    "nuntă județe România",
  ],
});

export default function ZonePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {TITLE}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Alege un județ pentru a vedea furnizorii care acoperă zona și toate
          localitățile din județ. Toate cele 41 de județe și municipiul
          București.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COUNTIES_SORTED.map((c) => (
            <Link
              key={c.code}
              href={`/zone/${countySlug(c)}`}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
