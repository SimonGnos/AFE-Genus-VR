# GENUS-VR — Deployen und Videos pflegen

Diese Anleitung setzt keine Programmierkenntnisse voraus.

---

## 1 · Ordner vorbereiten

Lege auf deinem Rechner einen Ordner an, zum Beispiel `genus-vr`. Darin muss es
genau so aussehen:

```
genus-vr/
├── index.html          ← die App
├── videos.json         ← Grundeinstellungen und Rückfallebene
└── video/              ← Unterordner mit den ursprünglichen Videodateien
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

Nur noch nötig, wenn sich **die App selbst** ändert — also `index.html` oder
`videos.json`. Für Videos und Inhalte brauchst du das nicht mehr, siehe
Abschnitt 5.

1. Site in Netlify öffnen → Reiter **«Deploys»**.
2. Den Ordner `genus-vr` erneut in das Feld unten («Drag and drop your site
   output folder here») ziehen.
3. Fertig. Die Adresse bleibt dieselbe, die neue Fassung ist nach etwa einer
   Minute aktiv.

Falls auf dem iPhone noch die alte Version erscheint: Seite in Safari mit
gedrücktem Neuladen-Symbol neu laden, oder Safari-Verlauf leeren.

---

## 5 · Inhalte in der App verwalten

**Du musst dafür nichts mehr hochladen und keine Datei bearbeiten.** Auf dem
Startbildschirm oben rechts sitzt der Knopf **⚙**. Nach Eingabe des Admin-Codes
kannst du dort Videos hochladen, Einträge ändern und löschen. Die Änderungen
liegen in Supabase und sind sofort auf **allen** Geräten sichtbar — kein neues
Deploy bei Netlify nötig.

### Ein neues Video hinzufügen

1. **⚙** antippen, Admin-Code eingeben.
2. Unter «Neues Video» die Datei wählen. Der Name füllt sich von selbst.
3. **Vorlauf in Sekunden eintragen** — wie lang der eingebrannte Countdown am
   Anfang dieser Datei ist. Daraus rechnet die App die Sitzungsdauer aus und
   zeigt sie an, etwa «Datei 5:10 − 10 s Vorlauf → 5 Min. Sitzung».
4. Kurzbeschrieb und Farben setzen, dann **«Hochladen und anlegen»**.

Das Video geht direkt vom Gerät in den Speicher, ein Balken zeigt den
Fortschritt. Über Mobilfunk dauert das bei einigen Megabyte entsprechend.

### Die Felder

| Feld | Bedeutung |
|---|---|
| Name | Was in der App auf der Karte steht |
| Kurzbeschrieb | Die kleine Zeile darunter |
| Länge (Min.) | Dauer der Sitzung, **ohne** den Vorlauf. Bei neuen Videos aus der Dateilänge abzüglich Vorlauf gerechnet und auf volle Minuten gerundet |
| Vorlauf (Sek.) | Länge des eingebrannten Countdowns dieser Datei. Erst danach setzen Stimulation und Timer ein. Unterschiedliches Material hat unterschiedlichen Vorlauf — der Wert gehört deshalb zum Video, nicht zur App |
| Reihenfolge | Position auf dem Auswahlbildschirm, niedrige Zahl zuerst |
| Farbe dunkel / hell | Der Farbverlauf auf der Karte — Ersatz für ein Vorschaubild, dient dem schnellen Wiedererkennen |

**Die Längenauswahl entsteht automatisch.** Legst du ein Video mit 10 Minuten an,
erscheint von selbst eine dritte Option «10 Min.».

**Löschen entfernt auch die Videodatei.** Deshalb die Rückfrage.

### Wenn du den Admin-Code ändern willst

Im Supabase-Dashboard unter **Edge Functions → Secrets** den Wert von
`ADMIN_CODE` ersetzen. Die Änderung wirkt sofort, die App muss nicht angefasst
werden.

### Was noch über Netlify läuft

Die vier ursprünglichen Videos liegen weiterhin im Ordner `video/` auf Netlify
und funktionieren unverändert. Nur neu hochgeladene Videos liegen in Supabase.
Auch `videos.json` bleibt: die Datei liefert den Vorlauf und die Beschriebe der
Längen und dient als Rückfallebene, falls Supabase einmal nicht erreichbar ist.
Dann zeigt die App den Stand aus dieser Datei — eine laufende Erhebung bricht
also nicht ab.

---

## 6 · Der 30-Sekunden-Vorlauf

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

## 7 · Auswahlkriterien für neue Inhalte

Aus dem Anforderungskatalog (DE-11, DE-12) — bei der Materialauswahl beachten:

**Geeignet:** naturnah, entschleunigt, positiv besetzt, langsame Bewegung, lange
Einstellungen ohne Schnitte, gleichmässiges Tageslicht.

**Ungeeignet:** schnelle Schnittfolgen, grelle Farben, Dämmerungs- und
Abendstimmung (wegen des Sundowning-Phänomens), traurige oder bedrohliche
Motive.

Halte für jeden Clip fest, woher er stammt und unter welcher Lizenz — das
brauchst du für den Bericht.

---

## 8 · Wenn etwas nicht funktioniert

| Beobachtung | Ursache und Abhilfe |
|---|---|
| «Keine Inhalte gefunden» | Weder Supabase noch `videos.json` lieferten etwas. Internetverbindung prüfen; sonst `videos.json` auf Tippfehler, etwa auf `jsonlint.com`. |
| «Falscher Code.» | Der Code stimmt nicht mit `ADMIN_CODE` in den Supabase-Secrets überein. |
| Änderung auf anderem Gerät nicht sichtbar | Seite dort neu laden. Der Katalog wird beim Start geladen, nicht laufend. |
| Hochladen bricht ab | Verbindung instabil. Im WLAN wiederholen — über Mobilfunk sind einige Megabyte anfällig. |
| Schwarzes Bild statt Video | Der Pfad in `datei` stimmt nicht mit dem echten Dateinamen überein. Gross- und Kleinschreibung ist entscheidend. |
| Kein Ton | Kopfhörer vor dem Einlegen koppeln. Der Stummschalter am iPhone betrifft die Videowiedergabe nicht, die Lautstärkewippe aber schon. |
| Bildschirm wird dunkel | Auto-Sperre am Gerät verlängern oder deaktivieren. |
| Alte Fassung erscheint | Safari lädt aus dem Zwischenspeicher. Seite hart neu laden. |
| Beim Doppelklick auf `index.html` fehlen Videos | Erwartetes Verhalten. Browser verweigern lokal das Nachladen von Dateien. Über die Netlify-Adresse testen. |
