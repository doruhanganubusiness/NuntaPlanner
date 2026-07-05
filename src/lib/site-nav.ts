import { BLOG_CATEGORIES } from "@/lib/blog/wordpress";
import { COUNTIES_SORTED, countySlug } from "@/lib/localities/geo";
import { VENDOR_CATEGORIES_SORTED } from "@/lib/vendors/categories";

/** Un nod din arborele de navigație; poate avea subpagini (recursiv). */
export type NavNode = {
  href: string;
  label: string;
  children?: NavNode[];
};

/**
 * Arborele de navigație al site-ului: fiecare pagină-părinte + subpaginile ei.
 * Modul de DATE simplu (fără „use client"), ca să poată fi consumat atât de
 * componenta client de meniu, cât și de Server Components (footer). Sursele sunt
 * constantele existente, deci meniul rămâne sincron cu rutele.
 */
export const NAV_TREE: NavNode[] = [
  // „Pentru miri" e link simplu în meniu (subpaginile rămân doar în sub-nav-ul
  // secțiunii, PentruMiriNav, nu în meniul principal).
  { href: "/pentru-miri", label: "Pentru miri" },
  { href: "/pentru-furnizori", label: "Pentru furnizori" },
  {
    href: "/furnizori",
    label: "Director furnizori",
    children: VENDOR_CATEGORIES_SORTED.map((c) => ({
      href: `/furnizori/categorie/${c.slug}`,
      label: c.label,
    })),
  },
  {
    href: "/zone",
    label: "Zone",
    children: COUNTIES_SORTED.map((c) => ({
      href: `/zone/${countySlug(c)}`,
      label: c.name,
    })),
  },
  {
    href: "/blog",
    label: "Blog",
    children: BLOG_CATEGORIES.map((c) => ({
      href: `/blog/categorie/${c.slug}`,
      label: c.name,
    })),
  },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Aplatizează subpaginile (copii + nepoți) cu adâncime, pentru căutare/afișare. */
export function flattenChildren(
  node: NavNode,
  depth = 1,
): { node: NavNode; depth: number }[] {
  const out: { node: NavNode; depth: number }[] = [];
  for (const c of node.children ?? []) {
    out.push({ node: c, depth });
    if (c.children?.length) out.push(...flattenChildren(c, depth + 1));
  }
  return out;
}
