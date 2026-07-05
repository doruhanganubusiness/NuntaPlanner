import { PostCard } from "@/components/blog/post-card";
import { getCategoryBySlug, truncateExcerpt } from "@/lib/blog/post-helpers";
import { BLOG_CATEGORIES, blogConfigured, getPosts } from "@/lib/blog/wordpress";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { slug: string };

/** Numele categoriei din WP sau, ca rezervă, din lista ancoră (Noutăți/Ghiduri). */
async function resolve(slug: string) {
  const wp = await getCategoryBySlug(slug);
  if (wp) return { id: wp.id, name: wp.name };
  const anchor = BLOG_CATEGORIES.find((c) => c.slug === slug);
  return anchor ? { id: null as number | null, name: anchor.name } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await resolve(slug);
  if (!cat) return { title: "Categorie inexistentă" };

  return pageMeta({
    title: truncateExcerpt(`${cat.name} — Blog de nuntă`, 59),
    description: truncateExcerpt(
      `Articole din categoria ${cat.name} de pe blogul de nuntă NuntaPlanner: ghiduri, sfaturi și idei pentru organizarea nunții.`,
      135,
    ),
    path: `/blog/categorie/${slug}`,
    keywords: [`${cat.name} nuntă`, "blog nuntă"],
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cat = await resolve(slug);
  if (!cat) notFound();

  const { posts } = cat.id
    ? await getPosts({ categoryId: cat.id, perPage: 12 })
    : { posts: [] };

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>{" "}
        / <span className="text-foreground">{cat.name}</span>
      </nav>

      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {cat.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Articole din categoria {cat.name} — ghiduri, sfaturi și idei pentru
          nunta ta.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {blogConfigured()
            ? "Momentan nu există articole în această categorie."
            : "Articolele apar aici imediat ce blogul e conectat. În curând!"}
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
