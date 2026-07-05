-- NuntaPlanner — Incrementul 9: notificări in-app (clopoțel realtime).
-- Notificări generate prin triggere DEFINER la: lead nou (→furnizor), mesaj nou
-- (→cealaltă parte), aprobare furnizor (→furnizor). Funcționează fără email.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Fiecare user își vede și își marchează citite doar notificările proprii.
-- Inserarea vine exclusiv din triggere SECURITY DEFINER (ocolesc RLS).
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter publication supabase_realtime add table public.notifications;

-- ------------------------------------------------------------------
-- Lead nou → notifică furnizorul
-- ------------------------------------------------------------------
create or replace function public.notify_on_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  select user_id into v_user from public.vendors where id = new.vendor_id;
  if v_user is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_user, 'lead', 'Cerere nouă',
      coalesce(nullif(left(new.message, 120), ''),
               'Un cuplu te-a contactat pe NuntaPlanner.'),
      '/vendor/leads'
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_new_lead
  after insert on public.leads
  for each row execute function public.notify_on_new_lead();

-- ------------------------------------------------------------------
-- Mesaj nou → notifică cealaltă parte a conversației
-- ------------------------------------------------------------------
create or replace function public.notify_on_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wedding uuid;
  v_vendor_user uuid;
  v_snippet text := left(new.body, 120);
begin
  if new.sender_role = 'couple' then
    -- notifică furnizorul care deține lead-ul
    select v.user_id into v_vendor_user
    from public.leads l
    join public.vendors v on v.id = l.vendor_id
    where l.id = new.lead_id;
    if v_vendor_user is not null and v_vendor_user <> new.sender_id then
      insert into public.notifications (user_id, type, title, body, link)
      values (v_vendor_user, 'message', 'Mesaj nou de la un cuplu',
              v_snippet, '/vendor/leads');
    end if;
  else
    -- sender = furnizor → notifică membrii activi ai nunții
    select wedding_id into v_wedding from public.leads where id = new.lead_id;
    insert into public.notifications (user_id, type, title, body, link)
    select m.user_id, 'message', 'Mesaj nou de la un furnizor', v_snippet,
           '/dashboard/' || v_wedding::text || '/vendors'
    from public.wedding_members m
    where m.wedding_id = v_wedding
      and m.user_id is not null
      and m.status = 'active'
      and m.user_id <> new.sender_id;
  end if;
  return new;
end;
$$;

create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.notify_on_new_message();

-- ------------------------------------------------------------------
-- Aprobare furnizor (activ+verificat) → notifică furnizorul
-- ------------------------------------------------------------------
create or replace function public.notify_on_vendor_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verified and new.status = 'active'
     and not (coalesce(old.verified, false) and old.status = 'active') then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.user_id, 'vendor_approved', 'Ești listat în platformă!',
            'Profilul tău e acum public în directorul de furnizori.', '/vendor');
  end if;
  return new;
end;
$$;

create trigger trg_notify_vendor_approved
  after update on public.vendors
  for each row execute function public.notify_on_vendor_approved();
