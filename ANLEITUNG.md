# SketchPad 1.3.9 – Wandecken und zoomabhängige Maßzahlen

- Wandecken: Miter-Schnittpunkte der versetzten Wandkante werden pro Wandsegment bestimmt; doppelt gezeichnete Verbindungsstücke entfernt. Bei extrem spitzen Winkeln bleibt eine kurze abgeschrägte Verbindung.
- Fenster und Türen unverändert.
- Maßzahlen stehen fast direkt an der Maßlinie.
- Maßzahlgröße beim Erstellen: bis 183 % wie bisher; darüber proportional kleiner (z. B. bei 366 % halb so groß). Bereits gespeicherte Maßzahlen behalten ihre alte Größe.
- Zoom bis 1500 % per Mausrad oder Zwei-Finger-Geste.

## Test
1. Zuerst vorhandene Projekte als JSON sichern.
2. ZIP entpacken und die enthaltenen Dateien im GitHub-Repository ersetzen, Commit bestätigen.
3. App schließen und neu öffnen; Kopfzeile muss 1.3.9 zeigen.
4. Auf einer neuen Seite Wände mit Links- und Rechtsknicken zeichnen und Bemaßung bei 183 %, 400 % und 1000 % vergleichen.

Hinweis: Syntax und Paket wurden geprüft, aber kein Praxistest auf dem Samsung-Tablet durchgeführt.
