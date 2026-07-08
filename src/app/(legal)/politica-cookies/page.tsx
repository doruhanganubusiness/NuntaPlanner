import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, OPERATOR } from "../_shared";
import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

export const metadata: Metadata = pageMeta({
  title: "Politica de cookies — NuntaPlanner",
  description:
    "Ce cookie-uri folosește NuntaPlanner: strict necesare și de analiză — Google Analytics 4, Tag Manager și Search Console.",
  path: "/politica-cookies",
});

type Cookie = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
};

const necessary: Cookie[] = [
  {
    name: "np_consent",
    provider: "NuntaPlanner",
    purpose:
      "Reține preferințele tale de cookies (acceptat / respins / pe categorii), ca să nu te întrebăm de fiecare dată.",
    duration: "6 luni",
  },
  {
    name: "sb-<proiect>-auth-token",
    provider: "Supabase",
    purpose:
      "Menține sesiunea de autentificare (te ține conectat în contul de miri sau furnizor).",
    duration: "Sesiune / până la 1 an",
  },
  {
    name: "sb-refresh-token",
    provider: "Supabase",
    purpose: "Reînnoiește automat sesiunea, ca să nu fii deconectat.",
    duration: "Până la 1 an",
  },
];

const analytics: Cookie[] = [
  {
    name: "_ga",
    provider: "Google Analytics 4",
    purpose: "Distinge utilizatorii unici prin atribuirea unui ID aleatoriu.",
    duration: "2 ani",
  },
  {
    name: "_ga_<ID-container>",
    provider: "Google Analytics 4",
    purpose: "Reține starea sesiunii pentru proprietatea GA4.",
    duration: "2 ani",
  },
  {
    name: "_gid",
    provider: "Google Analytics",
    purpose: "Distinge utilizatorii pe termen scurt, pentru statistici de trafic.",
    duration: "24 de ore",
  },
  {
    name: "_gat / _gat_gtag_*",
    provider: "Google Analytics",
    purpose: "Limitează rata de trimitere a cererilor (throttling).",
    duration: "1 minut",
  },
];

function CookieTable({ rows }: { rows: Cookie[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-foreground">
            <th className="py-2 pr-4 font-semibold">Cookie</th>
            <th className="py-2 pr-4 font-semibold">Furnizor</th>
            <th className="py-2 pr-4 font-semibold">Scop</th>
            <th className="py-2 font-semibold">Durată</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map((c) => (
            <tr key={c.name} className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                {c.name}
              </td>
              <td className="py-2 pr-4">{c.provider}</td>
              <td className="py-2 pr-4">{c.purpose}</td>
              <td className="py-2">{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PoliticaCookiesPage() {
  return (
    <>
      <LegalHeader title="Politica de cookies" />

      <p>
        Această politică explică ce sunt cookie-urile, ce tipuri folosește
        platforma {OPERATOR.brand} (<a href={OPERATOR.site}>{OPERATOR.siteLabel}</a>
        ) și cum îți poți gestiona consimțământul. Este parte integrantă din{" "}
        <Link href="/confidentialitate">Politica de confidențialitate</Link>.
      </p>

      <h2>1. Ce sunt cookie-urile</h2>
      <p>
        Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău când
        vizitezi un site. Ele ne ajută să menținem sesiunea, să reținem
        preferințele tale și să înțelegem cum este folosit site-ul. Folosim și
        tehnologii similare (localStorage, pixeli).
      </p>

      <h2>2. Categoriile de cookies pe care le folosim</h2>

      <h3>a. Strict necesare (nu pot fi dezactivate)</h3>
      <p>
        Sunt esențiale pentru funcționarea site-ului: autentificare, securitate
        și reținerea opțiunii tale privind cookie-urile. Se instalează fără a fi
        nevoie de consimțământ.
      </p>
      <CookieTable rows={necessary} />

      <h3>b. De analiză și performanță (necesită consimțământ)</h3>
      <p>
        Ne ajută să înțelegem cum este folosit site-ul, ce pagini sunt populare și
        unde putem îmbunătăți. Aceste cookie-uri se activează doar după ce le
        accepți în bannerul de consimțământ. Le gestionăm prin{" "}
        <strong>Google Tag Manager (GTM)</strong>, care încarcă{" "}
        <strong>Google Analytics 4 (GA4)</strong>.
      </p>
      <CookieTable rows={analytics} />

      <h2>3. Google Tag Manager, Google Analytics 4 și Search Console</h2>
      <ul>
        <li>
          <strong>Google Tag Manager (GTM):</strong> este un sistem de gestionare
          a etichetelor. GTM în sine nu setează, de regulă, cookie-uri de
          urmărire, dar este containerul care încarcă alte instrumente (precum
          GA4). Îl activăm doar după acordul tău pentru categoria de analiză.
        </li>
        <li>
          <strong>Google Analytics 4 (GA4):</strong> serviciu de analiză web al
          Google, care folosește cookie-urile de mai sus (<code>_ga</code>,{" "}
          <code>_ga_*</code>, <code>_gid</code>) pentru a genera statistici
          agregate despre trafic. Folosim IP-uri anonimizate și modul de
          consimțământ (Consent Mode v2).
        </li>
        <li>
          <strong>Google Search Console (GSC):</strong> îl folosim pentru a
          monitoriza prezența site-ului în căutarea Google. Verificarea
          proprietății se face printr-o etichetă meta sau prin DNS și, de regulă,{" "}
          <strong>nu instalează cookie-uri</strong> pe dispozitivul tău. Google
          poate colecta date de căutare agregate, conform politicilor sale.
        </li>
      </ul>
      <p>
        Prelucrarea de către Google este guvernată de{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer"
        >
          politica de confidențialitate Google
        </a>
        .
      </p>

      <h2>4. Cum îți gestionezi consimțământul</h2>
      <p>
        La prima vizită îți afișăm un banner unde poți accepta toate cookie-urile,
        le poți respinge pe cele neesențiale sau poți alege pe categorii. Îți poți
        schimba oricând opțiunea:
      </p>
      <p>
        <CookiePreferencesButton />
      </p>
      <p>
        Poți, de asemenea, șterge sau bloca cookie-urile din setările browserului
        tău. Reține că blocarea cookie-urilor strict necesare poate afecta
        funcționarea site-ului.
      </p>

      <h2>5. Contact</h2>
      <p>
        Pentru întrebări despre cookie-uri, scrie-ne la{" "}
        <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Vezi și{" "}
        <Link href="/confidentialitate">Politica de confidențialitate</Link> și{" "}
        <Link href="/termeni-si-conditii">Termenii și condițiile</Link>.
      </p>
    </>
  );
}
