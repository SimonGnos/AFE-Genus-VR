# GENUS-VR Prototyp — Spezifikation v1

Grundlage für die Entwicklung. Alle Vorgaben sind aus einem Anforderungskatalog
(Stakeholder-Interviews) und einer Designentscheidungstabelle abgeleitet. Die IDs in
Klammern (DE-xx) verweisen auf dokumentierte Entscheide und dürfen nicht eigenmächtig
umgangen werden. Bei Konflikten oder technischen Hindernissen: nachfragen statt
selbstständig abweichen.

---

## 1. Was gebaut wird

Eine browserbasierte Webanwendung, die auf einem iPhone in einer Cardboard-VR-Halterung
(VR Shinecon G07E) läuft. Sie spielt ein Video stereoskopisch ab und überlagert es mit
einem pulsierenden Helligkeitseffekt, der eine 40-Hz-Lichtstimulation illustriert.

Zweck ist eine **Usability-Erhebung** mit älteren Testpersonen. Es ist **keine
medizinische Anwendung** und **kein Wirksamkeitstest**. Frequenzgenauigkeit ist
ausdrücklich nicht gefordert (DE-07).

Zielgerät: iPhone, Safari. Bedienung durch eine Begleitperson, nicht durch die
Testperson selbst.

### Nutzungsablauf

Der Ablauf bestimmt die Struktur der Anwendung:

1. Die Begleitperson bedient die Anwendung **am Smartphone in der Hand**.
2. Sie startet die Sitzung. Die Wiedergabe beginnt sofort — jedes Video enthält jedoch
   einen **30 Sekunden langen Vorlauf** mit schwarzem Bild und eingebranntem Countdown,
   während dem das Smartphone in die Halterung eingelegt und die Brille aufgesetzt wird
   (DE-32).
3. Nach dem Vorlauf beginnt der eigentliche Bildinhalt.

**Der Vorlauf ist Bestandteil der Videodateien und nicht zu programmieren.** Die
Anwendung startet lediglich die Wiedergabe; Countdown, Hinweistext und Übergang liegen
im Material. Es gibt daher keine Countdown-Ansicht und keine Zeitsteuerung im Code.

Daraus folgt: Die Startansicht wird ohne Brille gelesen, der Bildinhalt durch die Linsen.
Der Countdown ist während des Vorlaufs in beiden Bildhälften doppelt zu sehen — das ist
so beabsichtigt und für das Ablesen aus der Hand unproblematisch.

---

## 2. Technische Rahmenbedingungen

- **Keine Build-Werkzeuge, keine Frameworks, keine npm-Abhängigkeiten.** Eine einzelne
  `index.html` mit eingebettetem CSS und JavaScript, plus die Videodateien im gleichen
  Ordner. Das Ergebnis muss durch Ablegen des Ordners auf einem statischen Hosting-Dienst
  (Netlify) lauffähig sein (DE-01, DE-05).
- **Kein `localStorage`, keine Datenspeicherung, keine Nutzerprofile** (DE-24).
- **Keine Netzwerkabhängigkeit zur Laufzeit** ausser dem Laden der Seite selbst — keine
  externen Schriften, CDN-Skripte oder Tracking.
- Videos werden **lokal** referenziert (`./video/…`).

### iOS-Safari-Besonderheiten, die zwingend berücksichtigt werden müssen

- `playsinline` am `<video>`-Element, sonst reisst iOS die Wiedergabe in den nativen
  Player und die stereoskopische Darstellung ist zerstört.
- **Tonfreischaltung.** Safari erlaubt Tonwiedergabe nur unmittelbar aus einer
  Nutzerinteraktion. `video.play()` muss deshalb **synchron im Klick-Handler** des
  Startknopfes aufgerufen werden — nicht nach einem `await`, nicht in einem `setTimeout`,
  nicht in einem Promise-Callback. Da der Vorlauf im Video steckt, entsteht hier keine
  Verzögerung und keine Sonderbehandlung.
- Der Wake Lock wird ebenfalls **im Klick-Handler** angefordert, damit der Bildschirm
  während des Einspannens nicht abdunkelt.
- Für die Vollbilddarstellung nicht auf die Fullscreen-API verlassen — Safari behandelt
  Videos dort abweichend. Stattdessen eine CSS-Vollflächenansicht (`position: fixed`,
  `inset: 0`) und `viewport-fit=cover` mit `safe-area-inset`-Behandlung.
- `navigator.wakeLock` anfordern, damit der Bildschirm während der Sitzung nicht
  abschaltet. Fehlende Unterstützung darf nicht zum Abbruch führen — still scheitern und
  in der Konsole vermerken.
- Audio läuft über Bluetooth-Kopfhörer. Die Anwendung enthält **kein**
  Lautstärke-Bedienelement, die Regelung erfolgt an der Hardware (DE-19).

---

## 3. Ansicht 1 — Start

Eine Ansicht, die **ohne Scrollen** vollständig auf einen iPhone-Bildschirm passt
(DE-15). Das ist eine harte Anforderung: keine vertikale Scrollbarkeit, auch nicht auf
kleinen Geräten. Prüfe die Höhe mit `100dvh` und teste gegen 375 × 667 px als
kleinsten Fall.

Elemente, in dieser Rangordnung:

1. **Primäre Aktion: Schnellstart.** Grosse Fläche, dominant, mit klarer Beschriftung.
   Startet unmittelbar ein zufällig gewähltes Video (DE-14).
2. **Zwei Videokacheln** zur direkten Auswahl. Jede zeigt Namen und Laufzeit. Ein Tippen
   startet das jeweilige Video.
3. Nichts weiter. Keine Einstellungen für Dauer, Lautstärke oder Stimulationsintensität —
   diese sind bewusst entfallen (DE-18, DE-19, DE-26, DE-27).

Die Sitzungsdauer ergibt sich aus der Videolänge (DE-18).

### Sprache und Ton

Deutschsprachig, **Du-Form**, Schweizer Schreibweise (ss statt ß) (DE-30). Formulierungen
beschreiben, was passiert, nicht was das System tut. Beispiel: «Los geht's» statt
«Sitzung initialisieren». Sätze kurz, Sprache konkret, keine Fachbegriffe.

---

## 4. Ansicht 2 — Sitzung

Vollflächige Darstellung, schwarzer Hintergrund.

- **Stereoskopische Ausgabe:** Das Video wird zweimal nebeneinander gerendert, linke und
  rechte Hälfte identisch (kein echtes Stereobild). Jede Hälfte nimmt 50 % der Breite
  ein und ist innerhalb ihrer Hälfte zentriert (DE-04).
- Der **horizontale Abstand der beiden Bildmitten muss über eine einzelne Konstante im
  Code justierbar** sein. Der passende Wert für die Pupillendistanz lässt sich nur am
  Gerät empirisch ermitteln — mach diesen Parameter leicht findbar und kommentiert.
- **Stimulations-Overlay:** Eine halbtransparente weisse Fläche über dem Video, deren
  Deckkraft periodisch schwankt und so ein Pulsieren erzeugt. Umsetzung über
  `requestAnimationFrame`, **nicht** über CSS-Animationen.
  - Die Stimulation läuft permanent und ist nicht abschaltbar (DE-26).
  - Fläche und Helligkeitsschwankung sind **feste, illustrativ gewählte Werte** und als
    benannte Konstanten mit Kommentar im Code abgelegt, damit sie dokumentierbar und in
    einer Folgeversion anpassbar sind (DE-27).
  - Die Wirkung soll wahrnehmbar, aber erträglich sein. Aus den Interviews ist bekannt,
    dass ein starkes sichtbares Flackern als deutlich unangenehm erlebt wird. Beginne
    daher konservativ.
  - **Während des 30-sekündigen Vorlaufs bleibt das Overlay aus.** Der Countdown wäre
    sonst schlecht lesbar, und die Stimulation soll erst einsetzen, wenn die Brille sitzt.
    Steuerung über `video.currentTime` gegen die Vorlauf-Konstante.
- **Timer:** Dezent, unaufdringlich, in beiden Bildhälften sichtbar. Er zählt die
  Restzeit des Bildinhalts, also ohne den Vorlauf, und erscheint erst nach dessen Ende.
- **Kein Bedienelement zum Abbrechen** (DE-16). Der Abbruch erfolgt physisch durch
  Abnehmen der Brille.
- **Eine Berührung an beliebiger Stelle** führt zurück zur Startansicht (DE-17). Aktiv
  erst nach Ablauf des Vorlaufs plus zwei Sekunden — beim Einlegen in die Halterung
  berührt man den Bildschirm unweigerlich, und jede Reaktion darauf wäre eine
  Fehlbedienung.
- **Nach Ablauf des Videos** kehrt die Anwendung automatisch zur Startansicht zurück
  (DE-31). Keine Wiederholung, kein Schwarzbild.

---

## 5. Gestaltung

Die Oberfläche wird von älteren Personen und wenig technikaffinem Begleitpersonal
bedient. Daraus folgt:

- Grosse Berührungsflächen, mindestens 60 px Höhe, mit deutlichem Abstand zueinander.
- Hoher Kontrast, grosse Schrift. Keine dünnen Schriftschnitte, keine Grautöne auf Grau.
- Ruhige Farbigkeit ohne grelle Töne — passend zum Inhaltskonzept der Anwendung
  (naturnah, entschleunigt). Vermeide Dämmerungs- und Abendtöne, diese sind inhaltlich
  ausgeschlossen (DE-11).
- Systemschriften verwenden, keine Webfonts laden.
- Zurückhaltende Bewegung. Ein Zustandswechsel darf sichtbar sein, mehr nicht.
- Sichtbarer Tastaturfokus, `prefers-reduced-motion` respektieren.

---

## 6. Ausdrücklich nicht Bestandteil

Nicht implementieren, auch nicht als Vorbereitung:

- Nicht-immersive Alternativansicht für Bildschirm oder Tablet (DE-21)
- Offline-Fähigkeit, Service Worker, PWA-Manifest (DE-22)
- Nutzungsprotokolle, Auswertungen, Schnittstellen (DE-23)
- Fragebogen in der Anwendung — die Erhebung erfolgt auf Papier (DE-29)
- Frequenzverifikation oder eigenständiger Stimulationston (DE-07, DE-08)
- Kopfbewegungssteuerung, 360-Grad-Darstellung, WebXR (DE-09)
- Mehrsprachigkeit
- Einstiegsanleitung in der Anwendung — noch offen (DE-20), bis dahin weglassen
- Countdown, Vorlaufsteuerung oder Zeitverzögerung im Code — der Vorlauf liegt
  vollständig im Videomaterial (DE-32)

---

## 7. Videodateien

Zwei Platzhalter im Ordner `video/`:

| Datei | Bezeichnung in der Oberfläche | Vorlauf | Bildinhalt | Gesamtlänge |
|---|---|---|---|---|
| `wald_2min.mp4` | Wald | 0:30 | 2:00 | 2:30 |
| `meer_5min.mp4` | Meer | 0:30 | 5:00 | 5:30 |

In der Startansicht wird die **Länge des Bildinhalts** angezeigt (2 bzw. 5 Minuten), nicht
die Gesamtlänge — der Vorlauf ist Rüstzeit, nicht Sitzungsinhalt.

Die Liste soll in einer einzelnen Datenstruktur am Anfang des Skripts liegen, sodass
weitere Videos durch Ergänzen eines Eintrags hinzukommen — ohne Änderung der Logik. Die
Vorlaufdauer liegt als eigene Konstante daneben.

**Wichtig für künftige Inhalte:** Jedes neue Video muss den 30-sekündigen Vorlauf bereits
enthalten. Wird ein Clip ohne Vorlauf eingesetzt, startet der Bildinhalt, während das
Gerät noch in der Hand ist.

---

## 8. Abnahmekriterien

Vor Abschluss zu prüfen:

1. Startansicht ist auf 375 × 667 px vollständig ohne Scrollen sichtbar.
2. Nach dem Tippen startet die Wiedergabe **mit hörbarem Ton** und der Countdown des
   Vorlaufs ist sichtbar.
3. Berührungen während des Vorlaufs bleiben wirkungslos.
4. Der Bildschirm dunkelt während des Vorlaufs nicht ab.
5. Das Stimulations-Overlay setzt erst nach dem Vorlauf ein.
6. Video bleibt in der eigenen Ansicht, wird nicht vom nativen iOS-Player übernommen.
7. Beide Bildhälften sind identisch, gleich gross und symmetrisch angeordnet.
8. Das Pulsieren ist sichtbar und läuft ohne merkliches Stocken.
9. Der Bildschirm schaltet während der Wiedergabe nicht ab.
10. Nach Videoende erscheint automatisch die Startansicht.
11. Eine Berührung nach dem Vorlauf führt zur Startansicht.
12. Kein Konsolenfehler beim Laden und beim Start.
13. Der Ordner funktioniert unverändert, wenn er auf einen statischen Hosting-Dienst
    gelegt wird.

---

## 9. Arbeitsweise

- Git von Beginn an. Jeder abgeschlossene Schritt als eigener Commit mit
  aussagekräftiger Nachricht — der Entwicklungsverlauf ist Bestandteil der
  Projektdokumentation (DE-06).
- Erst eine lauffähige Fassung mit allen Ansichten, danach verfeinern. Keine
  Teilimplementierung über mehrere Dateien verstreut.
- Bei jeder Abweichung von dieser Spezifikation: benennen und begründen, damit sie in
  die Entscheidungstabelle aufgenommen werden kann.
