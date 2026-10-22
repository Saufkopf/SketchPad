# SketchPad 1.2 – Installation und Test

## Vor dem Update
1. In der bisherigen App über **⋮ → Projekt sichern (.json)** alle wichtigen Projekte einzeln exportieren. Das ist besonders wichtig, weil die App noch eine Testversion ist.
2. Dieses ZIP entpacken. Die Dateien direkt im Hauptverzeichnis des GitHub-Repositorys `SketchPad` ersetzen (nicht den ZIP-Ordner hochladen). In GitHub **Commit changes** wählen.
3. Auf dem Tablet `https://saufkopf.github.io/SketchPad/` neu öffnen. Bei einer älteren Ansicht Chrome neu starten und die Seite neu laden. Die Service-Worker-Version wurde geändert.

## Bedienung
- **Wand:** Stift entlang der gewünschten Wandkante ziehen. Die zweite blaue Linie entsteht auf der anderen Seite. Stift heben und vom aktiven Endpunkt aus weiterzeichnen. **✓ Wand fertig** beendet den Wandzug.
- **Fenster / Tür:** Werkzeug wählen, bestehende Wand antippen und entlang der Wand ziehen. Grüne Vorschau wird beim Loslassen übernommen. Die Darstellung ist eine frühe Testfunktion: Die blauen Wandlinien werden an der Öffnung derzeit noch nicht automatisch ausgeschnitten.
- **Maß:** ersten Punkt antippen, zweiten Punkt antippen, anschließend auf die gewünschte Position der Maßlinie tippen. Im Zahlenfeld die Maßzahl eingeben und übernehmen. Die rote Maßzahl steht oberhalb der Linie.
- **Radierer:** Durchmesser im unteren Feld einstellen. Während des Radierens erscheint ein roter Kreis zur Orientierung. Die aktuelle Radierfunktion zeichnet weiß über vorhandene Striche; echtes objektbasiertes Löschen ist noch nicht implementiert.
- **Text:** Werkzeug wählen, auf Zeichenfläche tippen, Text eingeben und mit OK bestätigen. Nach dem Dialog sollten andere Werkzeuge sofort wieder funktionieren.
- **Foto:** **📷 Aufnehmen** öffnet auf unterstützten Android-Browsern die Kameraauswahl; **▧ Galerie** wählt eine vorhandene Datei. Kameraunterstützung ist geräte-/browserabhängig und muss am Samsung Tablet geprüft werden. Ein eingefügtes Foto mit dem Foto-Werkzeug auswählen, dann das Schlosssymbol verwenden.
- **Checkliste:** Unten im Dropdown Küche, Diele, Schlafzimmer oder Bad wählen. Die Vorlagen sind handschriftlich ausfüllbar.
- **Seiten:** **＋ Seite** fügt hinzu; **🗑 Seite** löscht die aktuelle Seite nach Rückfrage.
- **Zoom:** Zwei Finger auf der Zeichenfläche. Bei erkanntem S Pen kann ein Finger radieren.

## Datensicherheit
Änderungen werden automatisch lokal in IndexedDB gespeichert (mit kurzer Verzögerung). Zusätzlich versucht die App bei Hintergrundwechsel zu speichern und prüft alle zwei Minuten. Browserdaten können gelöscht werden; darum wichtige Projekte zusätzlich als JSON sichern. Das PDF wird über den Druckdialog erstellt.

## Bekannte Einschränkungen
- Fenster und Türen schneiden die blaue Wand noch nicht geometrisch aus.
- Fensterbank/Türanschlag sind vereinfachte Zeichnungen.
- Radierer übermalt weiß statt Objekte zu entfernen; auf Fotos kann das störend sein.
- Die Handschrifterkennung für Maße ist nicht eingebaut (Zahlenfeld vorhanden).
- Ein umfassender Android-Hardwaretest wurde noch nicht durchgeführt.
