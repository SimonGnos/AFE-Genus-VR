-- ===========================================================================
-- GENUS-VR · Supabase-Einrichtung
--
-- Vollständiger Stand der Datenbank, so wie sie im SQL Editor aufgebaut
-- wurde. Dient dem Nachvollziehen in der Arbeit und dem Wiederaufsetzen des
-- Projekts. Die Befehle sind in dieser Reihenfolge auszuführen.
--
-- Nicht in SQL abbildbar und im Dashboard zu erledigen — siehe unten:
--   1. Storage-Bucket "videos" anlegen, öffentlich lesbar
--   2. Edge Function "admin" aus supabase/functions/admin/index.ts deployen,
--      "Verify JWT" dabei ausschalten
--   3. Secret ADMIN_CODE setzen
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1 · Katalogtabelle
-- ---------------------------------------------------------------------------
create table public.videos (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null,
  stimmung    text    not null default '',
  datei       text    not null,   -- Pfad auf Netlify oder volle Supabase-URL
  sekunden    integer not null,   -- Sitzungsdauer OHNE den Vorlauf
  vorlauf     integer not null default 30,  -- eingebrannter Vorlauf dieser Datei
  von         text    not null default '#2B5470',
  bis         text    not null default '#7FA8C0',
  sortierung  integer not null default 0,
  erstellt_am timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 2 · Zugriff
--
-- Zwei Schranken, die beide greifen müssen: das Tabellenrecht (grant) und
-- die Zeilenregel (policy). Das Projekt wurde ohne "Automatically expose new
-- tables" angelegt, deshalb sind die grants ausdrücklich nötig.
--
-- Gelesen wird direkt aus der App. Geschrieben wird ausschliesslich über die
-- Edge Function, die als service_role arbeitet und zuvor den Admin-Code
-- prüft — anon bekommt bewusst kein insert, update oder delete.
-- ---------------------------------------------------------------------------
alter table public.videos enable row level security;

create policy "katalog oeffentlich lesbar"
  on public.videos for select
  to anon, authenticated
  using (true);

grant select on public.videos to anon, authenticated;
grant all privileges on table public.videos to service_role;


-- ---------------------------------------------------------------------------
-- 3 · Speicher
--
-- Die Videodateien gehen direkt vom Browser in den Bucket. Die Erlaubnis
-- dazu ist eine signierte Adresse, die allein die Edge Function ausstellt —
-- ohne sie nützt diese Regel niemandem etwas. Der Umweg ist nötig, weil
-- Dateien von mehreren Megabyte die Grössenbegrenzung einer Edge Function
-- überschreiten.
-- ---------------------------------------------------------------------------
create policy "upload nur mit signatur"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'videos');


-- ---------------------------------------------------------------------------
-- 4 · Ausgangsbestand
--
-- Die vier ursprünglichen Videos liegen weiterhin statisch auf Netlify; ihre
-- Pfade sind relativ. Später über die App hochgeladene Videos tragen hier
-- eine vollständige Supabase-URL.
-- ---------------------------------------------------------------------------
insert into public.videos (name, stimmung, datei, sekunden, vorlauf, von, bis, sortierung) values
  ('Wald',    'Licht zwischen Blättern', 'video/wald_2min.mp4',    120, 30, '#3E6B4A', '#9CBE84', 1),
  ('Wiese',   'Gräser im Sommerwind',    'video/wiese_2min.mp4',   120, 30, '#5A6B34', '#D4CE96', 2),
  ('Meer',    'Ruhige Dünung',           'video/meer_5min.mp4',    300, 30, '#2B5470', '#7FA8C0', 3),
  ('Bergsee', 'Stilles Wasser',          'video/bergsee_5min.mp4', 300, 30, '#1F3F44', '#8FB5B2', 4);


-- ---------------------------------------------------------------------------
-- Nachträgliche Änderungen
--
-- Gegenüber dem ersten Aufbau hinzugekommen, hier zum Nachvollziehen. Bei
-- einem Neuaufbau nach obigem Stand sind sie bereits enthalten.
-- ---------------------------------------------------------------------------
-- 2026-10-05 · Vorlauf je Video statt global, da neues Material mit
--              10 Sekunden Vorlauf hinzukam:
-- alter table public.videos add column vorlauf integer not null default 30;
