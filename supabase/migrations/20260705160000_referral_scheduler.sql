-- NuntaPlanner — Incrementul 6 (completare): fereastra de 30 de zile la referral.
-- Recompensa NU se mai acordă imediat la verificare, ci printr-un job programat
-- (pg_cron) care verifică zilnic invitații verificați+activi de cel puțin 30 de zile.

alter table public.referrals
  add column if not exists qualified_at timestamptz;

-- ------------------------------------------------------------------
-- Triggerul de recompensă imediată → înlocuit cu pornirea „ceasului"
-- ------------------------------------------------------------------
drop trigger if exists trg_grant_referral_reward on public.vendors;
drop function if exists public.grant_referral_reward();

create or replace function public.sync_referral_qualification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verified and new.status = 'active'
     and not (coalesce(old.verified, false) and old.status = 'active') then
    -- a intrat în verificat+activ: pornește ceasul de 30 de zile
    update public.referrals
      set qualified_at = now()
      where referred_vendor_id = new.id
        and status = 'joined'
        and qualified_at is null;
  elsif (coalesce(old.verified, false) and old.status = 'active')
        and not (new.verified and new.status = 'active') then
    -- a ieșit din verificat+activ: resetează ceasul (30 de zile trebuie continue)
    update public.referrals
      set qualified_at = null
      where referred_vendor_id = new.id and status = 'joined';
  end if;
  return new;
end;
$$;

create trigger trg_sync_referral_qualification
  after update on public.vendors
  for each row execute function public.sync_referral_qualification();

-- Furnizorii deja verificați+activi pornesc ceasul acum.
update public.referrals r
  set qualified_at = now()
  from public.vendors v
  where v.id = r.referred_vendor_id
    and v.verified and v.status = 'active'
    and r.status = 'joined' and r.qualified_at is null;

-- ------------------------------------------------------------------
-- Acordă recompensele scadente (invitat verificat+activ ≥ 30 de zile)
-- ------------------------------------------------------------------
create or replace function public.grant_due_referral_rewards()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_month_count int;
  v_sub public.subscriptions;
  v_granted int := 0;
begin
  for r in
    select rf.id, rf.referrer_vendor_id, v.tier as referrer_tier
    from public.referrals rf
    join public.vendors rv on rv.id = rf.referred_vendor_id
    join public.vendors v on v.id = rf.referrer_vendor_id
    where rf.status = 'joined'
      and rf.qualified_at is not null
      and rf.qualified_at <= now() - interval '30 days'
      and rv.verified and rv.status = 'active'
  loop
    -- limita: max 5 recompense/lună per invitator
    select count(*) into v_month_count from public.referrals
      where referrer_vendor_id = r.referrer_vendor_id
        and status = 'rewarded'
        and reward_granted_at >= date_trunc('month', now());
    if v_month_count >= 5 then
      continue;
    end if;

    -- 1 lună gratuită: extinde abonamentul activ sau creează unul nou (preț 0)
    select * into v_sub from public.subscriptions
      where vendor_id = r.referrer_vendor_id and status = 'active'
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
        (r.referrer_vendor_id, r.referrer_tier, 0, current_date,
         (current_date + interval '1 month')::date, 'active');
    end if;

    update public.referrals
      set status = 'rewarded', reward_granted_at = now()
      where id = r.id;
    v_granted := v_granted + 1;
  end loop;
  return v_granted;
end;
$$;

grant execute on function public.grant_due_referral_rewards() to service_role;

-- ------------------------------------------------------------------
-- RPC vendor_referrals(): adaugă qualified_at (afișare „eligibil în N zile")
-- ------------------------------------------------------------------
create or replace function public.vendor_referrals()
returns table (
  id uuid,
  referred_business_name text,
  referred_status public.vendor_status,
  referred_verified boolean,
  status text,
  qualified_at timestamptz,
  reward_granted_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select r.id, rv.business_name, rv.status, rv.verified,
         r.status, r.qualified_at, r.reward_granted_at, r.created_at
  from public.referrals r
  join public.vendors rv on rv.id = r.referred_vendor_id
  join public.vendors mv on mv.id = r.referrer_vendor_id
  where mv.user_id = auth.uid()
  order by r.created_at desc;
$$;

-- ------------------------------------------------------------------
-- Programează jobul zilnic prin pg_cron (tolerant dacă extensia lipsește)
-- ------------------------------------------------------------------
do $$
begin
  create extension if not exists pg_cron;
  begin
    perform cron.unschedule('grant-referral-rewards');
  exception when others then null;
  end;
  perform cron.schedule(
    'grant-referral-rewards', '0 3 * * *',
    'select public.grant_due_referral_rewards();'
  );
exception when others then
  raise notice 'pg_cron indisponibil — programează manual grant_due_referral_rewards(): %', sqlerrm;
end $$;
