import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader, OPERATOR } from "../_shared";

export const metadata: Metadata = pageMeta({
  title: "Termeni și condiții — NuntaPlanner",
  description:
    "Termenii și condițiile de utilizare a platformei NuntaPlanner: conturi, conținut, plăți și limitarea răspunderii.",
  path: "/termeni-si-conditii",
});

export default function TermeniPage() {
  return (
    <>
      <LegalHeader title="Termeni și condiții" />

      <p>
        Acești termeni și condiții („Termenii”) reglementează utilizarea
        platformei {OPERATOR.brand}, disponibilă la{" "}
        <a href={OPERATOR.site}>{OPERATOR.siteLabel}</a> („Platforma”), operată
        de {OPERATOR.legalName} („noi”, „operatorul”). Prin crearea unui cont sau
        prin utilizarea Platformei, ești de acord cu acești Termeni. Dacă nu ești
        de acord, te rugăm să nu folosești Platforma.
      </p>

      <h2>1. Descrierea serviciului</h2>
      <p>
        {OPERATOR.brand} este o platformă care ajută mirii să își planifice
        nunta (buget, invitați, evenimente, calcule automate, invitație digitală
        cu RSVP) și pune la dispoziția furnizorilor un director în care își pot
        prezenta serviciile. Utilizarea planificatorului este gratuită pentru
        miri.
      </p>

      <h2>2. Conturi de utilizator</h2>
      <ul>
        <li>
          <strong>Eligibilitate:</strong> trebuie să ai cel puțin 18 ani și
          capacitate deplină de exercițiu pentru a crea un cont.
        </li>
        <li>
          <strong>Acuratețea datelor:</strong> te obligi să furnizezi informații
          reale și să le menții actualizate.
        </li>
        <li>
          <strong>Securitatea contului:</strong> ești responsabil pentru
          păstrarea confidențialității parolei și pentru toate activitățile din
          contul tău.
        </li>
      </ul>

      <h2>3. Drepturi și obligații ale utilizatorului</h2>
      <ul>
        <li>Folosești Platforma doar în scopuri legale și conforme acestor Termeni.</li>
        <li>
          Nu încarci conținut ilegal, înșelător, ofensator sau care încalcă
          drepturile terților.
        </li>
        <li>
          Nu încerci să accesezi neautorizat sistemele, să extragi masiv date
          (scraping) sau să perturbi funcționarea Platformei.
        </li>
      </ul>

      <h2>4. Furnizori și director</h2>
      <p>
        Furnizorii sunt responsabili pentru corectitudinea informațiilor
        publicate în profilul lor. Operatorul poate verifica, suspenda sau elimina
        profilurile care încalcă Termenii. Anumite funcționalități pentru
        furnizori pot fi contra cost, conform planurilor afișate în Platformă.
      </p>

      <h2>5. Conținutul tău</h2>
      <p>
        Păstrezi drepturile asupra conținutului pe care îl încarci (text, imagini,
        detaliile nunții). Ne acorzi o licență limitată, neexclusivă, necesară
        pentru a găzdui și afișa acest conținut în cadrul serviciului (de ex.
        invitația digitală partajabilă).
      </p>

      <h2>6. Plăți și abonamente</h2>
      <p>
        Plățile pentru serviciile plătite (de ex. abonamente pentru furnizori)
        sunt procesate prin furnizori de plată terți (Stripe). Prețurile și
        condițiile de facturare sunt afișate înainte de plată. Eventualele
        rambursări se acordă conform legislației aplicabile.
      </p>

      <h2>7. Disponibilitate și modificări</h2>
      <p>
        Depunem eforturi rezonabile pentru a menține Platforma funcțională, dar
        nu garantăm funcționarea neîntreruptă. Putem modifica, suspenda sau
        întrerupe funcționalități, cu notificare acolo unde este posibil.
      </p>

      <h2>8. Limitarea răspunderii</h2>
      <p>
        Calculele și recomandările Platformei (cantități, buget, dimensiunea
        sălii) au caracter orientativ. Nu garantăm rezultate specifice și nu
        răspundem pentru deciziile luate pe baza acestora. În limitele permise de
        lege, răspunderea noastră este limitată la sumele plătite de tine, dacă
        există, în ultimele 12 luni.
      </p>

      <h2>9. Încetare</h2>
      <p>
        Îți poți șterge contul oricând. Putem suspenda sau închide conturi care
        încalcă acești Termeni. La încetare, unele date pot fi păstrate conform
        obligațiilor legale (vezi{" "}
        <Link href="/confidentialitate">Politica de confidențialitate</Link>).
      </p>

      <h2>10. Legea aplicabilă</h2>
      <p>
        Acești Termeni sunt guvernați de legea română. Eventualele litigii se
        soluționează de instanțele competente din România, fără a aduce atingere
        drepturilor tale în calitate de consumator.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pentru întrebări legate de acești Termeni, ne poți scrie la{" "}
        <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Vezi și{" "}
        <Link href="/confidentialitate">Politica de confidențialitate</Link> și{" "}
        <Link href="/politica-cookies">Politica de cookies</Link>.
      </p>
    </>
  );
}
