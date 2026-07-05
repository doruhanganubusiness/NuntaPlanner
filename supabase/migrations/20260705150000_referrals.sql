-- NuntaPlanner — Faza 2 (Incrementul 6): program de referral furnizor→furnizor.
-- Un furnizor invită alți furnizori; când noul furnizor e VERIFICAT de platformă,
-- invitatorul primește 1 lună de abonament gratuit (spec §9.7). Max 5 recompense/lună.
-- SIMPLIFICARE: recompensa se acordă la verificare (nu după 30 de zile de activitate),
-- fiindcă nu există încă un job programat; restul limitelor din spec sunt respectate.

-- ------------------------------------------------------------------
-- Cod de referral unic pe fiecare furnizor
-- ------------------------------------------------------------------
create or replace function public.gen_referral_code()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

alter table public.vendors add column referral_code text;
update public.vendors set referral_code = public.gen_referral_code()
  where referral_code is null;
alter table public.vendors
  alter column referral_code set default public.gen_referral_code();
alter table public.vendors alter column referral_code set not null;
create unique index idx_vendors_referral_code on public.vendors (referral_code);

-- ------------------------------------------------------------------
-- referrals — o legătură invitator→invitat, o recompensă per invitat
-- ------------------------------------------------------------------
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_vendor_id uuid not null references public.vendors (id) on delete cascade,
  referred_vendor_id uuid not null references public.vendors (id) on delete cascade,
  status text not null default 'joined' check (status in ('joined', 'rewarded')),
  reward_granted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (referred_vendor_id)
);
create index idx_referrals_referrer on public.referrals (referrer_vendor_id);

alter table public.referrals enable row level security;
-- Furnizorul își vede recomandările proprii; scrierile vin din triggere DEFINER.
create policy referrals_select_referrer on public.referrals
  for select using (
    exists (
      select 1 from public.vendors v
      where v.id = referrer_vendor_id and v.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------
-- La crearea furnizorului: leagă-l de invitator din codul salvat în metadata
-- ------------------------------------------------------------------
create or replace function public.link_referral_on_vendor_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_referrer uuid;
begin
  select nullif(trim(u.raw_user_meta_data->>'referred_by_code'), '')
    into v_code
    from auth.users u where u.id = new.user_id;
  if v_code is null then
    return new;
  end if;

  select v.id into v_referrer
    from public.vendors v
    where v.referral_code = upper(v_code) and v.id <> new.id
    limit 1;
  if v_referrer is null then
    return new;
  end if;

  insert into public.referrals (referrer_vendor_id, referred_vendor_id)
  values (v_referrer, new.id)
  on conflict (referred_vendor_id) do nothing;

  return new;
end;
$$;

create trigger trg_link_referral
  after insert on public.vendors
  for each row execute function public.link_referral_on_vendor_insert();

-- ------------------------------------------------------------------
-- La verificarea invitatului: acordă invitatorului 1 lună gratuită (cap 5/lună)
-- ------------------------------------------------------------------
create or replace function public.grant_referral_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref public.referrals;
  v_referrer_tier public.vendor_tier;
  v_month_count int;
  v_sub public.subscriptions;
begin
  -- doar tranziția „neverificat → verificat + activ"
  if not (new.verified and coalesce(old.verified, false) = false
          and new.status = 'active') then
    return new;
  end if;

  select * into v_ref from public.referrals
    where referred_vendor_id = new.id and status = 'joined';
  if not found then
    return new;
  end if;

  -- limita: max 5 recompense/lună per invitator (nu se cumulează)
  select count(*) into v_month_count from public.referrals
    where referrer_vendor_id = v_ref.referrer_vendor_id
      and status = 'rewarded'
      and reward_granted_at >= date_trunc('month', now());
  if v_month_count >= 5 then
    return new;
  end if;

  select tier into v_referrer_tier from public.vendors
    where id = v_ref.referrer_vendor_id;

  -- 1 lună gratuită: extinde abonamentul activ sau creează unul nou (preț 0)
  select * into v_sub from public.subscriptions
    where vendor_id = v_ref.referrer_vendor_id and status = 'active'
    order by created_at desc limit 1;

  if found and coalesce(v_sub.next_renewal_date, current_date) >= current_date then
    update public.subscriptions
      set next_renewal_date =
            (coalesce(v_sub.next_renewal_date, current_date) + interval '1 month')::date,
          updated_at = now()
      where id = v_sub.id;
  else
    insert into public.subscriptions
      (vendor_id, tier, monthly_price, subscription_start_date, next_renewal_date, status)
    values
      (v_ref.referrer_vendor_id, v_referrer_tier, 0, current_date,
       (current_date + interval '1 month')::date, 'active');
  end if;

  update public.referrals
    set status = 'rewarded', reward_granted_at = now()
    where id = v_ref.id;

  return new;
end;
$$;

create trigger trg_grant_referral_reward
  after update on public.vendors
  for each row execute function public.grant_referral_reward();

-- ------------------------------------------------------------------
-- RPC: recomandările furnizorului curent (cu nume + status invitat)
-- ------------------------------------------------------------------
create or replace function public.vendor_referrals()
returns table (
  id uuid,
  referred_business_name text,
  referred_status public.vendor_status,
  referred_verified boolean,
  status text,
  reward_granted_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select r.id, rv.business_name, rv.status, rv.verified,
         r.status, r.reward_granted_at, r.created_at
  from public.referrals r
  join public.vendors rv on rv.id = r.referred_vendor_id
  join public.vendors mv on mv.id = r.referrer_vendor_id
  where mv.user_id = auth.uid()
  order by r.created_at desc;
$$;

grant execute on function public.vendor_referrals() to authenticated;
