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
  CalendarDays,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

// Titlul paginii — folosit deopotrivă ca meta title și ca H1 (vezi Hero).
const TITLE = "Panoul general: progresul planificării nunții";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Vezi într-o privire progresul planificării, zilele rămase până la nuntă, invitații, bugetul și recomandările rapide.",
  path: "/pentru-miri/panou-general",
  keywords: ["panou nuntă", "progres planificare nuntă", "sumar nuntă"],
});

const features: Feature[] = [
  {
    icon: TrendingUp,
    title: "Bară de progres",
    text: "Un procent care crește pe măsură ce completezi regiunea, data, tipul, stilul, evenimentele și bugetul. Vezi exact cât mai ai de făcut.",
  },
  {
    icon: CalendarDays,
    title: "Zile până la nuntă",
    text: "Numărătoarea inversă până la data aleasă, cu mențiunea „dată estimată” dacă încă nu ai fixat-o definitiv.",
  },
  {
    icon: Users,
    title: "Total invitați",
    text: "Suma adulților și copiilor din toate evenimentele, plus câte momente ai adăugat în programul zilei.",
  },
  {
    icon: Wallet,
    title: "Buget total",
    text: "Bugetul tău sau cel recomandat automat, cu mențiunea dacă băutura e inclusă în meniu sau calculată separat.",
  },
  {
    icon: Lightbulb,
    title: "Recomandări rapide",
    text: "Muzica potrivită, suprafața sălii și numărul de mese, cantitatea de vin — un rezumat al planului, fără să deschizi tab-ul Plan.",
  },
  {
    icon: Gauge,
    title: "Avertismente",
    text: "Semnale când ceva nu se leagă — de exemplu buget prea mic pentru numărul de invitați — ca să corectezi din timp.",
  },
];

const benefits = [
  "Știi în orice moment unde ai rămas cu planificarea.",
  "Vezi rapid dacă bugetul acoperă numărul de invitați.",
  "Numărătoarea inversă te ține pe drumul cel bun.",
  "Un singur ecran în loc de zece file de calcul.",
  "Sari direct la planul complet cu un click.",
  "Recomandările se actualizează la fiecare modificare.",
];

export default function PanouGeneralPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={LayoutDashboard}
        eyebrow="TAB · Panou general"
        title={TITLE}
        intro="Primul ecran după ce deschizi o nuntă: progresul planificării, cifrele-cheie și recomandările, toate la un loc."
        primary={{ href: "/register", label: "Deschide-ți panoul" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce vezi în panoul general"
        intro="Un rezumat viu al nunții, actualizat automat pe măsură ce completezi celelalte tab-uri."
        items={features}
      />
      <BenefitList title="De ce te ajută" items={benefits} />
      <CtaBand
        title="Vezi-ți progresul în timp real"
        text="Creează-ți contul gratuit și urmărește cum prinde contur nunta ta, pas cu pas."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/detalii", label: "Următorul tab: Detalii" }}
      />
    </div>
  );
}
