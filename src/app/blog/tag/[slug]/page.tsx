import { PostCard } from "@/components/blog/post-card";
import { getTagBySlug, truncateExcerpt } from "@/lib/blog/post-helpers";
import { getPosts } from "@/lib/blog/wordpress";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Etichetă inexistentă" };

  return pageMeta({
    title: truncateExcerpt(`${tag.name} — Blog de nuntă`, 59),
    description: truncateExcerpt(
      `Articole etichetate „${tag.name}" pe blogul de nuntă NuntaPlanner: ghiduri, sfaturi și idei pentru nunta ta.`,
      135,
    ),
    path: `/blog/tag/${slug}`,
    keywords: [`${tag.name} nuntă`, "blog nuntă"],
  });
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  // Tag-urile vin exclusiv din WordPress (fără listă ancoră) — dacă nu există,
  // pagina nu are conținut de arătat.
  if (!tag) notFound();

  const { posts } = await getPosts({ tagId: tag.id, perPage: 12 });

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>{" "}
        / <span className="text-foreground">#{tag.name}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          #{tag.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Toate articolele etichetate „{tag.name}”.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Momentan nu există articole cu această etichetă.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
