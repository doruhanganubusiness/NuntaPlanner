-- NuntaPlanner — galeria furnizorului: max 10 imagini + max 3 videoclipuri.

create type public.vendor_media_type as enum ('image', 'video');

create table public.vendor_media (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  type public.vendor_media_type not null,
  url text not null,
  title text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_vendor_media_vendor on public.vendor_media (vendor_id);

-- Limite per furnizor: 10 imagini / 3 videoclipuri (backstop la nivel de DB).
create or replace function public.enforce_vendor_media_limits()
returns trigger
language plpgsql
as $$
declare
  cnt int;
  lim int;
begin
  lim := case when new.type = 'image' then 10 else 3 end;
  select count(*) into cnt
    from public.vendor_media
    where vendor_id = new.vendor_id and type = new.type;
  if cnt >= lim then
    raise exception 'Limită depășită: maxim % fișiere de tip %', lim, new.type;
  end if;
  return new;
end;
$$;

create trigger trg_vendor_media_limits
  before insert on public.vendor_media
  for each row execute function public.enforce_vendor_media_limits();

alter table public.vendor_media enable row level security;

-- Citire publică (galerie publică + sitemap).
create policy vendor_media_read on public.vendor_media
  for select using (true);

-- Scriere doar pe furnizorul propriu.
create policy vendor_media_insert_own on public.vendor_media
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );
create policy vendor_media_update_own on public.vendor_media
  for update to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );
create policy vendor_media_delete_own on public.vendor_media
  for delete to authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.user_id = auth.uid()
    )
  );

-- Bucket storage pentru media furnizorilor (citire publică; scriere în folderul propriu).
insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do nothing;

create policy "vendor media public read"
  on storage.objects for select
  using (bucket_id = 'vendor-media');

create policy "vendor media insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor media update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor media delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vendor-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
