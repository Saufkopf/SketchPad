# SketchPad 1.3.5 – Geometrie- und Linienkorrektur

## Änderungen
- Wandlinien von 2,5 auf 1,15 Zeichen-Einheiten reduziert; freie Enden geschlossen.
- Wand-Eckverbindungen werden an den versetzten Linien berechnet; zusätzliche überlagerte Eckstriche entfallen.
- Fenster: an der angeklickten Wandseite ausgerichtet, Fensterbank nach außen auf dieser Seite; Fensterdetail anhand der DXF-Proportionen vereinfacht.
- Türen: Stift-Aufsetzpunkt ist immer die Bandseite. Ziehen nach rechts oder links spiegelt Türblatt und 90-Grad-Bogen; Wahl der gegenüberliegenden Wandlinie spiegelt die Öffnungsseite.
- Fenster-/Türlinien von 2 auf 1,05 reduziert.
- Stiftstärke: 0,1 bis 12 in 0,1er-Schritten, Standard 1.
- Zusätzlich Fehler in der Maßlinien-Darstellung (fehlende Richtungsvariablen) behoben.

## Installation
ZIP entpacken und alle 7 Dateien im GitHub-Repository `Saufkopf/SketchPad` ersetzen. Änderungen committen. Nach Veröffentlichung SketchPad neu laden; bei Offline-Cache-Problemen Seite erneut laden. Vorher Projekte als JSON sichern.

## Bitte testen
1. Wand in L-, U- und Z-Form mit freien Enden und spitzen Winkeln.
2. Fenster auf der oberen und unteren Wandlinie – Fensterbank muss jeweils auf der angetippten Seite liegen.
3. Tür auf der oberen Wandlinie nach links und rechts ziehen; dasselbe an der unteren Wandlinie.
4. Bisheriges Projekt laden, neue Zeichenseite hinzufügen und Stiftstärke 0,1 testen.

**Grenzen:** CAD-Symbole sind proportional an die frei gezeichneten Maße angepasst, keine 1:1-DXF-Blöcke. Noch kein vollständiger Tablet-End-to-End-Test. Alte gespeicherte Tür-/Fensterobjekte können mit der neuen Darstellung anders aussehen.
