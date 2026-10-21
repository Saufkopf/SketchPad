# SketchPad 1.1 – Installation und Test

## Sicheres Update

1. In SketchPad 1.0 zuerst **Projekt exportieren** und die JSON-Datei außerhalb des Browsers aufbewahren.
2. Die ZIP-Datei entpacken. In GitHub `saufkopf/SketchPad` unter **Code → Add file → Upload files** die Dateien aus dem Paket hochladen (nicht die ZIP-Datei). Vorhandene Dateien ersetzen. `index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icon.svg` müssen im Repository-Hauptverzeichnis liegen.
3. **Commit changes**. Nach der Veröffentlichung SketchPad neu öffnen. Gegebenenfalls Seite neu laden oder die installierte App vollständig schließen und neu öffnen, damit die neue Offline-Version geladen wird.
4. Wenn ein bestehendes Projekt nicht angezeigt wird, unter **☰ → Projekt importieren** die zuvor exportierte JSON-Datei auswählen.

## Bedienung

- **✎ Stift:** mit dem Samsung S Pen zeichnen. Die Linien werden mit weichen Kurven dargestellt.
- **▥ Wand:** Linie ziehen; eine blaue Doppelwand entsteht. Annähernd waagerechte/senkrechte Linien rasten ein.
- **▤ Fenster / 🚪 Tür:** Start und Ende mit dem Stift ziehen. In Version 1.1 sind es frei platzierbare blaue Symbole, noch kein automatisches Ausschneiden der Wand.
- **↔ Maß:** zwei Endpunkte durch Ziehen festlegen, Maßzahl eingeben und Abstand (negativ/positiv) festlegen. Rot mit zwei Maßhilfslinien und gleich langen schrägen Endmarken.
- **📷 Foto:** Kamera/Galerie auswählen; das Bild wird auf 1600, 2560 oder 4000 px längste Seite reduziert. Das Original bleibt außerhalb von SketchPad unverändert. Mit Werkzeug **▧** ein entsperrtes Foto verschieben. Zum Skalieren/Drehen **🔒 Foto doppelt antippen**, Werte eingeben. Einmal antippen sperrt/entsperrt das ausgewählte Foto.
- **＋ Seite:** weitere Zeichenfläche; **＋ Checkliste:** ausfüllbare Küchen-Checkliste mit S Pen. Kästchen können handschriftlich markiert werden. Das Textwerkzeug **T** ermöglicht Texteingaben.
- **Finger:** nach Erkennung des S Pen ein Finger = Radierer, zwei Finger = verschieben/zoomen. Wenn Handballenberührungen Probleme machen, bitte melden.
- **⋮ → Alle Seiten als PDF drucken:** im Druckdialog **Als PDF speichern** wählen. Für Weitergabe per E-Mail PDF als Anhang versenden.
- **⋮ → Projekt sichern (.json):** alle Seiten und komprimierten Fotos in einer bearbeitbaren Sicherungsdatei. Kann später wieder importiert werden.

## Speichern und Datensicherheit

- Änderungen werden nach kurzer Pause automatisch in IndexedDB gespeichert; bei ausstehenden Änderungen zusätzlich alle zwei Minuten.
- Beim Wechsel in den Hintergrund wird eine weitere Speicherung versucht. Android garantiert nicht, dass beim Schließen noch ausreichend Zeit bleibt. Deshalb ist die Speicherung nach jeder Änderung entscheidend.
- Bei einem Fehler steht **Speichern fehlgeschlagen** in der Statusanzeige. Nicht ohne Sicherung fortfahren.
- Für wichtige Aufmaße **regelmäßig JSON exportieren**, z. B. nach dem Kundentermin. Browserdaten löschen oder Geräteverlust kann lokale Projekte löschen.
- Bilder werden komprimiert. Bei Detailaufnahmen 4000 px wählen und wichtige Originalfotos separat behalten. Starke Vergrößerungen können trotz hoher Auflösung pixelig werden.

## Bekannte Einschränkungen dieses Teststands

- Fenster/Türen werden noch nicht automatisch in vorhandene Doppelwände eingeschnitten; sie sind separat positionierbare Symbole.
- Die Maßlinie wird durch numerische Abstandseingabe positioniert, noch nicht durch einen dritten Stiftzug.
- Der Radierer zeichnet derzeit weiße Striche über die Zeichnung, er entfernt noch keine Vektorobjekte.
- Die Fotoauswahl erlaubt Verschieben und numerisches Skalieren/Drehen, noch keine direkten Transformationsgriffe.
- Die PDF-Erstellung erfolgt über den Android-Druckdialog und muss auf dem Samsung-Tablet getestet werden.
- Eine Checkliste ist als handschriftliche Vorlagenseite umgesetzt; die Felder sind noch nicht als separate strukturierte Datensätze erfasst.
