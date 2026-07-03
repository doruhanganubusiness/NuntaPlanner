/**
 * Populează tabelul `localities` din Supabase cu toate localitățile României
 * + sectoarele Bucureștiului. Rulează o singură dată (idempotent — șterge și rescrie):
 *   node scripts/seed-localities.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const DATASET =
  "https://raw.githubusercontent.com/virgil-av/judet-oras-localitati-romania/master/judete.json";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

console.log("Descarc datasetul…");
const data = await (await fetch(DATASET)).json();

const rows = [];
const seen = new Set();
for (const j of data.judete ?? []) {
  if (j.auto === "B") continue; // Bucureștiul: punem sectoarele manual
  for (const loc of j.localitati ?? []) {
    const name = (loc.nume ?? "").trim();
    if (!name) continue;
    const key = `${j.auto}|${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ county_code: j.auto, county: j.nume, name });
  }
}
for (let i = 1; i <= 6; i++) {
  rows.push({ county_code: "B", county: "București", name: `Sector ${i}` });
}

console.log(`Localități de inserat: ${rows.length}`);

// Idempotent: golește tabelul întâi.
await sb.from("localities").delete().neq("id", 0);

let inserted = 0;
for (let i = 0; i < rows.length; i += 1000) {
  const batch = rows.slice(i, i + 1000);
  const { error } = await sb.from("localities").insert(batch);
  if (error) {
    console.error("Eroare la insert:", error.message);
    process.exit(1);
  }
  inserted += batch.length;
  process.stdout.write(`\r  inserate: ${inserted}/${rows.length}`);
}

const counties = new Set(rows.map((r) => r.county_code));
console.log(`\nGata. ${inserted} localități, ${counties.size} județe.`);
