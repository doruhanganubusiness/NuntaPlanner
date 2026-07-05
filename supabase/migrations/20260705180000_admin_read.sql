-- NuntaPlanner — Incrementul 7: panou admin + statistici.
-- Adminul poate CITI tot (lead-uri, plăți, abonamente) pentru dashboard-ul de
-- administrare și poate MODERA (șterge) recenzii. `is_admin()` există din inc. 1.
-- vendors: select admin e deja acoperit de vendors_select_public (include is_admin);
-- reviews: select e deja public.

create policy leads_select_admin on public.leads
  for select using (public.is_admin());

create policy payments_select_admin on public.payments
  for select using (public.is_admin());

create policy subscriptions_select_admin on public.subscriptions
  for select using (public.is_admin());

create policy reviews_delete_admin on public.reviews
  for delete to authenticated using (public.is_admin());
