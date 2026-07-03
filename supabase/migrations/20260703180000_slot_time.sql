-- Ora de început a fiecărui slot (cununie civilă/religioasă, petrecere).
-- Tip `time` (fără fus orar) — se afișează direct pe invitație, fără conversii.
alter table public.event_slots add column slot_time time;
