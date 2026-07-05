import {
  getCategoryBySlug as fetchCategoryBySlug,
  getPostBySlug as fetchPostBySlug,
  getTagBySlug as fetchTagBySlug,
} from "@/lib/blog/wordpress";
import { truncate } from "@/lib/localities/geo";
import { cache } from "react";

/** Aceleași citiri pentru metadata + pagină, o singură dată (React cache). */
export const getPostBySlug = cache(fetchPostBySlug);
export const getCategoryBySlug = cache(fetchCategoryBySlug);
export const getTagBySlug = cache(fetchTagBySlug);

export const truncateExcerpt = truncate;
