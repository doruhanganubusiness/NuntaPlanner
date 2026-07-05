import { SITE_URL } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zone private / de aplicație — fără valoare în index.
      disallow: ["/dashboard", "/vendor", "/admin", "/api", "/login", "/register"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
