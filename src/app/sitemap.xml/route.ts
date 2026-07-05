import { indexXml } from "@/lib/sitemap/entries";

// Index centralizator: /sitemap.xml → referă copiii /sitemap/[tip].xml.
export const revalidate = 3600;

export function GET() {
  return new Response(indexXml(), {
    headers: { "Content-Type": "application/xml" },
  });
}
