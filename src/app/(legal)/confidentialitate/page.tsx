import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, OPERATOR } from "../_shared";

export const metadata: Metadata = pageMeta({
  title: "Politica de confidențialitate — NuntaPlanner",
  description:
    "Cum colectăm și protejăm datele tale pe NuntaPlanner: temeiuri legale, drepturile tale GDPR, perioade de stocare și împuterniciți.",
  path: "/confidentialitate",
});

export default function ConfidentialitatePage() {
  return (
    <>
      <LegalHeader title="Politica de confidențialitate" />

      <p>
        Confidențialitatea ta este importantă pentru noi. Această politică explică
        ce date cu caracter personal colectăm prin platforma {OPERATOR.brand} (
        <a href={OPERATOR.site}>{OPERATOR.siteLabel}</a>), cum le folosim și ce
        drepturi ai, în conformitate cu Regulamentul (UE) 2016/679 (GDPR).
      </p>

      <h2>1. Cine este operatorul</h2>
      <p>
        Operatorul datelor este {OPERATOR.legalName}. Ne poți contacta pentru
        orice aspect legat de protecția datelor la{" "}
        <a href={`mailto:${OPERATOR.dpoEmail}`}>{OPERATOR.dpoEmail}</a>.
      </p>

      <h2>2. Ce date colectăm</h2>
      <ul>
        <li>
          <strong>Date de cont:</strong> nume, adresă de e-mail, parolă (stocată
          criptat), tipul contului (miri sau furnizor).
        </li>
        <li>
          <strong>Date despre nuntă:</strong> data și tipul evenimentului, număr
          de invitați, buget, membri invitați, detalii pentru invitația digitală
          și confirmări RSVP.
        </li>
        <li>
          <strong>Date de furnizor:</strong> denumire, categorie, localitate,
          descriere, imagini și date de contact publicate în profil.
        </li>
        <li>
          <strong>Date de comunicare:</strong> mesajele schimbate între miri și
          furnizori prin platformă.
        </li>
        <li>
          <strong>Date tehnice:</strong> adresă IP, tip de dispozitiv și browser,
          pagini vizitate — colectate prin cookie-uri și instrumente de analiză
          (vezi <Link href="/politica-cookies">Politica de cookies</Link>).
        </li>
        <li>
          <strong>Date de plată:</strong> pentru serviciile plătite, datele
          cardului sunt procesate direct de Stripe; noi nu stocăm numărul
          complet al cardului.
        </li>
      </ul>

      <h2>3. Scopurile și temeiurile legale</h2>
      <ul>
        <li>
          <strong>Furnizarea serviciului</strong> (cont, planificator, director,
          mesagerie) — executarea contractului (art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>Procesarea plăților și facturare</strong> — executarea
          contractului și obligație legală (art. 6(1)(b) și (c)).
        </li>
        <li>
          <strong>Analiză și îmbunătățirea platformei</strong> (GA4, GTM) — pe
          baza consimțământului tău (art. 6(1)(a)), acordat prin bannerul de
          cookies.
        </li>
        <li>
          <strong>Comunicări legate de serviciu și notificări</strong> — interes
          legitim (art. 6(1)(f)) sau consimțământ pentru comunicări de marketing.
        </li>
        <li>
          <strong>Securitate și prevenirea abuzurilor</strong> — interes legitim
          (art. 6(1)(f)).
        </li>
      </ul>

      <h2>4. Cui divulgăm datele (persoane împuternicite)</h2>
      <p>
        Nu vindem datele tale. Le partajăm doar cu furnizori de servicii care ne
        ajută să operăm Platforma, pe bază de contract:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — găzduirea bazei de date și autentificare.
        </li>
        <li>
          <strong>Vercel</strong> — găzduirea și livrarea aplicației web.
        </li>
        <li>
          <strong>Stripe</strong> — procesarea plăților.
        </li>
        <li>
          <strong>Resend</strong> — trimiterea e-mailurilor tranzacționale.
        </li>
        <li>
          <strong>Google</strong> (Analytics 4, Tag Manager, Search Console) —
          măsurarea traficului și optimizarea site-ului.
        </li>
      </ul>
      <p>
        Atunci când datele sunt transferate în afara SEE, ne asigurăm că există
        garanții adecvate (de ex. clauze contractuale standard ale UE).
      </p>

      <h2>5. Cât timp păstrăm datele</h2>
      <ul>
        <li>
          <strong>Datele de cont și de nuntă:</strong> pe durata existenței
          contului. Le ștergem sau anonimizăm după ștergerea contului, cu excepția
          celor pe care legea ne obligă să le păstrăm.
        </li>
        <li>
          <strong>Documente financiare:</strong> conform obligațiilor legale (de
          regulă 10 ani).
        </li>
        <li>
          <strong>Date de analiză:</strong> conform perioadelor de retenție ale
          Google Analytics 4.
        </li>
      </ul>

      <h2>6. Drepturile tale</h2>
      <p>Conform GDPR, ai dreptul la:</p>
      <ul>
        <li>acces la datele tale și o copie a acestora;</li>
        <li>rectificarea datelor inexacte;</li>
        <li>ștergerea datelor („dreptul de a fi uitat”);</li>
        <li>restricționarea sau opoziția la prelucrare;</li>
        <li>portabilitatea datelor;</li>
        <li>
          retragerea consimțământului oricând (de ex. pentru cookie-uri de
          analiză), fără a afecta prelucrarea anterioară.
        </li>
      </ul>
      <p>
        Îți poți exercita drepturile scriindu-ne la{" "}
        <a href={`mailto:${OPERATOR.dpoEmail}`}>{OPERATOR.dpoEmail}</a>. Ai, de
        asemenea, dreptul de a depune o plângere la Autoritatea Națională de
        Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
      </p>

      <h2>7. Securitate</h2>
      <p>
        Aplicăm măsuri tehnice și organizatorice adecvate (criptare în tranzit,
        control al accesului, reguli de acces la nivel de rând în baza de date)
        pentru a proteja datele împotriva accesului neautorizat, pierderii sau
        divulgării.
      </p>

      <h2>8. Modificări ale acestei politici</h2>
      <p>
        Putem actualiza această politică. Vom afișa data ultimei actualizări în
        partea de sus și, pentru modificări importante, te vom notifica prin
        Platformă sau e-mail.
      </p>

      <h2>9. Contact</h2>
      <p>
        Pentru orice întrebare privind datele tale, scrie-ne la{" "}
        <a href={`mailto:${OPERATOR.dpoEmail}`}>{OPERATOR.dpoEmail}</a>. Vezi și{" "}
        <Link href="/politica-cookies">Politica de cookies</Link> și{" "}
        <Link href="/termeni-si-conditii">Termenii și condițiile</Link>.
      </p>
    </>
  );
}
