# SketchPad 1.3 – Zwischenversion zum Testen

Diese Version baut auf SketchPad 1.2 auf. Es handelt sich um eine **Teilumsetzung** der besprochenen Version 1.3, nicht um eine fertige CAD- oder PDF-Lösung.

## Änderungen
- Zusätzliche feine Stiftstärken ab 0,25 (relative Zeichenbreite; keine Millimeter).
- Radiercursor beim Finger 10 Bildschirmpixel links vom Berührungspunkt; Radierlinie ebenfalls versetzt.
- Rechteckwerkzeug in der linken Werkzeugleiste ergänzt.
- Standardfarbe Blau, Checklisten-Handschrift Grün.
- Fenster können nun an beiden parallelen Wandkanten eingerastet werden. Fensterbank erhält seitliche Überstände.
- Türbogen als Viertelkreis überarbeitet (Anschlag und Richtung bitte testen).
- Mittlere Maustaste verschiebt die Zeichenfläche auf dem Desktop.
- Kamera-Button als direktes Dateieingabe-Label für Android umgesetzt; tatsächliche Kameraauswahl hängt von Chrome und Android ab.
- Druckvorschau versucht pro Zeichnung eine große inhaltsabhängige Seitengröße und für Checklisten A4. **Achtung:** Android-/Browser-Druckdialoge können das auf A4 umstellen; Linien werden noch als hochauflösendes Rasterbild ausgegeben, nicht als echte PDF-Vektoren.
- Offline-Cache-Versionsnummer aktualisiert.

## Noch offen
- Fenster- und Türöffnungen schneiden die Wand noch nicht aus; exakte Geometrie nach DXF ist noch nicht umgesetzt.
- Geschlossene Wand-Eckverbindungen, Maßbearbeitung per Ziehen und rosa Eingabepunkt.
- Fotogrößen-Anfasspunkte, automatische Verriegelung, mehrzeiliger verschiebbarer Text.
- Vektor-PDF mit zuverlässig gemischten individuellen Seitengrößen.
- Echte Objekt-Radierfunktion ohne Weißübermalen.

## Installation / Schutz deiner Daten
1. **Vor dem Update** in der bisherigen App über „Projekt sichern (.json)“ eine Sicherung exportieren.
2. ZIP entpacken und alle Dateien direkt im GitHub-Repository `Saufkopf/SketchPad` hochladen, vorhandene Dateien ersetzen.
3. GitHub Pages auf `main` und `/(root)` belassen.
4. Auf dem Tablet die App schließen und erneut starten; falls die alte Version angezeigt wird, die Webseite im Chrome-Tab neu laden.
5. Zuerst ein Testprojekt anlegen und Stift, Kamera, Fenster, Tür, PDF-Vorschau testen. Wichtige Aufmaße zusätzlich als JSON sichern.

Die Zeichnungen werden lokal im Browser gespeichert. Browserdaten löschen kann diese Daten entfernen.
