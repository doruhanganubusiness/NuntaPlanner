-- NuntaPlanner — Faza 1: Row Level Security + funcții helper + RPC-uri.
-- Fiecare membru vede/editează doar nunțile la care aparține (secțiunea 8).

-- ------------------------------------------------------------------
-- Helpers SECURITY DEFINER — bypasează RLS pe wedding_members ca să evite
-- recursivitatea între politicile weddings <-> wedding_members.
-- ------------------------------------------------------------------
create or replace function public.is_wedding_member(wid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.wedding_members m
    where m.wedding_id = wid
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_wedding_permission(
  wid uuid,
  perms public.member_permission[]
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.wedding_members m
    where m.wedding_id = wid
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.permission = any (perms)
  );
$$;

-- ------------------------------------------------------------------
-- RPC: creare nuntă + membru owner atomic (rezolvă chicken-egg-ul RLS)
-- ------------------------------------------------------------------
create or replace function public.create_wedding(
  p_name text,
  p_region text default null
)
returns public.weddings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_wedding public.weddings;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.weddings (name, region)
  values (p_name, p_region)
  returning * into v_wedding;

  insert into public.wedding_members
    (wedding_id, user_id, email, role, permission, status, joined_at)
  values
    (v_wedding.id, v_uid, coalesce(v_email, ''), 'groom', 'owner', 'active', now());

  return v_wedding;
end;
$$;

-- ------------------------------------------------------------------
-- RPC: acceptare invitație pe baza token-ului
-- ------------------------------------------------------------------
create or replace function public.accept_invite(p_token uuid)
returns public.wedding_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_member public.wedding_members;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.wedding_members
    set user_id = v_uid, status = 'active', joined_at = now()
    where invite_token = p_token and status = 'pending'
    returning * into v_member;

  if v_member.id is null then
    raise exception 'invalid or already used invite';
  end if;

  return v_member;
end;
$$;

grant execute on function public.create_wedding(text, text) to authenticated;
grant execute on function public.accept_invite(uuid) to authenticated;

-- ------------------------------------------------------------------
-- Activare RLS
-- ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.event_slots enable row level security;
alter table public.calc_results enable row level security;
alter table public.config_parameters enable row level security;

-- ---------------------------- profiles ----------------------------
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------- weddings ----------------------------
create policy weddings_select_member on public.weddings
  for select using (public.is_wedding_member(id));
create policy weddings_insert_auth on public.weddings
  for insert with check (auth.uid() is not null);
create policy weddings_update_editor on public.weddings
  for update using (
    public.has_wedding_permission(id, array['owner', 'editor']::public.member_permission[])
  );
create policy weddings_delete_owner on public.weddings
  for delete using (
    public.has_wedding_permission(id, array['owner']::public.member_permission[])
  );

-- ------------------------- wedding_members ------------------------
create policy members_select on public.wedding_members
  for select using (
    public.is_wedding_member(wedding_id) or user_id = auth.uid()
  );
create policy members_insert_owner on public.wedding_members
  for insert with check (
    public.has_wedding_permission(wedding_id, array['owner']::public.member_permission[])
  );
create policy members_update_owner on public.wedding_members
  for update using (
    public.has_wedding_permission(wedding_id, array['owner']::public.member_permission[])
  );
create policy members_delete_owner on public.wedding_members
  for delete using (
    public.has_wedding_permission(wedding_id, array['owner']::public.member_permission[])
  );

-- --------------------------- event_slots --------------------------
create policy slots_select_member on public.event_slots
  for select using (public.is_wedding_member(wedding_id));
create policy slots_write_editor on public.event_slots
  for all using (
    public.has_wedding_permission(wedding_id, array['owner', 'editor']::public.member_permission[])
  ) with check (
    public.has_wedding_permission(wedding_id, array['owner', 'editor']::public.member_permission[])
  );

-- --------------------------- calc_results -------------------------
create policy calc_select_member on public.calc_results
  for select using (public.is_wedding_member(wedding_id));
create policy calc_write_editor on public.calc_results
  for all using (
    public.has_wedding_permission(wedding_id, array['owner', 'editor']::public.member_permission[])
  ) with check (
    public.has_wedding_permission(wedding_id, array['owner', 'editor']::public.member_permission[])
  );

-- ------------------------ config_parameters -----------------------
-- Date de referință: citibile de orice user autentificat; scriere doar service role.
create policy config_select_auth on public.config_parameters
  for select to authenticated using (true);
