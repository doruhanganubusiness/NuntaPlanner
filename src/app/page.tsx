import { HeaderAuthNav } from "@/components/header-auth-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarHeart, Calculator, ListChecks, Wine } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: CalendarHeart,
    title: "Creezi evenimentul",
    text: "Adaugi tipul nunții, regiunea și sloturile zilei — civilă, religioasă, botez, petrecere.",
  },
  {
    icon: ListChecks,
    title: "Completezi invitații și bugetul",
    text: "Adulți și copii per slot, buget total și prioritățile tale. Totul e opțional la început.",
  },
  {
    icon: Calculator,
    title: "Primești planul",
    text: "Băutură, dulciuri, dimensiunea sălii, formație vs DJ și defalcarea bugetului — automat.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold text-primary">NuntaPlanner</span>
        <HeaderAuthNav />
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
          <Wine className="h-4 w-4" /> Planificator inteligent de nunți
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Planifică-ți nunta de la zero, fără bătăi de cap
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Spune-ne câți invitați ai și un buget, iar noi calculăm exact de câtă
          băutură, dulciuri, sală și muzică ai nevoie.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">Creează-ți planul</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Am deja cont</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title}>
              <CardContent className="pt-6">
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} NuntaPlanner. Gratuit pentru miri.
      </footer>
    </main>
  );
}
