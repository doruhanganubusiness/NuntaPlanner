import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, OPERATOR } from "../_shared";
import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

export const metadata: Metadata = pageMeta({
  title: "Politica de cookies — NuntaPlanner",
  description:
    "Ce cookie-uri folosește NuntaPlanner: strict necesare, preferințe, statistici (Google Analytics 4 / Tag Manager) și marketing.",
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
      "Reține preferințele tale de cookies (pe categorii), ca să nu te întrebăm de fiecare dată.",
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

const preferences: Cookie[] = [
  {
    name: "np_prefs / localStorage",
    provider: "NuntaPlanner",
    purpose:
      "Reține opțiuni precum localitatea sau alte setări introduse de tine, ca să nu le reintroduci.",
    duration: "Până la 1 an / persistent",
  },
];

const statistics: Cookie[] = [
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

const marketing: Cookie[] = [
  {
    name: "_gcl_au",
    provider: "Google Ads",
    purpose:
      "Măsoară eficiența reclamelor (conversion linker), pentru campaniile publicitare.",
    duration: "90 de zile",
  },
  {
    name: "IDE / test_cookie",
    provider: "Google DoubleClick",
    purpose:
      "Afișează reclame relevante și măsoară performanța lor pe alte platforme.",
    duration: "test_cookie: 15 min · IDE: până la 13 luni",
  },
  {
    name: "NID",
    provider: "Google",
    purpose: "Reține preferințe pentru personalizarea reclamelor Google.",
    duration: "Până la 6 luni",
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

      <h2>2. Categoriile de cookies</h2>
      <p>
        Îți grupăm cookie-urile în patru categorii. Doar cele strict necesare se
        activează automat; pentru restul îți cerem consimțământul în bannerul de
        cookies.
      </p>

      <h3>a. Strict necesare (mereu active)</h3>
      <p>
        Esențiale pentru funcționarea site-ului: autentificare, securitate,
        păstrarea sesiunii și a alegerii tale privind cookie-urile. Nu pot fi
        dezactivate.
      </p>
      <CookieTable rows={necessary} />

      <h3>b. Preferințe (necesită consimțământ)</h3>
      <p>
        Rețin opțiuni precum limba, localitatea sau alte setări, ca să nu le
        reintroduci de fiecare dată.
      </p>
      <CookieTable rows={preferences} />

      <h3>c. Statistici (necesită consimțământ)</h3>
      <p>
        Ne ajută să înțelegem anonim cum este folosit site-ul (pagini vizitate,
        trafic), prin <strong>Google Analytics 4</strong>, încărcat prin{" "}
        <strong>Google Tag Manager</strong>, ca să îl îmbunătățim. Folosim IP-uri
        anonimizate.
      </p>
      <CookieTable rows={statistics} />

      <h3>d. Marketing (necesită consimțământ)</h3>
      <p>
        Folosite pentru a măsura campaniile și a-ți afișa conținut relevant pe
        alte platforme (de ex. Google Ads). Aceste cookie-uri se instalează doar
        dacă accepți categoria de marketing și în funcție de etichetele
        configurate în Google Tag Manager.
      </p>
      <CookieTable rows={marketing} />

      <h2>3. Google Tag Manager, Analytics 4, Search Console și Consent Mode v2</h2>
      <ul>
        <li>
          <strong>Google Tag Manager (GTM):</strong> containerul care încarcă și
          gestionează etichetele (analytics, marketing). GTM în sine nu setează,
          de regulă, cookie-uri de urmărire.
        </li>
        <li>
          <strong>Google Analytics 4 (GA4):</strong> serviciul de analiză web, cu
          cookie-urile <code>_ga</code>, <code>_ga_*</code>, <code>_gid</code>,
          pentru statistici agregate de trafic.
        </li>
        <li>
          <strong>Google Search Console (GSC):</strong> îl folosim pentru a
          monitoriza prezența site-ului în căutarea Google. Verificarea se face
          printr-o etichetă meta sau prin DNS și, de regulă,{" "}
          <strong>nu instalează cookie-uri</strong> pe dispozitivul tău.
        </li>
        <li>
          <strong>Consent Mode v2:</strong> înainte de a încărca etichetele
          Google, setăm consimțământul implicit pe „refuzat” pentru statistici și
          marketing. Abia după acceptul tău transmitem „granted”, iar Google
          folosește până atunci doar semnale fără cookies.
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
        le poți respinge pe cele neesențiale sau poți alege pe categorii
        (Preferințe, Statistici, Marketing). Îți poți schimba oricând opțiunea:
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
