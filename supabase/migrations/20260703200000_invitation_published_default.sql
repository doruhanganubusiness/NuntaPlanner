-- Invitația e publicată implicit (rostul ei e să fie trimisă invitaților).
alter table public.weddings
  alter column invitation_published set default true;

update public.weddings set invitation_published = true
where invitation_published = false;
