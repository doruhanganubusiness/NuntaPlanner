import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/blog/wordpress";
import Link from "next/link";

/** Card de articol pentru listări și pagini de taxonomie. */
export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-muted" />
        )}
        <div className="flex flex-1 flex-col p-4">
          {post.categories[0] && (
            <span className="mb-2">
              <Badge tone="muted">{post.categories[0].name}</Badge>
            </span>
          )}
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          {post.date && (
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
