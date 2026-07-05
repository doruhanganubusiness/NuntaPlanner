/**
 * Strat de acces la blog prin WordPress headless (API REST wp/v2).
 * Sursa se configurează prin `WORDPRESS_API_URL` (rădăcina site-ului WP, ex.
 * https://blog.nuntaplanner.ro). Cât timp variabila lipsește, funcțiile întorc
 * liste goale — paginile de blog există și sunt indexabile, doar fără conținut.
 */

export type BlogTerm = {
  id: number;
  slug: string;
  name: string;
  count?: number;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  categories: BlogTerm[];
  tags: BlogTerm[];
  featuredImage: string | null;
  author: string | null;
};

/** Categorii „ancoră", garantat indexabile chiar și înainte de a conecta WP. */
export const BLOG_CATEGORIES = [
  { slug: "noutati", name: "Noutăți" },
  { slug: "ghiduri", name: "Ghiduri" },
] as const;

function apiBase(): string | null {
  const raw = process.env.WORDPRESS_API_URL?.trim();
  if (!raw) return null;
  return `${raw.replace(/\/$/, "")}/wp-json/wp/v2`;
}

/** True dacă blogul e conectat la un WordPress (pentru mesaje „în curând"). */
export function blogConfigured(): boolean {
  return apiBase() !== null;
}

async function wpFetch<T>(path: string): Promise<{ data: T; headers: Headers } | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    return { data, headers: res.headers };
  } catch {
    return null;
  }
}

// --- utilitare de curățare a HTML-ului venit din WP -----------------------
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#038;": "&",
  "&#8217;": "’",
  "&#8216;": "‘",
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8220;": "“",
  "&#8221;": "”",
  "&hellip;": "…",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#039;": "'",
};

export function decodeEntities(s: string): string {
  return s.replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m] ?? m);
}

export function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, "")).trim();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPost(raw: any): BlogPost {
  const embedded = raw._embedded ?? {};
  const termGroups: any[] = embedded["wp:term"] ?? [];
  const terms = termGroups.flat();
  const asTerm = (t: any): BlogTerm => ({
    id: t.id,
    slug: t.slug,
    name: decodeEntities(t.name ?? ""),
  });
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title?.rendered ?? ""),
    excerpt: stripHtml(raw.excerpt?.rendered ?? ""),
    content: raw.content?.rendered ?? "",
    date: raw.date ?? "",
    modified: raw.modified ?? raw.date ?? "",
    categories: terms.filter((t) => t.taxonomy === "category").map(asTerm),
    tags: terms.filter((t) => t.taxonomy === "post_tag").map(asTerm),
    featuredImage:
      embedded["wp:featuredmedia"]?.[0]?.source_url ?? null,
    author: embedded.author?.[0]?.name ?? null,
  };
}

function mapTerm(raw: any): BlogTerm {
  return {
    id: raw.id,
    slug: raw.slug,
    name: decodeEntities(raw.name ?? ""),
    count: raw.count,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- API public -----------------------------------------------------------
export async function getPosts(opts?: {
  categoryId?: number;
  tagId?: number;
  perPage?: number;
  page?: number;
}): Promise<{ posts: BlogPost[]; totalPages: number }> {
  const perPage = opts?.perPage ?? 12;
  const page = opts?.page ?? 1;
  const params = new URLSearchParams({
    _embed: "1",
    per_page: String(perPage),
    page: String(page),
  });
  if (opts?.categoryId) params.set("categories", String(opts.categoryId));
  if (opts?.tagId) params.set("tags", String(opts.tagId));

  const res = await wpFetch<unknown[]>(`/posts?${params.toString()}`);
  if (!res) return { posts: [], totalPages: 0 };
  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
  return { posts: res.data.map(mapPost), totalPages };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await wpFetch<unknown[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
  );
  if (!res || res.data.length === 0) return null;
  return mapPost(res.data[0]);
}

export async function getCategoryBySlug(slug: string): Promise<BlogTerm | null> {
  const res = await wpFetch<unknown[]>(
    `/categories?slug=${encodeURIComponent(slug)}`,
  );
  if (!res || res.data.length === 0) return null;
  return mapTerm(res.data[0]);
}

export async function getTagBySlug(slug: string): Promise<BlogTerm | null> {
  const res = await wpFetch<unknown[]>(
    `/tags?slug=${encodeURIComponent(slug)}`,
  );
  if (!res || res.data.length === 0) return null;
  return mapTerm(res.data[0]);
}
