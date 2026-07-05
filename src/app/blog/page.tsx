import { PostCard } from "@/components/blog/post-card";
import { blogConfigured, getPosts } from "@/lib/blog/wordpress";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

const TITLE = "Blog de nuntă: ghiduri și noutăți";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Ghiduri practice, idei și noutăți despre organizarea nunții tale: buget, invitați, furnizori, tradiții și inspirație.",
  path: "/blog",
  keywords: ["blog nuntă", "ghiduri nuntă", "idei nuntă", "sfaturi nuntă"],
});

export default async function BlogPage() {
  const { posts } = await getPosts({ perPage: 12 });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {TITLE}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Sfaturi practice pentru fiecare etapă a organizării nunții — de la
          buget și invitați până la alegerea furnizorilor.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {blogConfigured()
            ? "Momentan nu există articole. Revino curând!"
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
