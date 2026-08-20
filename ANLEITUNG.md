# GENUS-VR — Deployen und Videos pflegen

Diese Anleitung setzt keine Programmierkenntnisse voraus.

---

## 1 · Ordner vorbereiten

Lege auf deinem Rechner einen Ordner an, zum Beispiel `genus-vr`. Darin muss es
genau so aussehen:

```
genus-vr/
├── index.html          ← die App
├── videos.json         ← die Liste der Inhalte, hier änderst du später
└── video/              ← Unterordner mit den Videodateien
    ├── wald_2min.mp4
    ├── wiese_2min.mp4
    ├── meer_5min.mp4
    └── bergsee_5min.mp4
```

Wichtig: Der Unterordner heisst **`video`** (Einzahl, klein geschrieben). Die
Datei `videos.json` liegt **nicht** darin, sondern daneben.

---

## 2 · Konto bei Netlify anlegen

Ohne Konto bekommst du bei jedem Hochladen eine neue Adresse und die alte
verfällt nach kurzer Zeit. Mit Konto behältst du dieselbe Adresse dauerhaft —
das ist entscheidend, weil du sie auf QR-Codes drucken und dem Team geben wirst.

1. Gehe auf **app.netlify.com** und registriere dich (kostenlos, E-Mail genügt).
2. Nach der Anmeldung landest du auf der Übersicht «Sites».

---

## 3 · Erstes Hochladen

1. Wähle **«Add new site» → «Deploy manually»**.
2. Ziehe den **gesamten Ordner** `genus-vr` in das Feld. Nicht die einzelnen
   Dateien, sondern den Ordner.
3. Nach etwa einer Minute erscheint eine Adresse wie
   `zufallsname-12345.netlify.app`.
4. Unter **«Site configuration» → «Change site name»** kannst du sie in etwas
   Sprechendes ändern, etwa `genus-vr.netlify.app`.

Diese Adresse auf dem iPhone in **Safari** öffnen. Nicht in Chrome — die App ist
gegen Safari gebaut.

---

## 4 · Eine neue Version hochladen

Immer wenn du etwas geändert hast:

1. Site in Netlify öffnen → Reiter **«Deploys»**.
2. Den Ordner `genus-vr` erneut in das Feld unten («Drag and drop your site
   output folder here») ziehen.
3. Fertig. Die Adresse bleibt dieselbe, die neue Fassung ist nach etwa einer
   Minute aktiv.

Falls auf dem iPhone noch die alte Version erscheint: Seite in Safari mit
gedrücktem Neuladen-Symbol neu laden, oder Safari-Verlauf leeren.

---

## 5 · Ein Video austauschen

Wenn der neue Clip **gleich lang** ist und **gleich heissen** soll:

1. Neue Datei in den Ordner `video/` legen und die alte überschreiben.
2. Ordner neu hochladen (Schritt 4).

Sonst zusätzlich `videos.json` anpassen — siehe nächster Abschnitt.

---

## 6 · Inhalte in der App verwalten

Du musst `videos.json` nicht von Hand bearbeiten. Auf dem Startbildschirm gibt es
oben rechts den Knopf **«Inhalte»**. Dort kannst du Einträge anlegen, ändern und
entfernen.

**Die Felder je Zeile:**

| Feld | Bedeutung |
|---|---|
| Name | Was in der App auf der Karte steht |
| Kurzbeschrieb | Die kleine Zeile darunter |
| Datei | Dateiname, immer beginnend mit `video/` |
| Min. | Länge des Bildinhalts **ohne** den 30-Sekunden-Vorlauf |
| Farbe | Farbstimmung der Karte, aus einer Auswahl |

**So gehen Änderungen dauerhaft in die App:**

1. Änderungen im Verwaltungsbereich vornehmen. Sie wirken sofort — du siehst das
   Ergebnis direkt auf den Auswahlbildschirmen.
2. **«videos.json sichern»** antippen. Die Datei wird heruntergeladen.
3. Die heruntergeladene Datei im Ordner `genus-vr` gegen die alte austauschen.
4. Die Videodateien in den Unterordner `video/` legen.
5. Ordner neu hochladen (Schritt 4 dieser Anleitung).

**Wichtig zu verstehen:** Solange du nicht neu hochlädst, existieren die
Änderungen nur im Browser des Geräts, an dem du sie gemacht hast. Das erkennst du
am orangen Hinweis **«Nur auf diesem Gerät»** oben rechts. Andere Geräte sehen
weiterhin den alten Stand.

Der Knopf **«Zurücksetzen»** verwirft die lokalen Änderungen und stellt den Stand
aus `videos.json` wieder her.

**Videodateien lassen sich nicht über die App hochladen.** Sie müssen in den
Ordner `video/` und mit dem Ordner hochgeladen werden. Die Verwaltung pflegt nur
die Liste, nicht die Dateien.

**Die Längenauswahl entsteht automatisch.** Legst du ein Video mit 10 Minuten an,
erscheint von selbst eine dritte Option «10 Min.» — es gibt nichts weiter
einzustellen.

---

## 7 · Der 30-Sekunden-Vorlauf

**Jedes Video muss den Vorlauf bereits enthalten** — 30 Sekunden schwarzes Bild
mit Countdown, in denen das Handy eingelegt und die Brille aufgesetzt wird. Ein
Clip ohne Vorlauf startet, während das Gerät noch in der Hand ist.

Um den Vorlauf an einen neuen Clip anzufügen, brauchst du das Werkzeug `ffmpeg`.
In Claude Code kannst du diesen Befehl ausführen lassen — `neuer_clip.mp4` durch
deinen Dateinamen ersetzen:

```bash
ffmpeg -f lavfi -i "color=c=black:s=1280x720:d=30:r=30" \
  -f lavfi -i "anullsrc=r=48000:cl=mono:d=30" \
  -vf "drawtext=text='%{eif\:30-t\:d}':fontsize=190:fontcolor=0xE8E4DA:x=(w-text_w)/2:y=(h-text_h)/2-40,\
drawtext=text='Brille aufsetzen':fontsize=44:fontcolor=0x8A8578:x=(w-text_w)/2:y=h/2+130" \
  -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ar 48000 -ac 1 -shortest vorlauf.mp4

printf "file 'vorlauf.mp4'\nfile 'neuer_clip.mp4'\n" > liste.txt
ffmpeg -f concat -safe 0 -i liste.txt -c copy -movflags +faststart fertig.mp4
```

Damit das Zusammenfügen ohne Neuberechnen gelingt, müssen Vorlauf und Clip
dieselbe Auflösung und Bildrate haben (1280 × 720, 30 Bilder pro Sekunde). Falls
dein Clip abweicht, rechne ihn vorher um:

```bash
ffmpeg -i original.mp4 -vf scale=1280:720 -r 30 -c:v libx264 -crf 26 \
  -c:a aac -ar 48000 -ac 1 clip_normiert.mp4
```

---

## 8 · Auswahlkriterien für neue Inhalte

Aus dem Anforderungskatalog (DE-11, DE-12) — bei der Materialauswahl beachten:

**Geeignet:** naturnah, entschleunigt, positiv besetzt, langsame Bewegung, lange
Einstellungen ohne Schnitte, gleichmässiges Tageslicht.

**Ungeeignet:** schnelle Schnittfolgen, grelle Farben, Dämmerungs- und
Abendstimmung (wegen des Sundowning-Phänomens), traurige oder bedrohliche
Motive.

Halte für jeden Clip fest, woher er stammt und unter welcher Lizenz — das
brauchst du für den Bericht.

---

## 9 · Wenn etwas nicht funktioniert

| Beobachtung | Ursache und Abhilfe |
|---|---|
| «Keine Inhalte gefunden» | `videos.json` enthält einen Tippfehler. Prüfe Kommas und Anführungszeichen, etwa auf `jsonlint.com`. |
| Schwarzes Bild statt Video | Der Pfad in `datei` stimmt nicht mit dem echten Dateinamen überein. Gross- und Kleinschreibung ist entscheidend. |
| Kein Ton | Kopfhörer vor dem Einlegen koppeln. Der Stummschalter am iPhone betrifft die Videowiedergabe nicht, die Lautstärkewippe aber schon. |
| Bildschirm wird dunkel | Auto-Sperre am Gerät verlängern oder deaktivieren. |
| Alte Fassung erscheint | Safari lädt aus dem Zwischenspeicher. Seite hart neu laden. |
| Beim Doppelklick auf `index.html` fehlen Videos | Erwartetes Verhalten. Browser verweigern lokal das Nachladen von Dateien. Über die Netlify-Adresse testen. |
