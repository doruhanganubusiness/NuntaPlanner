import {
  BenefitList,
  CtaBand,
  FeatureGrid,
  Hero,
  type Feature,
} from "@/components/marketing/sections";
import { Card, CardContent } from "@/components/ui/card";
import { pageMeta } from "@/lib/seo";
import { TIER_PRICING, type VendorTier } from "@/lib/vendors/categories";
import type { Metadata } from "next";
import {
  BadgeCheck,
  ClipboardList,
  Handshake,
  Lock,
  Megaphone,
  Store,
  Users,
  Wallet,
} from "lucide-react";

// Titlul paginii — folosit deopotrivă ca meta title și ca H1 (vezi Hero).
const TITLE = "NuntaPlanner pentru furnizori: cereri de la miri";

export const metadata: Metadata = pageMeta({
  title: TITLE,
  description:
    "Listează-ți serviciile în director, primești cereri de la miri și plătești doar per lead sau cu abonament lunar.",
  path: "/pentru-furnizori",
  keywords: [
    "furnizori nuntă",
    "servicii nuntă",
    "lead-uri nuntă",
    "promovare furnizor nuntă",
    "director furnizori nuntă",
  ],
});

const features: Feature[] = [
  {
    icon: Store,
    title: "Profil în director",
    text: "Îți creezi un profil cu servicii, regiuni, descriere și logo. După verificare apari în directorul public de furnizori.",
  },
  {
    icon: Users,
    title: "Cereri de la miri",
    text: "Mirii interesați îți trimit cereri cu data, regiunea și detaliile evenimentului — direct în panoul tău.",
  },
  {
    icon: Wallet,
    title: "Plătești per lead",
    text: "Deblochezi contactul unui mire doar când vrei, printr-o plată unică (CPL), în funcție de tier-ul categoriei tale.",
  },
  {
    icon: BadgeCheck,
    title: "Sau abonament lunar",
    text: "Cu abonament activ deblochezi contacte nelimitat, fără să mai plătești per lead. Îl anulezi oricând.",
  },
  {
    icon: Lock,
    title: "Contact protejat",
    text: "Contactul mirilor rămâne mascat până îl deblochezi, ca să primești doar cereri reale, fără spam.",
  },
  {
    icon: Handshake,
    title: "Zero comision pe servicii",
    text: "Plata serviciilor tale se face direct între tine și miri. NuntaPlanner nu ia niciun comision din contracte.",
  },
];

const steps: Feature[] = [
  {
    icon: ClipboardList,
    title: "1. Creezi profilul",
    text: "Îți alegi categoria, regiunile acoperite și adaugi descriere, logo și date de contact.",
  },
  {
    icon: BadgeCheck,
    title: "2. Ești verificat",
    text: "Verificăm manual profilul, apoi devii vizibil în directorul public și pe paginile de categorie.",
  },
  {
    icon: Megaphone,
    title: "3. Primești cereri",
    text: "Mirii te contactează, iar tu deblochezi contactele — per lead sau cu abonament — și încheiați direct.",
  },
];

const benefits = [
  "Ajungi la cupluri care planifică activ nunta, nu la trafic rece.",
  "Cereri cu context: dată, regiune și detaliile evenimentului.",
  "Plătești doar pentru contactele care te interesează.",
  "Abonament lunar pentru deblocări nelimitate, când ai volum mare.",
  "Fără comision pe serviciile tale — încasezi integral de la miri.",
  "Profil verificat care crește încrederea mirilor.",
];

const TIER_ORDER: VendorTier[] = ["budget", "mid", "premium"];

export default function PentruFurnizoriPage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={Store}
        eyebrow="Pentru furnizori"
        title={TITLE}
        intro="Listează-ți serviciile în directorul NuntaPlanner, primește cereri de la miri pregătiți de nuntă și plătește doar per lead deblocat sau printr-un abonament lunar."
        primary={{ href: "/register?type=vendor", label: "Devino furnizor" }}
        secondary={{ href: "/login?type=vendor", label: "Am deja cont" }}
      />

      <FeatureGrid
        title="Cum te ajută NuntaPlanner"
        intro="De la un profil verificat până la cereri reale de la miri, cu un model de plată flexibil."
        items={features}
      />

      <FeatureGrid
        title="Cum începi, în 3 pași"
        intro="Îți creezi contul de furnizor și ești vizibil mirilor în câteva minute."
        items={steps}
      />

      <section>
        <h2 className="text-2xl font-bold tracking-tight">
          Prețuri pe tier de categorie
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Fiecare categorie aparține unui tier. Alegi de fiecare dată: plată
          unică per lead deblocat sau abonament lunar cu deblocări nelimitate.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const p = TIER_PRICING[tier];
            return (
              <Card key={tier}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{p.label}</h3>
                  <p className="mt-3 text-3xl font-bold">
                    {p.cplRON}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      RON / lead
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    sau <b className="text-foreground">{p.monthlyRON} RON</b> /
                    lună abonament — deblocări nelimitate.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <BenefitList title="De ce aleg furnizorii NuntaPlanner" items={benefits} />

      <CtaBand
        title="Gata să primești cereri de la miri?"
        text="Creează-ți profilul de furnizor, listează-ți serviciile în director și începe să deblochezi contacte de la cupluri care își planifică nunta acum."
        primary={{ href: "/register?type=vendor", label: "Devino furnizor" }}
        secondary={{ href: "/login?type=vendor", label: "Autentificare" }}
      />
    </div>
  );
}
