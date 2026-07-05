import { Badge } from "@/components/ui/badge";
import { getPostBySlug, truncateExcerpt } from "@/lib/blog/post-helpers";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { articol: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { articol } = await params;
  const post = await getPostBySlug(articol);
  if (!post) return { title: "Articol inexistent" };

  return pageMeta({
    title: truncateExcerpt(post.title, 59),
    description: truncateExcerpt(
      post.excerpt || `${post.title} — pe blogul NuntaPlanner.`,
      135,
    ),
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { articol } = await params;
  const post = await getPostBySlug(articol);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>{" "}
        / <span className="text-foreground">{post.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <Link key={c.id} href={`/blog/categorie/${c.slug}`}>
              <Badge tone="muted">{c.name}</Badge>
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {post.author ? `${post.author} · ` : ""}
          {post.date &&
            new Date(post.date).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
        </p>
      </header>

      {post.featuredImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt=""
          className="w-full rounded-lg border border-border object-cover"
        />
      )}

      {/* Conținut HTML din WordPress (CMS de încredere). */}
      <div
        className="max-w-none text-[15px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:rounded-lg [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <footer className="border-t border-border pt-6">
          <p className="mb-2 text-sm font-medium">Etichete</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link
                key={t.id}
                href={`/blog/tag/${t.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
