-- NuntaPlanner — chat miri↔furnizor, pe firul unui lead.
-- Cuplul (membru al nunții) scrie/citește oricând. Furnizorul citește/răspunde
-- DOAR dacă lead-ul e deblocat (păstrează modelul CPL/abonament).

create type public.message_sender as enum ('couple', 'vendor');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  sender_role public.message_sender not null,
  sender_id uuid not null default auth.uid()
    references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_lead on public.messages (lead_id, created_at);

alter table public.messages enable row level security;

-- Furnizorul deține lead-ul ȘI e deblocat.
create or replace function public.vendor_owns_unlocked_lead(p_lead_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.leads l
    join public.vendors v on v.id = l.vendor_id
    where l.id = p_lead_id
      and v.user_id = auth.uid()
      and l.is_unlocked_by_vendor
  );
$$;

-- Wedding-ul lead-ului (pentru verificarea membru).
create or replace function public.lead_wedding_id(p_lead_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select wedding_id from public.leads where id = p_lead_id;
$$;

grant execute on function public.vendor_owns_unlocked_lead(uuid) to authenticated;
grant execute on function public.lead_wedding_id(uuid) to authenticated;

create policy messages_select on public.messages
  for select using (
    public.is_wedding_member(public.lead_wedding_id(lead_id))
    or public.vendor_owns_unlocked_lead(lead_id)
  );

create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (
      (sender_role = 'couple'
        and public.is_wedding_member(public.lead_wedding_id(lead_id)))
      or
      (sender_role = 'vendor'
        and public.vendor_owns_unlocked_lead(lead_id))
    )
  );

-- Marcarea „citit" de către oricare participant.
create policy messages_update_read on public.messages
  for update to authenticated
  using (
    public.is_wedding_member(public.lead_wedding_id(lead_id))
    or public.vendor_owns_unlocked_lead(lead_id)
  );

-- Realtime pentru chat live.
alter publication supabase_realtime add table public.messages;
