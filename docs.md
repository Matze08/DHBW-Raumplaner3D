# Dokumentation
## First tasks
DHBW Wayfinder & Booking Solution GmbH
Name der App: DHBW Wayfinder & Booking

### Marktlage
MazeMap ist eine ähnliche App, welche bereits auf dem Markt ist. Auch in Apple Maps ist solch eine Funktion bereits integriert, z.B. für Flughäfen.   
Bei beiden Apps wird jedoch eine Top-Down 2D-Ansicht verwendet. Das Alleinstellungsmerkmal unserer App ist, dass wir eine 3D-Ansicht bieten werden mit interaktiver Navigation.

### Warum machen wir das?
Besonders Erstsemester fühlen sich innerhalb der auf jeder Etage gleichaussehenden Neubau der DHBW Fakultät Technik oft orientierungslos. Um diesen Studenten zu helfen
und auch die Raumplanung für die Lehrkräfte zu vereinfachen.

### Interne und externe Stakeholder / Wer nimmt an den aktuellen Prozessen teil?
| Stakeholder | Art | Beschreibung |
|--|--|--|
|Dozenten|extern|Einfachere Raumplanung, Sicherheit bei der Planung|
|Erstsemester|extern|Raumsuche vereinfachen, Orientierungslosigkeit vermeiden|
|andere Studenten|intern|Raumsuche vereinfachen, Verspätungen zu Vorlesungen verhindern|

### Aktuelle Prozesse / Stand der Technik
Momentan wird für die Raumplanung die Software Rapla verwendet. Diese gewährleistet jedoch ausschließlich die Planung der Räume, nicht die Auffindung, da hier nur der 
Raumname angezeigt wird. Daher muss der Student, um einen Raum zu finden, eine Karte des Gebäudes verwenden, was aufgrund mehrerer Etagen eine Weile dauern kann.

### Ziele des Projekts 
Mithilfe unserer App soll die Raumplanung und die Raumsuche in ein Paket gebündelt werden und beides deutlich vereinfacht werden. Dabei soll man mit Hilfe der Raumsuche, den direkt Weg zu einem Raum finden. Dafür gibt man den gesuchten Raum und den aktuellen Standort ein. Daraufhin wird eine Sequenz abgespielt, die den kürzesten Weg zum gesuchten Raum anzeigt. Die Raumplanung ist über einen Admin-Zugang erreichbar. Mithilfe der Raumplanung, können digitale Räume erstellt, gelöscht und bearbeitet werden. Außerdem können die Räume für Vorlesungen gebucht und storniert werden.

Spätere Entwicklungsmöglichkeiten könnten eine automatische Standorterfassung, Inventarlisten für Räumen und eine Einbindung des Vorlesungsplans sein.

### Messung des Erfolgs
Der Erfolg wird daran gemessen, ob die Webanwendung effizienter und übersichtlicher ist als die bereits existierende Software Rapla. Außerdem sollen möglichst viele Studenten das Projekt tatsächlich nutzen, um ihre Räume zu finden. verwenden 20% der Erstsemester-Studierenden die Raum-Suche-Funktion, ist unser Projekt erfolgreich.

## Anforderungsanalyse
### Funktionale Anforderungen
    - Webserver zum Hosten der Webseite mittels node.js
    - Datenbank zur Verwaltung der digitalen Räume
    - Räume können erstellt, bearbeitet und gelöscht werden
    - Räume enthalten Informationen über die gebuchten Vorlesungen (Zeitpunkt, Dozent, Kurs, Vorlesungsname)
    - Login-Panel für Admins, um zur Raumplanung zu gelangen
    - Datenbank zur Verwaltung der Zugriffsrechte
    - Wegsuche von ausgewähltem Standort zu gesuchten Raum
    - Drop-Down Menü zum auswählen des Standorts (Eingang unten, Eingang oben, Eingang Cafeteria)
### Nicht-Funktionale Anforderungen
    - 3D/2D Ansicht des Gebäudes
    - Kameraführung durch 3D Gebäude zu gesuchtem Raum
    - Räume sich eingefärbt, passend zum Buchungsstatus (frei = grün, rot = belegt)
### Optinale Anforderungen
    - Optimierung für mobile Endgeräte
    - Filtermöglichkeiten bei Raum-Suche (Weg nur über Treppe, etc.)
    - Vorlesungsplan für Kurse auf Sub-Seite
    - automatische Standorterfassung
    - Virtuelle Quests