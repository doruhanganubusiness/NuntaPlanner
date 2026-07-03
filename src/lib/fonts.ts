import { Cormorant_Garamond, Dancing_Script } from "next/font/google";

/** Font caligrafic pentru numele mirilor (suportă diacritice românești). */
export const scriptFont = Dancing_Script({
  weight: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-script",
});

/** Font serif elegant pentru textul invitației. */
export const serifFont = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
});
