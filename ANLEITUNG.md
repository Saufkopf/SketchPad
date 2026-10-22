# SketchPad 1.4.0 – Testversion

Änderungen gegenüber 1.3.9:
- Zoomlimit auf 2000 % erweitert (Mausrad und Zwei-Finger-Geste).
- Maßlinien, Maßhilfslinien, Überstände und Schrägstriche skalieren beim Erstellen mit dem aktuellen Zoom, ebenso wie bisher die Maßzahl. Vorhandene Maße bleiben unverändert.
- Schnellwahl für Stiftstärke 1, 2, 3, 4, 5; der Feinregler bleibt erhalten.
- Verbindungslinien an Wandknicken mit runden Enden, um sichtbare Pixel-Lücken bei starkem Zoom zu vermindern.
- Fenster- und Türwerkzeuge unverändert.

## Installation
1. Bestehende Projekte als JSON sichern.
2. ZIP entpacken, alle sieben Dateien in GitHub hochladen und vorhandene Dateien ersetzen.
3. Commit changes bestätigen und die Veröffentlichung von GitHub Pages abwarten.
4. App vollständig schließen und erneut starten. Oben muss SketchPad 1.4.0 stehen.

## Test
Neue Bemaßungen bei 183 %, 500 % und 1500 % anlegen. Strichstärken und Maßendzeichen vergleichen. Bereits angelegte Maße ändern sich nicht rückwirkend. Wandknicke bei 1500–2000 % prüfen.

Hinweis: Der Wandecken-Fix ist eine Darstellungsverbesserung, keine vollständig neue Wandgeometrie. Falls die Ecken weiter offen bleiben, ist ein weiterer geometrischer Umbau nötig.
