-- Defalcare RSVP pe adulți și copii (guests_count rămâne totalul).
alter table public.rsvps add column adults_count int not null default 1;
alter table public.rsvps add column children_count int not null default 0;
