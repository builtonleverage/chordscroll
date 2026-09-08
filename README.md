# ChordScroll

Auto-scrolling lyrics with chord diagrams for piano, guitar, and ukulele — synced to the cloud with Supabase so your songs follow you across devices.

## Stack

React + Vite + Tailwind CSS + Framer Motion, Supabase for auth and storage.

## Setup

1. **Install dependencies**

   ```
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).

3. **Run the schema.** In the Supabase SQL editor, run `supabase/001_schema.sql` — it creates the `songs` table and row-level-security policies so each user only sees their own songs.

4. **Set environment variables.** Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API):

   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

5. **Run the dev server**

   ```
   npm run dev
   ```

6. **Deploy.** Push to Vercel or Netlify and add the same two environment variables in the deploy platform's dashboard — never commit `.env`.

## How it's built

- `src/lib/chordParser.js` — parses bracket notation (`[C]word`) into sections/lines/words plus the song's unique chords in order of first appearance.
- `src/lib/chordTheory.js` — chord-name parsing and note math (`chordToNotes`, transposition) shared by all renderers.
- `src/lib/chordShapes/guitar.js`, `ukulele.js` — per-instrument fret-shape lookup tables, covering all 12 roots × {major, minor, 7, maj7, min7, sus2, sus4}: hand-picked common open/beginner shapes where one exists, and a movable-shape/derived fallback everywhere else.
- `src/lib/getChordShape.js` — the shared `getChordShape(chordName, instrument)` interface the three diagram renderers consume.
- `src/hooks/useAutoScroll.js` — the requestAnimationFrame-driven smooth-scroll engine. Manual scroll/touch pauses playback automatically.
- `src/hooks/useSongs.js` + `src/lib/songsApi.js` — Supabase-backed song storage with an optimistic local cache (instant load, background sync, offline-tolerant).

## Phase 1 scope

Instrument-specific chord diagrams, bracket-notation editor, smooth auto-scroll with tap tempo, Supabase auth + sync, and a song library — see the build spec for the full phase breakdown.
