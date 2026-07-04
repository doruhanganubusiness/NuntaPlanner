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
  Clock,
  MapPin,
  Users,
  Utensils,
  Wine,
} from "lucide-react";

export const metadata: Metadata = pageMeta({
  title: "Sloturi nuntă: programul zilei pe momente",
  description:
    "Adaugă cununia, botezul și petrecerea cu oră, locație și număr de invitați. Baza pentru calculele automate ale nunții.",
  path: "/pentru-miri/sloturi",
  keywords: ["program nuntă", "sloturi nuntă", "cununie", "petrecere nuntă"],
});

const features: Feature[] = [
  {
    icon: CalendarClock,
    title: "Momente separate",
    text: "Cununie civilă, cununie religioasă, botez sau petrecere — fiecare moment e un slot cu setările lui proprii.",
  },
  {
    icon: Clock,
    title: "Oră și durată",
    text: "Setezi ora de început, iar pentru petrecere și durata în ore. Programul zilei se leagă automat pe invitație.",
  },
  {
    icon: Users,
    title: "Invitați per slot",
    text: "Numărul de adulți și copii pentru fiecare moment. Nu toți invitații vin la toate momentele — și e în regulă.",
  },
  {
    icon: MapPin,
    title: "Locație și adresă",
    text: "Numele și adresa fiecărei locații — ex. biserica sau restaurantul. Adresa devine link către hartă pe invitație.",
  },
  {
    icon: Wine,
    title: "Alcool și masă",
    text: "Bifezi dacă la slot se servește alcool și masă completă. De aici pornesc cantitățile de băutură și mâncare.",
  },
  {
    icon: Utensils,
    title: "Setări implicite pe tip",
    text: "Când alegi tipul slotului, titlul, durata, alcoolul și masa se completează automat cu valori potrivite.",
  },
];

const benefits = [
  "Reflectă exact cum arată ziua nunții tale.",
  "Numărul real de invitați per moment, nu o cifră globală.",
  "Sursa tuturor calculelor: băutură, sală, dulciuri.",
  "Locațiile ajung automat pe invitația digitală.",
  "Adaugi sau ștergi momente oricând, fără efort.",
  "Setările implicite îți economisesc timp.",
];

export default function SloturiPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={CalendarClock}
        eyebrow="TAB · Sloturi"
        title="Programul zilei, moment cu moment"
        intro="Sloturile descriu cum se desfășoară nunta: fiecare moment cu ora, locația și invitații lui. Sunt fundația pe care se fac toate calculele."
        primary={{ href: "/register", label: "Adaugă sloturile" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce configurezi pentru fiecare slot"
        intro="Fiecare moment al zilei are propriile setări — le controlezi în detaliu."
        items={features}
      />
      <BenefitList title="De ce sunt importante sloturile" items={benefits} />
      <CtaBand
        title="Construiește programul nunții"
        text="Adaugă momentele zilei și lasă aplicația să calculeze restul, de la băutură la dimensiunea sălii."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/buget", label: "Următorul tab: Buget" }}
      />
    </div>
  );
}
