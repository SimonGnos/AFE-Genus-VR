# GENUS-VR

Browserbasierter Prototyp einer immersiven VR-Anwendung, die eine 40-Hz-Gamma-
Sensorstimulation (GENUS) illustriert. Entstanden im Rahmen der Vertiefungsarbeit
GENUS-VR (MSc Wirtschaftsinformatik, OST Ostschweizer Fachhochschule).

**Live-Version:** _Adresse hier ergänzen, sobald Netlify verbunden ist_

---

## Worum es geht

GENUS (Gamma Entrainment Using Sensory Stimulation) untersucht, ob rhythmische
Licht- und Tonreize im 40-Hz-Takt Gammawellen im Gehirn anregen und damit
Alzheimer-assoziierte Pathologien beeinflussen können. Dieses Projekt prüft, ob
sich eine solche Stimulation über ein handelsübliches Smartphone in einer
Cardboard-VR-Halterung (VR Shinecon G07E) alltagstauglich und angenehm
vermitteln lässt.

**Der Fokus liegt auf Gebrauchstauglichkeit, nicht auf klinischer Wirksamkeit.**
Die App ist ein Werkzeug für eine Usability-Studie, keine medizinische
Anwendung und kein Nachweis therapeutischer Wirkung.

## Warum dieser technische Ansatz

| Entscheidung | Begründung |
|---|---|
| Statische Web-App statt native App | Kein App-Store-Prozess, sofortiger Zugriff per Link oder QR-Code, kein Installationsschritt auf dem Testgerät |
| Cardboard-Halterung statt Standalone-Headset | Kosten von rund 20 CHF statt mehrerer hundert Franken, für eine Usability-Erhebung ausreichend |
| Kein Framework, eine `index.html` | Kein Build-Prozess, Ablage auf beliebigem statischen Hosting-Dienst, minimale Angriffsfläche |
| Videos statt WebXR/360° | Freies Bildmaterial ist begrenzt verfügbar; für die Erhebung von Bedienbarkeit ist der Immersionsgrad nachrangig |
| Simulierte statt frequenzverifizierte Stimulation | Der Prototyp untersucht Nutzungserleben, nicht Wirksamkeit; Frequenzgenauigkeit ist ausdrücklich nicht Gegenstand |

Alle Entscheidungen sind mit Anforderungsbezug in
[`GENUS-VR_Designentscheidungen_MVP_AFE2.xlsx`](./GENUS-VR_Designentscheidungen_MVP_AFE2.xlsx)
dokumentiert und bilden die Grundlage für Kapitel 4 des Arbeitsberichts.

## Projektstruktur

```
genus-vr/
├── index.html                                   ← die Anwendung (HTML/CSS/JS, ohne Abhängigkeiten)
├── videos.json                                   ← Katalog der Inhalte (Name, Länge, Datei, Farbe)
├── video/                                        ← Videodateien, referenziert aus videos.json
│   ├── wald_2min.mp4
│   ├── wiese_2min.mp4
│   ├── meer_5min.mp4
│   └── bergsee_5min.mp4
├── netlify.toml                                  ← Auslieferungskonfiguration (Caching)
├── SPEC.md                                       ← Funktionsspezifikation für die Entwicklung
├── ANLEITUNG.md                                  ← Betriebsanleitung: Deployen, Inhalte pflegen
└── GENUS-VR_Designentscheidungen_MVP_AFE2.xlsx   ← Designentscheidungstabelle mit Anforderungsbezug
```

## Ablauf in der Anwendung

**Start → Länge wählen → Bild wählen → Sitzung**

Nach der Auswahl beginnt die Wiedergabe sofort. Die ersten 30 Sekunden jedes
Videos sind ein in die Datei eingebrannter Countdown, in denen das Smartphone in
die Halterung eingelegt und die Brille aufgesetzt wird. Erst danach setzt die
sichtbare Stimulation ein. Die Sitzung endet automatisch mit dem Video oder
durch Abnehmen der Brille — es gibt bewusst kein Abbruch-Bedienelement.

Details und Begründung stehen in [`SPEC.md`](./SPEC.md).

## Inhalte pflegen

Videos können nur zentral durch den Admin angepasst werden. 

## Technischer Stand

- Kein Build-Schritt, keine Abhängigkeiten, reines HTML/CSS/JavaScript
- Getestet auf iOS Safari (Zielplattform) sowie Chromium-Browsern im Querformat
- Bekannte Einschränkung: Auf Displays mit weniger als 120 Hz Bildwiederholrate
  ist die 40-Hz-Stimulation nicht frequenzgenau darstellbar — für den
  Usability-Fokus dieser Arbeit ohne Bedeutung, siehe Designentscheidung DE-03

## Projektteam

Gruppe 4 — Simon (Entwicklung), Alex (Entwicklung), Shannon und Elias (Testing).
Betreuung: Dario Stähelin, IPM-OST.

## Lizenz und Verwendung

Hochschulprojekt im Rahmen einer Vertiefungsarbeit. Keine kommerzielle Nutzung
vorgesehen. Platzhalter-Videos sind synthetisch erzeugt; produktives
Bildmaterial ist vor Verwendung auf Lizenzbedingungen zu prüfen (siehe
`ANLEITUNG.md`, Abschnitt „Auswahlkriterien für neue Inhalte“).
