-- NuntaPlanner — Faza 1: schema de bază (planner pentru miri, fără furnizori)
-- Oglindește secțiunea 3 din specificație, doar tabelele Fazei 1.
-- Autentificarea folosește Supabase `auth.users`; `public.profiles` extinde userul.

-- ------------------------------------------------------------------
-- Extensii
-- ------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ------------------------------------------------------------------
-- Enum-uri
-- ------------------------------------------------------------------
create type public.user_type as enum ('client', 'vendor');
create type public.date_status as enum ('set', 'estimated', 'undecided');
create type public.season as enum ('spring', 'summer', 'autumn', 'winter');
create type public.wedding_style as enum (
  'classic', 'rustic', 'boho', 'modern',
  'glamour', 'vintage', 'garden', 'traditional'
);
create type public.drink_mode as enum ('quantities', 'cost');
create type public.member_role as enum ('groom', 'bride', 'parent', 'godparent', 'viewer');
create type public.member_permission as enum ('owner', 'editor', 'viewer');
create type public.member_status as enum ('pending', 'active');
create type public.slot_type as enum (
  'civil_ceremony', 'religious_ceremony', 'baptism', 'reception'
);

-- ------------------------------------------------------------------
-- Trigger utilitar: updated_at
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- profiles — extinde auth.users (email/email_verified trăiesc în auth.users)
-- ------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  user_type public.user_type not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- La crearea unui user în auth, creăm automat profilul.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------
-- weddings — evenimentul partajat
-- ------------------------------------------------------------------
create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  wedding_date date,
  date_status public.date_status not null default 'undecided',
  estimated_season public.season,
  estimated_year int,
  -- combinație de tipuri: 'civil' / 'religious' / 'baptism'
  wedding_type text[] not null default '{}',
  region text,
  style public.wedding_style,
  total_budget numeric(12, 2),
  currency text not null default 'RON',
  drink_mode public.drink_mode not null default 'quantities',
  budget_priorities jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_type_valid check (
    wedding_type <@ array['civil', 'religious', 'baptism']::text[]
  )
);

create trigger trg_weddings_updated_at
  before update on public.weddings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- wedding_members — membrii contului (multi-email)
-- ------------------------------------------------------------------
create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  role public.member_role not null,
  permission public.member_permission not null default 'viewer',
  status public.member_status not null default 'pending',
  invite_token uuid not null default gen_random_uuid(),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (wedding_id, email)
);

create index idx_members_wedding on public.wedding_members (wedding_id);
create index idx_members_user on public.wedding_members (user_id);
create index idx_members_token on public.wedding_members (invite_token);

-- ------------------------------------------------------------------
-- event_slots — sloturile zilei
-- ------------------------------------------------------------------
create table public.event_slots (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  slot_type public.slot_type not null,
  title text,
  start_time timestamptz,
  duration_minutes int,
  location_name text,
  location_address text,
  guests_adults int not null default 0,
  guests_children int not null default 0,
  serves_alcohol boolean not null default false,
  serves_full_meal boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_slots_wedding on public.event_slots (wedding_id);

create trigger trg_slots_updated_at
  before update on public.event_slots
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- calc_results — cache rezultate motor (o intrare per nuntă)
-- ------------------------------------------------------------------
create table public.calc_results (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null unique references public.weddings (id) on delete cascade,
  input_hash text not null,
  results jsonb not null,
  computed_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- config_parameters — constante ajustabile (global sau pe regiune)
-- region NULL = valori globale implicite.
-- ------------------------------------------------------------------
create table public.config_parameters (
  id uuid primary key default gen_random_uuid(),
  region text,
  key text not null,
  value jsonb not null,
  version int not null default 1,
  created_at timestamptz not null default now()
);

-- unicitate pe (regiune, cheie) tratând NULL ca „__global__"
create unique index uq_config_region_key
  on public.config_parameters (coalesce(region, '__global__'), key);
