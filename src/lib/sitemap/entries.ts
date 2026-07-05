import { BLOG_CATEGORIES, getPosts } from "@/lib/blog/wordpress";
import { COUNTIES } from "@/lib/localities/counties";
import { countySlug } from "@/lib/localities/geo";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";

export type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

/** Copiii sitemap-ului, pe tip de pagină. Ordinea = ordinea din index. */
export const SITEMAP_TYPES = [
  "pages",
  "furnizori-categorii",
  "furnizori-categorie-judet",
  "zone",
  "furnizori",
  "blog",
] as const;

export type SitemapType = (typeof SITEMAP_TYPES)[number];

export function isSitemapType(v: string): v is SitemapType {
  return (SITEMAP_TYPES as readonly string[]).includes(v);
}

const u = (path: string) => `${SITE_URL}${path}`;

/** Intrările (URL-uri) pentru un tip de sitemap. */
export async function entriesFor(type: SitemapType): Promise<UrlEntry[]> {
  const now = new Date().toISOString();

  switch (type) {
    case "pages": {
      const paths = [
        "/",
        "/pentru-miri",
        "/pentru-miri/panou-general",
        "/pentru-miri/detalii",
        "/pentru-miri/evenimente",
        "/pentru-miri/buget",
        "/pentru-miri/plan",
        "/pentru-miri/invitatie",
        "/pentru-miri/membri",
        "/pentru-furnizori",
        "/furnizori",
        "/zone",
        "/blog",
      ];
      return paths.map((p) => ({
        loc: u(p),
        lastmod: now,
        changefreq: "weekly",
        priority: p === "/" ? 1 : 0.7,
      }));
    }

    case "furnizori-categorii":
      return VENDOR_CATEGORIES_SORTED.map((c) => ({
        loc: u(`/furnizori/categorie/${c.slug}`),
        lastmod: now,
        changefreq: "weekly",
        priority: 0.6,
      }));

    case "furnizori-categorie-judet": {
      const out: UrlEntry[] = [];
      for (const c of VENDOR_CATEGORIES_SORTED) {
        for (const county of COUNTIES) {
          out.push({
            loc: u(`/furnizori/categorie/${c.slug}/${countySlug(county)}`),
            lastmod: now,
            changefreq: "weekly",
            priority: 0.5,
          });
        }
      }
      return out;
    }

    case "zone":
      return [
        { loc: u("/zone"), lastmod: now, changefreq: "weekly", priority: 0.6 },
        ...COUNTIES.map((county) => ({
          loc: u(`/zone/${countySlug(county)}`),
          lastmod: now,
          changefreq: "weekly",
          priority: 0.5,
        })),
      ];

    case "furnizori": {
      try {
        const admin = createAdminClient();
        const { data } = await admin
          .from("vendors")
          .select("id, updated_at")
          .eq("status", "active")
          .eq("verified", true);
        return (data ?? []).map((v) => ({
          loc: u(`/furnizori/${v.id}`),
          lastmod: v.updated_at ?? now,
          changefreq: "weekly",
          priority: 0.6,
        }));
      } catch {
        return [];
      }
    }

    case "blog": {
      const out: UrlEntry[] = [
        { loc: u("/blog"), lastmod: now, changefreq: "daily", priority: 0.7 },
        ...BLOG_CATEGORIES.map((c) => ({
          loc: u(`/blog/categorie/${c.slug}`),
          lastmod: now,
          changefreq: "weekly",
          priority: 0.6,
        })),
      ];
      const { posts } = await getPosts({ perPage: 100 });
      for (const p of posts) {
        out.push({
          loc: u(`/blog/${p.slug}`),
          lastmod: p.modified || now,
          changefreq: "monthly",
          priority: 0.6,
        });
      }
      return out;
    }
  }
}

// --- serializare XML ------------------------------------------------------
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Un <urlset> (sitemap copil). */
export function urlsetXml(entries: UrlEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`<loc>${esc(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) parts.push(`<priority>${e.priority}</priority>`);
      return `<url>${parts.join("")}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

/** Indexul centralizator <sitemapindex>. */
export function indexXml(): string {
  const now = new Date().toISOString();
  const body = SITEMAP_TYPES.map(
    (t) =>
      `<sitemap><loc>${esc(u(`/sitemap/${t}.xml`))}</loc><lastmod>${now}</lastmod></sitemap>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}
