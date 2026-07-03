# Supabase — NuntaPlanner (Faza 1)

Schema Fazei 1 (planner pentru miri, fără furnizori) e livrată ca migrații SQL
versionate în `supabase/migrations/`.

## Aplicare (recomandat: Supabase CLI)

```bash
# o singură dată — leagă repo-ul de proiectul remote
supabase login
supabase link --project-ref iwakrrugfdtslficmori

# aplică toate migrațiile în ordine
supabase db push
```

## Alternativ (fără CLI)

Deschide **SQL Editor** în dashboard-ul proiectului și rulează, în ordine,
conținutul fișierelor:

1. `20260703120000_init_schema.sql` — enum-uri, tabele, triggere
2. `20260703120100_rls.sql` — RLS, helpers, RPC-uri (`create_wedding`, `accept_invite`)
3. `20260703120200_seed_config.sql` — config implicit al motorului

## După aplicare — tipuri TypeScript

```bash
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

## Tabele Faza 1

`profiles`, `weddings`, `wedding_members`, `event_slots`, `calc_results`,
`config_parameters`. Autentificarea folosește `auth.users` (Supabase Auth);
un trigger creează automat un rând în `profiles` la fiecare signup.

**Excluse din Faza 1** (se adaugă la faza furnizori): `vendors`, `leads`,
`payments`, `subscriptions`.
