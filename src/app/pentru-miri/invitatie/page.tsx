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
  ClipboardCheck,
  MailOpen,
  MapPin,
  MessageSquareText,
  Navigation,
  Share2,
} from "lucide-react";

export const metadata: Metadata = pageMeta({
  title: "Invitație digitală de nuntă cu RSVP online",
  description:
    "Creează o invitație digitală cu link partajabil, hartă și RSVP. Confirmările invitaților ajung direct în panoul tău.",
  path: "/pentru-miri/invitatie",
  keywords: [
    "invitație digitală nuntă",
    "RSVP nuntă",
    "invitație online nuntă",
    "confirmare prezență nuntă",
  ],
});

const features: Feature[] = [
  {
    icon: MessageSquareText,
    title: "Text personalizabil",
    text: "Numele mirilor și mesajul invitației, editabile. Data, locația și programul se preiau automat din nunta ta.",
  },
  {
    icon: MapPin,
    title: "Hartă către locații",
    text: "Adresa fiecărui slot devine link clickabil către Google Maps, direct din invitație.",
  },
  {
    icon: Navigation,
    title: "Buton Waze",
    text: "Pe lângă Google Maps, invitații pot deschide traseul și în Waze, cu un singur tap.",
  },
  {
    icon: Share2,
    title: "Link partajabil",
    text: "Primești un link public al invitației, pe care îl trimiți pe WhatsApp, Facebook sau oriunde vrei.",
  },
  {
    icon: ClipboardCheck,
    title: "RSVP online",
    text: "Invitații confirmă prezența direct din invitație, fără să te sune sau să-ți scrie separat.",
  },
  {
    icon: MailOpen,
    title: "Confirmări în panou",
    text: "Toate răspunsurile apar în lista „Confirmări primite”, ca să știi în timp real cine vine.",
  },
];

const benefits = [
  "Invitație gata în câteva minute, fără designer.",
  "Datele nunții se sincronizează automat — zero dublă muncă.",
  "Invitații ajung ușor la locație, cu hartă și Waze.",
  "Aduni confirmările într-un singur loc, ordonat.",
  "Afli numărul real de invitați pentru sală și meniu.",
  "O trimiți oricui, printr-un simplu link.",
];

export default function InvitatiePage() {
  return (
    <div className="space-y-16">
      <Hero
        icon={MailOpen}
        eyebrow="TAB · Invitație"
        title="Invitația digitală cu RSVP"
        intro="Creezi o invitație online elegantă, cu link partajabil și hartă, iar confirmările invitaților ajung direct în panoul tău."
        primary={{ href: "/register", label: "Creează-ți invitația" }}
        secondary={{ href: "/pentru-miri", label: "Vezi toate tab-urile" }}
      />
      <FeatureGrid
        title="Ce oferă invitația digitală"
        intro="O invitație vie, conectată la datele nunții și la confirmările invitaților."
        items={features}
      />
      <BenefitList title="De ce merită" items={benefits} />
      <CtaBand
        title="Trimite invitații și strânge confirmări"
        text="Personalizează invitația, copiază linkul și urmărește cine confirmă, totul dintr-un singur loc."
        primary={{ href: "/register", label: "Începe gratuit" }}
        secondary={{ href: "/pentru-miri/membri", label: "Următorul tab: Membri" }}
      />
    </div>
  );
}
