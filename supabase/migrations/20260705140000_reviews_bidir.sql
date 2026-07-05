-- NuntaPlanner — recenzii bidirecționale (cuplu↔furnizor), legate de un lead.
-- O recenzie per (lead, autor). Rating-ul furnizorului = media recenziilor
-- lăsate de cupluri, recalculată automat.

alter table public.reviews
  add constraint reviews_unique_per_author unique (lead_id, author_role);

-- Politica veche (doar membru nuntă) → înlocuită cu una bidirecțională.
drop policy if exists reviews_insert_member on public.reviews;

-- Cuplul recenzează furnizorul: membru al nunții + lead-ul leagă nunta de furnizor.
create policy reviews_insert_couple on public.reviews
  for insert to authenticated
  with check (
    author_role = 'couple'
    and public.is_wedding_member(wedding_id)
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and l.wedding_id = wedding_id
        and l.vendor_id = vendor_id
    )
  );

-- Furnizorul recenzează cuplul: deține lead-ul deblocat.
create policy reviews_insert_vendor on public.reviews
  for insert to authenticated
  with check (
    author_role = 'vendor'
    and public.vendor_owns_unlocked_lead(lead_id)
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and l.wedding_id = wedding_id
        and l.vendor_id = vendor_id
    )
  );

-- Recalculează vendors.rating = media recenziilor cuplurilor (implicit 5.0).
create or replace function public.recompute_vendor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vid uuid;
begin
  vid := coalesce(new.vendor_id, old.vendor_id);
  update public.vendors
    set rating = coalesce(
      (select round(avg(rating)::numeric, 1)
         from public.reviews
         where vendor_id = vid and author_role = 'couple'),
      5.0)
    where id = vid;
  return null;
end;
$$;

create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_vendor_rating();
