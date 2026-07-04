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
  ArrowUpDown,
  Lightbulb,
  PieChart,
  Wallet,
  Wine,
} from "lucide-react";

export const metadata: Metadata = pageMeta({
  title: "Buget nuntă: alocare pe categorii și priorități",
  description:
    "Introdu bugetul sau folosește-l pe cel recomandat, prioritizează categoriile și vezi alocarea vizuală pe fiecare cheltuială.",
  path: "/pentru-miri/buget",
  keywords: [
    "buget nuntă",
    "calcul buget nuntă",
    "cheltuieli nuntă",
    "alocare buget nuntă",
  ],
});

const features: Feature[] = [
  {
    icon: Lightbulb,
    title: "Buget recomandat",
    text: "Pe baza numărului de invitați și a tipului de nuntă, primești o sumă realistă. O folosim automat dacă nu introduci alta.",
  },
  {
    icon: Wallet,
    title: "Bugetul tău",
    text: "Ai deja o sumă în minte? O introduci și toate alocările se recalculează în jurul ei. Câmpul e opțional.",
  },
  {
    icon: Wine,
    title: "Băutura: cantități sau cost",
    text: "Alegi dacă mirii aduc băutura (calculăm cantitățile) sau e inclusă în meniu (calculăm costul). Bugetul se ajustează.",
  },
  {
    icon: ArrowUpDown,
    title: "Prioritizarea categoriilor",
    text: "Aranjezi în ordinea importanței sala, foto-video, muzica, decorul, ținutele și restul. Prioritățile modelează alocarea.",
  },
  {
    icon: PieChart,
    title: "Alocare vizuală",
    text: "O diagramă îți arată cât merge spre fiecare categorie, în lei și procente, pe baza bugetului efectiv.",
  },
];

const benefits = [
  "Pornești de la o sumă realistă, nu de la zero.",
  "Vezi clar unde se duc banii, pe categorii.",
  "Prioritățile tale schimbă alocarea, nu invers.",
  "Decizi cum tratezi băutura: cost sau cantități.",
  "Fără foi de calcul: totul e vizual și automat.",
  "Alocarea se actualizează la fiecare modificare.",
];

export default function BugetPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={Wallet}
        eyebrow="TAB · Buget"
        title="Bugetul nunții, defalcat inteligent"
        intro="Stabilești cât vrei să cheltuiești și ce contează cel mai mult, iar aplicația împarte suma pe categorii și ți-o arată vizual."
        primary={{ href: "/register", label: "Calculează-ți bugetul" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce faci în tab-ul Buget"
        intro="De la o sumă totală la o defalcare clară pe fiecare cheltuială a nunții."
        items={features}
      />
      <BenefitList title="De ce te ajută" items={benefits} />
      <CtaBand
        title="Vezi unde se duc banii nunții"
        text="Introdu bugetul sau folosește-l pe cel recomandat și primești pe loc alocarea pe categorii."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/plan", label: "Următorul tab: Plan" }}
      />
    </div>
  );
}
