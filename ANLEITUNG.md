# SketchPad 1.3.1 – Fehlerkorrektur

## Behobener Fehler
In 1.3 wurde beim Start ein nicht vorhandenes HTML-Element `takephoto` angesprochen. Dadurch brach die JavaScript-Initialisierung ab und die Zeichenwerkzeuge wurden nicht aktiviert. Der ungültige Aufruf wurde entfernt; die Kamera verwendet weiterhin die Schaltfläche `📷 Aufnehmen` mit dem Dateieingabefeld `photocamera`.

## Aktualisieren
1. Vorhandene Projekte in der bisherigen App nach Möglichkeit als JSON sichern.
2. ZIP entpacken und die Dateien direkt in das GitHub-Repository `SketchPad` hochladen, bestehende Dateien ersetzen.
3. Commit changes klicken und auf die Veröffentlichung warten.
4. Auf dem Tablet die App vollständig schließen und neu öffnen. Falls noch die alte Fassung erscheint, Browserseite neu laden. Oben muss `SketchPad 1.3.1` stehen.
5. Stift, Linie, Wand, Radierer, Text und Foto testen.

Die Zeichnungen werden lokal im Browser gespeichert. Ein JSON-Export bleibt als zusätzliche Sicherung wichtig. Die neue Fassung wurde statisch geprüft, jedoch nicht auf einem Samsung-Tablet praktisch getestet.
