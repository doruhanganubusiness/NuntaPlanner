import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

/** Antetul unei pagini de marketing: etichetă, titlu, intro și butoane CTA. */
export function Hero({
  icon: Icon,
  eyebrow,
  title,
  intro,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  intro: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
        <Icon className="h-4 w-4" /> {eyebrow}
      </span>
      <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        {intro}
      </p>
      {(primary || secondary) && (
        <div className="mt-7 flex justify-center gap-3">
          {primary && (
            <Button size="lg" asChild>
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
          )}
          {secondary && (
            <Button size="lg" variant="outline" asChild>
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export type Feature = { icon: LucideIcon; title: string; text: string };

/** Grilă de funcționalități (carduri cu icon + titlu + descriere). */
export function FeatureGrid({
  title,
  intro,
  items,
  columns = 3,
}: {
  title: string;
  intro?: string;
  items: Feature[];
  columns?: 2 | 3;
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>}
      <div
        className={cn(
          "mt-6 grid gap-5",
          columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {items.map((it) => (
          <Card key={it.title}>
            <CardContent className="pt-6">
              <it.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

/** Listă de beneficii cu bifă verde. */
export function BenefitList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm text-foreground">{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Bandă finală cu îndemn la acțiune. */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="rounded-xl bg-accent px-6 py-10 text-center text-accent-foreground">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{text}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button size="lg" asChild>
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        {secondary && (
          <Button size="lg" variant="outline" asChild>
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
