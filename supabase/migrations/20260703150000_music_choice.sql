-- Alegerea manuală de muzică a mirilor (suprascrie recomandarea automată).
create type public.music_choice as enum ('dj', 'band', 'band_and_dj');

alter table public.weddings add column music_choice public.music_choice;
