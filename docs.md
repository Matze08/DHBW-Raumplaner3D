### Inhaltsverzeichnis

1. [Projektbeschreibung](https://github.com/Matze08/DHBW-Raumplaner3D/main/docs.md#Projektbeschreibung)
2. [Architektur](https://github.com/Matze08/DHBW-Raumplaner3D/main/docs.md#Architektur)

# Projektbeschreibung
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
### Optionale Anforderungen
    - Optimierung für mobile Endgeräte
    - Filtermöglichkeiten bei Raum-Suche (Weg nur über Treppe, etc.)
    - Vorlesungsplan für Kurse auf Sub-Seite
    - automatische Standorterfassung
    - Virtuelle Quests

# Architektur
## Lösungsbeschreibung

### 1. Wie ist das System strukturiert und aufgebaut?
Das System ist als Webanwendung mit einem Express.js-Backend und einer Three.js-basierten 3D-Visualisierung im Frontend aufgebaut. Die Architektur folgt dem Client-Server-Modell. Das Frontend übernimmt die Benutzerinteraktion, Visualisierung der Räume und Navigation, während das Backend die Geschäftslogik, Datenhaltung und Authentifizierung verwaltet. Die Kommunikation zwischen Frontend und Backend erfolgt über REST-APIs.

### 2. Welche Schnittstellen und Rahmenbedingungen gibt es?
Es existiert eine REST-API, über die das Frontend Raumdaten, Buchungen und Benutzerinformationen vom Server abruft oder sendet. Die Authentifizierung der Admins erfolgt über ein Login-Panel mit abgesicherter Sitzungsverwaltung. Die Datenbank-Schnittstelle verwaltet digitale Räume und Zugriffsrechte. Die Anwendung muss DSGVO-konform sein, insbesondere im Umgang mit Benutzer- und Standortdaten.

### 3. Welche Anwendungen und Daten werden benötigt?
Benötigt werden eine Webanwendung für die Nutzer (z. B. Studierende) und eine Verwaltungsoberfläche für Admins. Daten, die verwaltet werden, umfassen Raumobjekte, Buchungsinformationen (Dozent, Zeit, Kurs), Benutzerrollen, Zugriffsrechte sowie Standortdaten. Optional können Kurspläne und Quest-Daten gespeichert werden.

### 4. Wie wird die Infrastruktur aussehen?
Die Anwendung wird über einen Node.js-Webserver gehostet. Das System kann lokal oder cloudbasiert (z. B. über Render, Heroku oder AWS) betrieben werden. Die Datenbank läuft parallel (z. B. MongoDB oder PostgreSQL). Bei Bedarf kann Docker zur Containerisierung verwendet werden. Für Entwicklungs- und Testzwecke kann ein CI/CD-Workflow integriert werden.

### 5. Welche Standards werden gesetzt?
Es gelten Codekonventionen nach ESLint/Prettier im JavaScript-Code. Für die API gelten REST-Prinzipien mit konsistenter Namensgebung und Fehlerbehandlung. Sicherheitsstandards umfassen HTTPS, gesicherte Login-Sessions und Schutz gegen gängige Angriffe (z. B. XSS, CSRF). Für die 3D-Visualisierung wird einheitliches Objekt-Handling mit Three.js durchgesetzt.

### 6. Wie werden die Qualitätsanforderungen erreicht?
Die Qualität wird durch Unit- und Integrationstests im Backend sowie manuelles Testing der 3D-Oberfläche sichergestellt. Code-Reviews und strukturierte Entwicklungsprozesse gewährleisten sauberen und wartbaren Code. Die Anwendung wird auf Performance und Usability getestet, besonders im Hinblick auf die 3D-Darstellung und mobile Optimierung. Bei Bedarf kann Monitoring über einfache Logging-Lösungen implementiert werden.
