import {
  BenefitList,
  CtaBand,
  FeatureGrid,
  Hero,
  type Feature,
} from "@/components/marketing/sections";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import {
  Cake,
  Calculator,
  Download,
  Music,
  PieChart,
  Ruler,
  Wine,
} from "lucide-react";

// Titlul paginii — folosit deopotrivă ca meta title și ca H1 (vezi Hero).
const TITLE = "Planul nunții: băutură, sală, muzică și dulciuri";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Calcule automate pentru băutură, dimensiunea sălii, formație sau DJ, tort și dulciuri, pe baza invitaților și bugetului.",
  path: "/pentru-miri/plan",
  keywords: [
    "plan nuntă",
    "cantități băutură nuntă",
    "dimensiune sală nuntă",
    "formație sau DJ nuntă",
  ],
});

const features: Feature[] = [
  {
    icon: Wine,
    title: "Băutură calculată",
    text: "Vin, bere, tărie, șampanie, apă, sucuri și numărul de pahare — sau costul pe persoană, dacă băutura e inclusă în meniu.",
  },
  {
    icon: Ruler,
    title: "Sala potrivită",
    text: "Suprafața recomandată în metri pătrați, cu interval min–max, și numărul de mese rotunde pentru invitații tăi.",
  },
  {
    icon: Music,
    title: "Formație sau DJ",
    text: "O recomandare argumentată în funcție de tipul nunții și invitați, pe care o poți suprascrie cu alegerea ta.",
  },
  {
    icon: Cake,
    title: "Tort și dulciuri",
    text: "Kilograme de tort, mărturii, candy bar, dulciuri de ceremonie și șampanie — defalcate și per moment al zilei.",
  },
  {
    icon: PieChart,
    title: "Buget pe categorii",
    text: "Suma alocată fiecărei categorii, în lei și procente, ca să vezi imediat cum se împarte bugetul efectiv.",
  },
  {
    icon: Download,
    title: "Export și avertismente",
    text: "Poți exporta planul, iar aplicația îți semnalează avertismente și note utile când ceva merită atenție.",
  },
];

const benefits = [
  "Nu mai ghicești cantitățile — sunt calculate exact.",
  "Eviți să comanzi prea multă sau prea puțină băutură.",
  "Alegi o sală de dimensiunea potrivită numărului de invitați.",
  "Primești o recomandare clară pentru muzică.",
  "Planul se recalculează singur când schimbi ceva.",
  "Îl poți exporta și trimite furnizorilor.",
];

export default function PlanPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={Calculator}
        eyebrow="TAB · Plan"
        title={TITLE}
        intro="Aici se adună tot: pe baza evenimentelor și a bugetului, aplicația calculează băutura, sala, muzica, dulciurile și defalcarea cheltuielilor."
        primary={{ href: "/register", label: "Generează-ți planul" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce îți calculează planul"
        intro="Un plan complet, actualizat automat de fiecare dată când modifici datele nunții."
        items={features}
      />
      <BenefitList title="De ce e util planul" items={benefits} />
      <CtaBand
        title="Primește planul complet al nunții"
        text="Adaugă evenimentele și bugetul, iar planul cu toate cantitățile apare automat, gata de folosit."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/invitatie", label: "Următorul tab: Invitație" }}
      />
    </div>
  );
}
