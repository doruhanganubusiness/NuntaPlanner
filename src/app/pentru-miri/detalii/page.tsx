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
  CalendarClock,
  Church,
  ScrollText,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";

// Titlul paginii — folosit deopotrivă ca meta title și ca H1 (vezi Hero).
const TITLE = "Detaliile nunții: dată, tip și stil eveniment";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Setează numele, data fixată sau estimată, tipul — civilă, religioasă, botez — și stilul nunții. Totul se salvează automat.",
  path: "/pentru-miri/detalii",
  keywords: ["detalii nuntă", "data nunții", "tip nuntă", "stil nuntă"],
});

const features: Feature[] = [
  {
    icon: Tag,
    title: "Numele nunții",
    text: "Un nume prin care recunoști evenimentul în listă — util mai ales dacă planifici mai multe momente sau ai mai multe planuri.",
  },
  {
    icon: Church,
    title: "Ce include nunta",
    text: "Bifează cununia civilă, cea religioasă și/sau botezul. Alegerile influențează recomandările din tab-ul Plan.",
  },
  {
    icon: CalendarClock,
    title: "Data: nedecisă, estimată sau fixată",
    text: "Alege statutul datei și, dacă vrei, data exactă. Cea estimată e afișată clar ca „dată estimată” peste tot în aplicație.",
  },
  {
    icon: Sparkles,
    title: "Stilul nunții",
    text: "De la clasic la modern sau rustic — stilul dă tonul recomandărilor și te ajută să iei decizii coerente.",
  },
  {
    icon: Save,
    title: "Salvare într-un click",
    text: "Apeși „Salvează” și primești confirmarea pe loc. Modificările se reflectă imediat în panou și în calcule.",
  },
];

const benefits = [
  "Baza planificării: restul tab-urilor pornesc de aici.",
  "Poți începe chiar și fără o dată fixă.",
  "Tipul nunții ajustează automat recomandările.",
  "Datele estimate sunt marcate clar, fără confuzii.",
  "Interfață simplă, un singur formular ordonat.",
  "Nicio pierdere de date — totul e salvat în contul tău.",
];

export default function DetaliiPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={ScrollText}
        eyebrow="TAB · Detalii"
        title={TITLE}
        intro="Aici stabilești identitatea nunții: nume, ce momente include, data și stilul. Sunt informațiile pe care se sprijină toate calculele."
        primary={{ href: "/register", label: "Completează detaliile" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce completezi în Detalii"
        intro="Câmpuri puține și clare, gândite să te lase să pornești rapid."
        items={features}
        columns={2}
      />
      <BenefitList title="De ce contează" items={benefits} />
      <CtaBand
        title="Pornește planificarea de la detalii"
        text="Adaugă tipul și data nunții, iar aplicația începe imediat să-ți construiască planul."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/evenimente", label: "Următorul tab: Evenimente" }}
      />
    </div>
  );
}
