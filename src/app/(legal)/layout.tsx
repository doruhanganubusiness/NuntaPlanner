import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Layout comun pentru paginile legale (termeni, confidențialitate, cookies):
 * header + footer standard și un container tip „prose" pentru text lung.
 * Rutele stau într-un route group `(legal)`, deci parantezele nu apar în URL.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:font-semibold [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_li>strong]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
