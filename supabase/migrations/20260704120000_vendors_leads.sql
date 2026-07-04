-- NuntaPlanner — Faza 2 (Incrementul 1): marketplace furnizori — tabele + enum-uri.
-- Oglindește secțiunea 3.7–3.10 din specificație. Tabelele reviews/payments/
-- subscriptions sunt create pentru extensibilitate, dar nefolosite în UI acum.

-- ------------------------------------------------------------------
-- Enum-uri
-- ------------------------------------------------------------------
create type public.vendor_tier as enum ('budget', 'mid', 'premium');
create type public.vendor_status as enum ('pending', 'active', 'suspended', 'inactive');
create type public.lead_status as enum ('new', 'unlocked', 'contacted', 'converted', 'lost');
create type public.payment_type as enum ('cpl_lead', 'subscription_monthly');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.subscription_status as enum ('active', 'cancelled', 'paused');
create type public.review_role as enum ('vendor', 'couple');

-- ------------------------------------------------------------------
-- profiles: flag de admin (verificare manuală furnizori)
-- ------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ------------------------------------------------------------------
-- vendors — furnizori de servicii
-- ------------------------------------------------------------------
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null,
  category text not null,
  tier public.vendor_tier not null,
  regions text[] not null default '{}',
  description text,
  logo_url text,
  phone text,
  email text,
  website text,
  rating numeric(2, 1) not null default 5.0,
  verified boolean not null default false,
  status public.vendor_status not null default 'pending',
  stripe_connect_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index idx_vendors_category on public.vendors (category);
create index idx_vendors_status on public.vendors (status);

create trigger trg_vendors_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- leads — cererile mirilor către furnizori
-- ------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  client_email text not null,
  client_phone text,
  event_date date,
  event_region text,
  message text,
  status public.lead_status not null default 'new',
  is_unlocked_by_vendor boolean not null default false,
  unlocked_at timestamptz,
  vendor_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- un singur lead per (nuntă, furnizor)
  unique (wedding_id, vendor_id)
);

create index idx_leads_vendor on public.leads (vendor_id);
create index idx_leads_wedding on public.leads (wedding_id);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- reviews — evaluări bidirecționale (schema pregătită; UI în increment viitor)
-- ------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  author_role public.review_role not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index idx_reviews_vendor on public.reviews (vendor_id);

-- ------------------------------------------------------------------
-- payments — jurnal plăți furnizori (schema pregătită; Stripe în increment viitor)
-- ------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  payment_type public.payment_type not null,
  amount numeric(10, 2) not null,
  currency text not null default 'RON',
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- subscriptions — abonamente lunare furnizori (schema pregătită)
-- ------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  tier public.vendor_tier not null,
  monthly_price numeric(10, 2) not null,
  subscription_start_date date not null default current_date,
  renewal_day_of_month int,
  stripe_subscription_id text,
  status public.subscription_status not null default 'active',
  next_renewal_date date,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Storage: bucket pentru logo-urile furnizorilor (citire publică)
-- Upload/modificare doar în folderul propriu (prefix = auth.uid()).
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vendor-logos', 'vendor-logos', true)
on conflict (id) do nothing;

create policy "vendor logos public read"
  on storage.objects for select
  using (bucket_id = 'vendor-logos');

create policy "vendor logos insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vendor-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor logos update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'vendor-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor logos delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vendor-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
