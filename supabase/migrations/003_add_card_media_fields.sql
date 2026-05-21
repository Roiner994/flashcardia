alter table public.cards
add column if not exists image_url text,
add column if not exists audio_url text,
add column if not exists audio_source text not null default 'tts';

update public.cards
set audio_source = 'tts'
where audio_source is null;
