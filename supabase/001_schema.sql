-- ChordScroll: songs table + row level security.
-- Run this in the Supabase SQL editor for your project.

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  instrument text not null check (instrument in ('piano', 'guitar', 'ukulele')),
  raw_text text not null,
  last_speed numeric,
  last_font_size numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists songs_user_id_idx on songs (user_id);

alter table songs enable row level security;

drop policy if exists "songs_select_own" on songs;
create policy "songs_select_own" on songs
  for select using (auth.uid() = user_id);

drop policy if exists "songs_insert_own" on songs;
create policy "songs_insert_own" on songs
  for insert with check (auth.uid() = user_id);

drop policy if exists "songs_update_own" on songs;
create policy "songs_update_own" on songs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "songs_delete_own" on songs;
create policy "songs_delete_own" on songs
  for delete using (auth.uid() = user_id);
