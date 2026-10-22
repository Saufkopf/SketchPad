# SketchPad 1.3.4 – Fenster- und Türdarstellung

Ausgangspunkt: die bestätigte funktionierende Version 1.3.3.

## Änderungen
- Fensterdetails anhand der Liniengeometrie der bereitgestellten DXF (Rahmen, drei Querlinien, Glasleisten, Fensterbank).
- Türdetails anhand der DXF (gestufte Laibung, Schwelle, Türblatt und Viertelkreisbogen).
- Positionierung auf beiden Wandseiten und Ziehrichtung bleiben erhalten.
- Wandwerkzeug und Wandanschlüsse wurden nicht verändert.
- Neues Offline-Cache-Kennzeichen.

## Test
Eine neue Wand zeichnen, auf beiden Seiten ein Fenster einsetzen, danach Türen in beide Richtungen ziehen. Die grünen CAD-Details sind auf die SketchPad-Wanddicke skaliert. Die geometrische Darstellung ist eine Anpassung der Vorlage, keine 1:1-CAD-Übernahme aller DXF-Elemente.

## Update
Alle Dateien ins GitHub-Repository hochladen, bestehende ersetzen und Commit bestätigen. Nach Veröffentlichung die App komplett schließen und neu starten. Alte Projekte vorher als JSON sichern.
