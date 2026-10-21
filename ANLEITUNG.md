# SketchPad 1.0 – Testanleitung

## Inhalt
`index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`.

## Auf Android installieren (empfohlen)
1. Alle sechs Dateien gemeinsam in das Hauptverzeichnis eines neuen GitHub-Repositories hochladen (z. B. `sketchpad`).
2. Im Repository unter **Settings → Pages → Build and deployment** bei Source **Deploy from a branch**, Branch **main**, Folder **/(root)** wählen und speichern.
3. Nach der Veröffentlichung die HTTPS-Adresse `https://BENUTZERNAME.github.io/sketchpad/` in **Chrome auf dem Android-Tablet** öffnen.
4. Chrome-Menü **⋮ → Zum Startbildschirm hinzufügen → Installieren** (Bezeichnung je nach Chrome-Version).
5. Nach dem ersten vollständigen Laden funktioniert die App auch offline. Für Updates die Seite bei Internetverbindung neu laden.

## Lokal am Computer testen
Im Ordner mit den Dateien ein Terminal öffnen und `python -m http.server 8000` ausführen. Dann `http://localhost:8000` öffnen. Nicht direkt per `file://` starten: Service Worker und einige Speicherfunktionen benötigen einen lokalen Server oder HTTPS.

## Bedienung
- Stift, Radierer, Linie, Rechteck, Ellipse, Maßlinie, Verschieben: linke Leiste.
- Beim Maßlinienwerkzeug nach dem Ziehen den Maßtext eingeben. Die Zeichnung wird **nicht automatisch maßstäblich** angepasst.
- Bei aktiviertem „Nur Stift“ werden nach der ersten erkannten Stifteingabe Finger zum Verschieben verwendet. Vorher ist Fingerzeichnen möglich, um die App ohne Stift testen zu können.
- Zwei Finger: zoomen und verschieben. Mausrad: zoomen. Hand-Werkzeug: verschieben.
- Oben: rückgängig, wiederholen, Ansicht anpassen, Menü.
- Unten: Farbe, Strichstärke, Papierformat, Raster.
- Menü: Zeichnungen anlegen, laden, löschen, als PNG oder JSON exportieren, JSON importieren, über Druckdialog als PDF speichern.

## Grenzen der ersten Version
- Der Radierer malt weiß und entfernt keine Vektorobjekte; auf Rasterfeldern kann das sichtbar sein.
- A4/A3-Formate sind proportional korrekt; für maßstäbliche Ausdrucke muss die Druckskalierung geprüft werden.
- Keine Ebenen, kein Textwerkzeug, keine PDF-Importfunktion und keine native Android-Handballenerkennung.
- PDF-Ausgabe erfolgt über den Druckdialog; im Dialog „Als PDF speichern“ auswählen.
- Daten werden in IndexedDB des jeweiligen Browsers gespeichert. Browserdaten-Löschung entfernt Projekte. Wichtige Skizzen regelmäßig als JSON exportieren.
- Offlinefähigkeit erst nach erfolgreicher Installation/erstem Laden über HTTPS.
- Auf einzelnen Geräten ist die Stift-/Touch-Erkennung browserabhängig.
