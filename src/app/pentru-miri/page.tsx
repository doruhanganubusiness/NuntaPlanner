import {
  BenefitList,
  CtaBand,
  FeatureGrid,
  Hero,
  type Feature,
} from "@/components/marketing/sections";
import { Card, CardContent } from "@/components/ui/card";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import {
  CalendarClock,
  Calculator,
  Gauge,
  Heart,
  LayoutDashboard,
  MailOpen,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

// Titlul paginii — folosit deopotrivă ca meta title și ca H1 (vezi Hero).
const TITLE = "Aplicație de planificare a nunții pentru miri";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Organizează-ți nunta într-un loc: buget, invitați, evenimente, plan automat și invitație digitală cu RSVP. Gratuit pentru miri.",
  path: "/pentru-miri",
  keywords: [
    "planificare nuntă",
    "aplicație pentru miri",
    "organizare nuntă",
    "buget nuntă",
    "invitație digitală nuntă",
    "RSVP nuntă",
  ],
});

// Cele 7 tab-uri din dashboard, fiecare cu subpagina lui dedicată.
const tabs: (Feature & { href: string })[] = [
  {
    icon: LayoutDashboard,
    title: "Panou general",
    text: "Progresul planificării, zilele rămase, invitații, bugetul și recomandările rapide — toate într-un singur ecran.",
    href: "/pentru-miri/panou-general",
  },
  {
    icon: ScrollText,
    title: "Detalii",
    text: "Numele, data (fixată sau estimată), tipul nunții — civilă, religioasă, botez — și stilul evenimentului.",
    href: "/pentru-miri/detalii",
  },
  {
    icon: CalendarClock,
    title: "Evenimente",
    text: "Programul zilei pe momente: cununie, botez, petrecere, cu oră, locație și număr de invitați pentru fiecare.",
    href: "/pentru-miri/evenimente",
  },
  {
    icon: Wallet,
    title: "Buget",
    text: "Buget recomandat sau al tău, prioritizarea categoriilor și alocarea vizuală pe fiecare tip de cheltuială.",
    href: "/pentru-miri/buget",
  },
  {
    icon: Calculator,
    title: "Plan",
    text: "Calcule automate pentru băutură, sală, formație sau DJ, tort și dulciuri — pe baza invitaților și bugetului.",
    href: "/pentru-miri/plan",
  },
  {
    icon: MailOpen,
    title: "Invitație",
    text: "Invitație digitală cu link partajabil, hartă și RSVP online, cu confirmările afișate direct în panou.",
    href: "/pentru-miri/invitatie",
  },
  {
    icon: Users,
    title: "Membri",
    text: "Invită mireasă, mire, părinți și nași, cu rol și drepturi de vizualizare sau editare a planificării.",
    href: "/pentru-miri/membri",
  },
];

const steps: Feature[] = [
  {
    icon: ScrollText,
    title: "1. Creezi evenimentul",
    text: "Adaugi tipul nunții, regiunea și evenimentele zilei — civilă, religioasă, botez, petrecere. Totul e opțional la început.",
  },
  {
    icon: Users,
    title: "2. Completezi invitați și buget",
    text: "Adulți și copii per eveniment, bugetul total și prioritățile tale. Datele se salvează automat pe măsură ce le introduci.",
  },
  {
    icon: Calculator,
    title: "3. Primești planul",
    text: "Băutură, dulciuri, dimensiunea sălii, formație vs DJ și defalcarea bugetului — calculate automat și actualizate.",
  },
];

const benefits = [
  "Toată nunta într-un singur loc, nu în zece foi de calcul.",
  "Cantitățile de băutură și dulciuri, calculate automat după invitați.",
  "Un buget recomandat realist, defalcat pe categorii.",
  "Invitație digitală cu RSVP — vezi cine vine fără telefoane.",
  "Colaborare cu părinții și nașii, fiecare cu rolul lui.",
  "Recomandare formație sau DJ pe baza tipului de nuntă.",
  "Planul se recalculează singur când schimbi ceva.",
  "Complet gratuit pentru miri, de la început până la final.",
];

export default function PentruMiriPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={Heart}
        eyebrow="Pentru miri"
        title={TITLE}
        intro="NuntaPlanner adună într-un singur loc bugetul, invitații, programul zilei și calculele — apoi îți generează automat planul complet al nunții."
        primary={{
          href: "/register?type=client",
          label: "Creează-ți planul gratuit",
        }}
        secondary={{ href: "/login?type=client", label: "Am deja cont" }}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Gauge,
            title: "Calcule automate",
            text: "Băutură, sală, muzică, tort și buget — recalculate instant la fiecare schimbare.",
          },
          {
            icon: ShieldCheck,
            title: "Datele tale, în siguranță",
            text: "Cont propriu, acces controlat pe roluri și permisiuni pentru fiecare membru.",
          },
          {
            icon: Heart,
            title: "Gândit pentru nunți din România",
            text: "Cununie civilă și religioasă, botez, nași, mărturii, candy bar și formație sau DJ.",
          },
        ].map((f) => (
          <Card key={f.title}>
            <CardContent className="pt-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <FeatureGrid
        title="Cum funcționează, în 3 pași"
        intro="De la un cont gol la un plan complet al nunții în câteva minute."
        items={steps}
      />

      <section>
        <h2 className="text-2xl font-bold tracking-tight">
          Tot ce găsești în dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Planificarea e împărțită în șapte tab-uri. Apasă pe oricare pentru a
          vedea în detaliu ce face și cum te ajută.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted"
            >
              <t.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold group-hover:text-primary">
                {t.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              <span className="mt-3 inline-block text-sm font-medium text-primary">
                Află mai multe →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <BenefitList title="De ce folosesc mirii NuntaPlanner" items={benefits} />

      <CtaBand
        title="Gata să-ți planifici nunta?"
        text="Creează-ți contul gratuit și primești în câteva minute planul complet — buget, cantități, sală, muzică și invitație digitală."
        primary={{ href: "/register?type=client", label: "Începe gratuit" }}
        secondary={{ href: "/login?type=client", label: "Autentificare" }}
      />
    </div>
  );
}
