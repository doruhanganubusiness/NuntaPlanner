import { BLOG_CATEGORIES, getPosts } from "@/lib/blog/wordpress";
import { COUNTIES } from "@/lib/localities/counties";
import { countySlug } from "@/lib/localities/geo";
import { SITE_URL } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  VENDOR_CATEGORIES_SORTED,
  categoryLabel,
} from "@/lib/vendors/categories";

export type VideoEntry = {
  contentLoc: string;
  title: string;
  description: string;
  thumbnail: string;
};

export type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  images?: string[];
  videos?: VideoEntry[];
};

/** Copiii sitemap-ului, pe tip de pagină. Ordinea = ordinea din index. */
export const SITEMAP_TYPES = [
  "pages",
  "furnizori-categorii",
  "furnizori-categorie-judet",
  "zone",
  "furnizori",
  "blog",
  "images",
  "videos",
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
        "/termeni-si-conditii",
        "/confidentialitate",
        "/politica-cookies",
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

    case "images":
      return mediaEntries("image");

    case "videos":
      return mediaEntries("video");
  }
}

/**
 * O intrare de sitemap per furnizor (activ+verificat), cu imaginile sau
 * videoclipurile lui atașate paginii publice de profil `/furnizori/[id]`.
 */
async function mediaEntries(type: "image" | "video"): Promise<UrlEntry[]> {
  try {
    const admin = createAdminClient();
    const [{ data: vendorsData }, { data: mediaData }] = await Promise.all([
      admin
        .from("vendors")
        .select("id, business_name, category, logo_url")
        .eq("status", "active")
        .eq("verified", true),
      admin
        .from("vendor_media")
        .select("vendor_id, url, title")
        .eq("type", type)
        .order("position"),
    ]);

    const vendors = new Map(
      (vendorsData ?? []).map((v) => [v.id, v]),
    );
    const byVendor = new Map<string, { url: string; title: string | null }[]>();
    for (const m of mediaData ?? []) {
      if (!vendors.has(m.vendor_id)) continue;
      const arr = byVendor.get(m.vendor_id) ?? [];
      arr.push({ url: m.url, title: m.title });
      byVendor.set(m.vendor_id, arr);
    }

    const out: UrlEntry[] = [];
    for (const [vendorId, items] of byVendor) {
      const v = vendors.get(vendorId)!;
      const loc = u(`/furnizori/${vendorId}`);
      if (type === "image") {
        out.push({ loc, images: items.map((i) => i.url) });
      } else {
        const thumbnail = v.logo_url ?? `${SITE_URL}/logo.png`;
        out.push({
          loc,
          videos: items.map((i) => ({
            contentLoc: i.url,
            title: i.title || v.business_name,
            description: `${v.business_name} — ${categoryLabel(v.category)}`,
            thumbnail,
          })),
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

// --- serializare XML ------------------------------------------------------
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Header comun: declarație XML + trimitere la stylesheet-ul XSL (UI în browser).
const XML_HEAD =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

/** Un <urlset> (sitemap copil). Include namespace-urile image/video. */
export function urlsetXml(entries: UrlEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`<loc>${esc(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) parts.push(`<priority>${e.priority}</priority>`);
      for (const img of e.images ?? []) {
        parts.push(`<image:image><image:loc>${esc(img)}</image:loc></image:image>`);
      }
      for (const v of e.videos ?? []) {
        parts.push(
          "<video:video>" +
            `<video:thumbnail_loc>${esc(v.thumbnail)}</video:thumbnail_loc>` +
            `<video:title>${esc(v.title)}</video:title>` +
            `<video:description>${esc(v.description)}</video:description>` +
            `<video:content_loc>${esc(v.contentLoc)}</video:content_loc>` +
            "</video:video>",
        );
      }
      return `<url>${parts.join("")}</url>`;
    })
    .join("");
  return (
    `${XML_HEAD}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ' +
    'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">' +
    `${body}</urlset>`
  );
}

/** Indexul centralizator <sitemapindex>. */
export function indexXml(): string {
  const now = new Date().toISOString();
  const body = SITEMAP_TYPES.map(
    (t) =>
      `<sitemap><loc>${esc(u(`/sitemap/${t}.xml`))}</loc><lastmod>${now}</lastmod></sitemap>`,
  ).join("");
  return `${XML_HEAD}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}
