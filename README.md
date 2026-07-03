# NuntaPlanner

Platformă de planificare a nunții pentru miri. Motorul de calcul generează automat
recomandări concrete: cantități de băutură, dulciuri/tort, dimensiunea sălii,
formație vs DJ și defalcarea bugetului pe categorii.

**Faza 1 (actuală):** planner pentru miri. **Faza furnizori** (lead-uri, plăți, chat)
e proiectată în schemă dar neimplementată încă — vezi `docs/`.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (Postgres + Auth, JWT prin cookies SSR)
- **Motor de calcul** — modul TypeScript pur, testat cu Vitest, refolosibil web + mobil

## Setup

```bash
npm install
cp .env.example .env.local   # completează cheile Supabase

# aplică schema pe Supabase (o singură dată)
supabase link --project-ref iwakrrugfdtslficmori
supabase db push

npm run dev                  # http://localhost:3000
```

## Comenzi

| Comandă | Descriere |
|---|---|
| `npm run dev` | Server de dezvoltare |
| `npm run build` | Build de producție |
| `npm test` | Testele motorului de calcul (Vitest) |
| `npm run lint` | ESLint |

## Structura

```
src/
  lib/engine/        Motorul de calcul (pur, testat) — secțiunea 5 din spec
  lib/supabase/      Clienți Supabase (server/browser/admin) + tipuri Database
  lib/wedding/       Punte DB → motor, cache calcule
  lib/api/           Helper-e HTTP, scheme Zod, client fetch
  app/api/v1/        API REST v1 (auth, weddings, members, slots, calculations)
  app/dashboard/     Dashboard-ul mirilor (overview, detalii, sloturi, buget, plan, membri)
  components/        Primitive UI + componente dashboard
supabase/migrations/ Schema Faza 1 (SQL versionat)
docs/                Specificația tehnică v1.2
```

## Motorul de calcul

Inima produsului. `computeWedding(input, configOverride?)` din `src/lib/engine`
este pur și determinist — zero dependențe de DB — deci se refolosește identic în
API-ul web și în aplicația mobilă (Faza 2). Toate constantele trăiesc în config
(`config_parameters` în DB), nu hardcodate.
