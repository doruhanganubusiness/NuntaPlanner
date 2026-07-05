-- NuntaPlanner — locație precisă (județ + localitate) pe evenimente și furnizori.
-- Evenimentele nunții: unde are loc fiecare slot (folosit la recomandări furnizori
-- pe locație + apropiate). Furnizorii: adresa lor exactă.

alter table public.event_slots
  add column if not exists county_code text,
  add column if not exists county text,
  add column if not exists locality text;

alter table public.vendors
  add column if not exists county_code text,
  add column if not exists county text,
  add column if not exists locality text;

create index if not exists idx_vendors_county on public.vendors (county);
