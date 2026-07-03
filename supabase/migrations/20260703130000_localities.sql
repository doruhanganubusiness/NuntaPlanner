-- NuntaPlanner: baza de localități (județ + localitate) pentru selectorul în cascadă.
-- Date de referință publice; se populează cu scriptul scripts/seed-localities.mjs.

create table public.localities (
  id bigint generated always as identity primary key,
  county_code text not null,        -- cod auto (AB, CJ, B, ...)
  county text not null,             -- numele județului (canonic)
  name text not null,               -- numele localității
  unique (county_code, name)
);

create index idx_localities_county on public.localities (county_code);

alter table public.localities enable row level security;

-- Reference data: citibilă public.
create policy localities_read on public.localities
  for select using (true);

-- Câmpuri pe weddings pentru localitatea aleasă (județ + localitate).
alter table public.weddings add column county_code text;
alter table public.weddings add column county text;
alter table public.weddings add column locality text;
