import {
  entriesFor,
  isSitemapType,
  urlsetXml,
} from "@/lib/sitemap/entries";

// Sitemap copil pe tip de pagină: /sitemap/[tip].xml (ex. /sitemap/zone.xml).
export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const key = type.replace(/\.xml$/, "");
  if (!isSitemapType(key)) {
    return new Response("Not found", { status: 404 });
  }
  const entries = await entriesFor(key);
  return new Response(urlsetXml(entries), {
    headers: { "Content-Type": "application/xml" },
  });
}
