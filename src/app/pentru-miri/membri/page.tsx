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
  BadgeCheck,
  Link as LinkIcon,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

export const metadata: Metadata = pageMeta({
  title: "Membri și permisiuni la planificarea nunții",
  description:
    "Invită miri, părinți și nași cu rol și drept de vizualizare sau editare. Colaborați la aceeași planificare a nunții.",
  path: "/pentru-miri/membri",
  keywords: [
    "colaborare planificare nuntă",
    "membri nuntă",
    "permisiuni nuntă",
    "roluri nuntă",
  ],
});

const features: Feature[] = [
  {
    icon: Mail,
    title: "Invitație pe email",
    text: "Adaugi un membru după adresa de email, iar invitația pleacă automat. Dacă emailul nu poate fi trimis, ai un link de rezervă.",
  },
  {
    icon: Users,
    title: "Roluri clare",
    text: "Mire, mireasă, părinte, naș sau vizitator — fiecare persoană primește rolul potrivit în planificare.",
  },
  {
    icon: ShieldCheck,
    title: "Permisiuni de acces",
    text: "Alegi între vizualizare (doar citește) și editare (poate modifica), ca să controlezi cine ce poate schimba.",
  },
  {
    icon: LinkIcon,
    title: "Link de invitație",
    text: "Pentru membrii în așteptare copiezi un link de invitație și îl trimiți direct, oricând ai nevoie.",
  },
  {
    icon: BadgeCheck,
    title: "Stare la zi",
    text: "Vezi imediat cine e activ și cine e încă în așteptare, plus rolul și permisiunea fiecăruia.",
  },
  {
    icon: UserPlus,
    title: "Gestionare simplă",
    text: "Adaugi sau elimini membri oricând. Proprietarul planificării rămâne mereu protejat.",
  },
];

const benefits = [
  "Planifici nunta împreună cu părinții și nașii.",
  "Fiecare vede exact ce are nevoie, nimic în plus.",
  "Controlezi cine poate doar citi și cine poate edita.",
  "Invitații pleacă automat pe email, cu link de rezervă.",
  "Vezi mereu cine a acceptat și cine e în așteptare.",
  "Un singur plan comun, fără versiuni pierdute.",
];

export default function MembriPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={Users}
        eyebrow="TAB · Membri"
        title="Colaborați la aceeași nuntă"
        intro="Invită oamenii apropiați să planifice alături de tine, fiecare cu rolul și drepturile lui — de la simpla vizualizare la editare completă."
        primary={{ href: "/register", label: "Invită-ți echipa" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce faci în tab-ul Membri"
        intro="Adaugi colaboratori și le dai exact accesul potrivit, în câteva secunde."
        items={features}
      />
      <BenefitList title="De ce e util" items={benefits} />
      <CtaBand
        title="Planificați nunta împreună"
        text="Creează-ți contul, invită-ți părinții și nașii și lucrați la același plan, fiecare cu rolul lui."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri", label: "Înapoi la prezentare" }}
      />
    </div>
  );
}
