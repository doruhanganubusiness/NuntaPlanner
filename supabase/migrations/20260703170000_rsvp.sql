-- RSVP: confirmările de prezență trimise de invitați prin invitația publică.
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  guest_name text not null,
  attending boolean not null default true,
  guests_count int not null default 1,
  message text,
  created_at timestamptz not null default now()
);

create index idx_rsvps_wedding on public.rsvps (wedding_id);

alter table public.rsvps enable row level security;

-- Membrii nunții văd și pot șterge confirmările. Inserarea se face din API
-- (service role), după verificarea că invitația e publicată — deci fără politică de insert.
create policy rsvps_select_member on public.rsvps
  for select using (public.is_wedding_member(wedding_id));

create policy rsvps_delete_editor on public.rsvps
  for delete using (
    public.has_wedding_permission(
      wedding_id,
      array['owner', 'editor']::public.member_permission[]
    )
  );
