# DHBW Raumplaner - Stundenplan Funktion

Diese Erweiterung des DHBW Raumplaners ermöglicht die Anzeige aller Buchungen in einem übersichtlichen Stundenplan-Format.

## Funktionen

- Anzeige aller Buchungen in einem Wochenplan (Montag bis Freitag)
- Filterung nach Raum, Kurs, Dozent, Vorlesung und Datum
- Detailansicht für jede Buchung durch Klick auf den Eintrag
- Responsives Design für verschiedene Bildschirmgrößen

## Verwendung

1. Öffnen Sie die Stundenplan-Ansicht durch Klick auf "Stundenplan" in der Navigationsleiste
2. Verwenden Sie die Filter auf der linken Seite, um die Anzeige anzupassen
3. Klicken Sie auf einen Buchungseintrag, um weitere Details anzuzeigen

## Technische Details

### Frontend

Die Stundenplan-Ansicht verwendet:
- Vanilla JavaScript für die Darstellung und Interaktion
- CSS Grid und Flexbox für das Layout
- REST-API-Aufrufe für die Kommunikation mit dem Backend

### Backend

Die API-Endpunkte für den Stundenplan:

- `GET /api/rooms` - Liste aller verfügbaren Räume
- `GET /api/lecturers` - Liste aller Dozenten
- `GET /api/lectures` - Liste aller Vorlesungen
- `GET /api/courses` - Liste aller Kurse
- `GET /api/bookings` - Liste aller Buchungen
- `GET /api/bookings/:id` - Details zu einer bestimmten Buchung
- `POST /api/bookings/filter` - Gefilterte Liste von Buchungen basierend auf übergebenen Kriterien

### Datenmodell

Die Anwendung verwendet MongoDB mit folgendem Datenmodell:

- **Raum**: ID, Bezeichnung
- **Buchung**: ID, Raum (FK), Lehrbeauftragter (FK), Vorlesung (FK), Kurs (FK), ZeitStart, ZeitEnde
- **Lehrbeauftragter**: ID, Vorname, Nachname, Firma, Mail
- **Vorlesung**: ID, Bezeichnung
- **Kurs**: ID, Bezeichnung, Fakultät
