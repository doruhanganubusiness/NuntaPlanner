-- NuntaPlanner — Faza 2 (Incrementul 1): RLS + RPC-uri pentru marketplace.

-- ------------------------------------------------------------------
-- Helper: este userul curent admin?
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ------------------------------------------------------------------
-- RPC: creează un lead de la mire către furnizor.
-- Preia email-ul din auth.users și data/regiunea din nuntă. SECURITY DEFINER
-- ca inserarea să treacă indiferent de politicile de scriere pe leads.
-- ------------------------------------------------------------------
create or replace function public.create_lead(
  p_wedding_id uuid,
  p_vendor_id uuid,
  p_message text default null,
  p_client_phone text default null
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_wedding public.weddings;
  v_lead public.leads;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not public.has_wedding_permission(
       p_wedding_id, array['owner', 'editor']::public.member_permission[]
     ) then
    raise exception 'forbidden';
  end if;

  if not exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id and v.status = 'active' and v.verified
  ) then
    raise exception 'vendor not available';
  end if;

  select email into v_email from auth.users where id = v_uid;
  select * into v_wedding from public.weddings where id = p_wedding_id;

  insert into public.leads
    (wedding_id, vendor_id, client_email, client_phone,
     event_date, event_region, message)
  values
    (p_wedding_id, p_vendor_id, coalesce(v_email, ''), p_client_phone,
     v_wedding.wedding_date,
     coalesce(v_wedding.locality, v_wedding.county, v_wedding.region),
     p_message)
  on conflict (wedding_id, vendor_id) do update
    set message = excluded.message,
        client_phone = excluded.client_phone,
        updated_at = now()
  returning * into v_lead;

  return v_lead;
end;
$$;

-- ------------------------------------------------------------------
-- RPC: lead-urile furnizorului curent, cu contact MASCAT dacă nedeblocat.
-- (Deblocarea reală vine cu Stripe în incrementul 2.)
-- ------------------------------------------------------------------
create or replace function public.vendor_leads()
returns table (
  id uuid,
  wedding_id uuid,
  vendor_id uuid,
  client_email text,
  client_phone text,
  event_date date,
  event_region text,
  message text,
  status public.lead_status,
  is_unlocked_by_vendor boolean,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    l.id, l.wedding_id, l.vendor_id,
    case when l.is_unlocked_by_vendor then l.client_email end,
    case when l.is_unlocked_by_vendor then l.client_phone end,
    l.event_date, l.event_region, l.message, l.status,
    l.is_unlocked_by_vendor, l.created_at
  from public.leads l
  join public.vendors v on v.id = l.vendor_id
  where v.user_id = auth.uid()
  order by l.created_at desc;
$$;

-- ------------------------------------------------------------------
-- RPC: furnizor schimbă statusul unui lead propriu (fără a expune contactul).
-- ------------------------------------------------------------------
create or replace function public.set_lead_status(
  p_lead_id uuid,
  p_status public.lead_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('contacted', 'converted', 'lost') then
    raise exception 'invalid status';
  end if;

  update public.leads l
    set status = p_status,
        vendor_contacted_at = case
          when p_status = 'contacted' then now()
          else l.vendor_contacted_at
        end
    from public.vendors v
    where l.id = p_lead_id
      and v.id = l.vendor_id
      and v.user_id = auth.uid();

  if not found then
    raise exception 'lead not found';
  end if;
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.create_lead(uuid, uuid, text, text) to authenticated;
grant execute on function public.vendor_leads() to authenticated;
grant execute on function public.set_lead_status(uuid, public.lead_status) to authenticated;

-- ------------------------------------------------------------------
-- Activare RLS
-- ------------------------------------------------------------------
alter table public.vendors enable row level security;
alter table public.leads enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

-- ---------------------------- vendors -----------------------------
-- Directorul public vede doar furnizorii activi+verificați; furnizorul își vede
-- propriul rând (în orice status); adminul vede tot.
create policy vendors_select_public on public.vendors
  for select
  using (
    (status = 'active' and verified)
    or user_id = auth.uid()
    or public.is_admin()
  );

create policy vendors_insert_own on public.vendors
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.user_type = 'vendor'
    )
  );

create policy vendors_update_own_or_admin on public.vendors
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ----------------------------- leads ------------------------------
-- Mirele vede lead-urile nunților lui. Furnizorul NU citește direct (folosește
-- vendor_leads() mascat); inserarea se face prin create_lead() SECURITY DEFINER.
create policy leads_select_member on public.leads
  for select using (public.is_wedding_member(wedding_id));

-- ---------------------------- reviews -----------------------------
create policy reviews_select_public on public.reviews
  for select using (true);
create policy reviews_insert_member on public.reviews
  for insert to authenticated
  with check (public.is_wedding_member(wedding_id));

-- ------------------- payments / subscriptions ---------------------
-- Vizibile doar furnizorului propriu; scrierea vine din webhook (service role).
create policy payments_select_own on public.payments
  for select using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );
create policy subscriptions_select_own on public.subscriptions
  for select using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );
