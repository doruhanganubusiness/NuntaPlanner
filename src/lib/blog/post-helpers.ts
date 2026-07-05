import { getPostBySlug as fetchPostBySlug } from "@/lib/blog/wordpress";
import { truncate } from "@/lib/localities/geo";
import { cache } from "react";

/** Aceeași citire pentru metadata + pagină, o singură dată (React cache). */
export const getPostBySlug = cache(fetchPostBySlug);

export const truncateExcerpt = truncate;
