-- Invitația digitală: nume cuplu, mesaj romantic, publicată (vizibilă public).
alter table public.weddings add column invitation_couple text;
alter table public.weddings add column invitation_message text;
alter table public.weddings
  add column invitation_published boolean not null default false;
