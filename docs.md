# Projektdokumentation
### Inhaltsverzeichnis

1. [Business Case](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Business-Case)
2. [Architektur](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Architektur)
3. [Implementierung](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Implementierung)
4. [Testkonzept](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Testkonzept)
5. [Work-Breakdown-Structure](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Work-Breakdown-Structure)
6. [Rollenverteilung](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Projektrollen-und-Phasen)
7. [Stakeholder](https://github.com/Matze08/DHBW-Raumplaner3D/blob/main/docs.md#Stakeholder)

DHBW Wayfinder & Booking Solution GmbH
Name der App: DHBW Wayfinder & Booking

## Business Case

### Marktlage
MazeMap ist eine ähnliche App, welche bereits auf dem Markt ist. Auch in Apple Maps ist solch eine Funktion bereits integriert, z.B. für Flughäfen.   
Bei beiden Apps wird jedoch eine Top-Down 2D-Ansicht verwendet. Das Alleinstellungsmerkmal unserer App ist, dass wir eine 3D-Ansicht bieten werden mit interaktiver Navigation.

### Warum machen wir das?
Besonders Erstsemester fühlen sich innerhalb der auf jeder Etage gleichaussehenden Neubau der DHBW Fakultät Technik oft orientierungslos. Um diesen Studenten zu helfen
und auch die Raumplanung für die Lehrkräfte zu vereinfachen.

### Interne und externe Stakeholder / Wer nimmt an den aktuellen Prozessen teil?
| Stakeholder | Art | Beschreibung |
|--|--|--|
|Sekretariat|extern|Einfachere und übersichtlichere Verwaltung der Räume|
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

## Architektur

### 1. Wie ist das System strukturiert und aufgebaut?
Das System ist als Webanwendung mit einem Express.js-Backend und einer Three.js-basierten 3D-Visualisierung im Frontend aufgebaut. Die Architektur folgt dem Client-Server-Modell. Das Frontend übernimmt die Benutzerinteraktion, Visualisierung der Räume und Navigation, während das Backend die Geschäftslogik, Datenhaltung und Authentifizierung verwaltet. Die Kommunikation zwischen Frontend und Backend erfolgt über REST-APIs.

### 2. Welche Schnittstellen und Rahmenbedingungen gibt es?
Es existiert eine REST-API, über die das Frontend Raumdaten, Buchungen und Benutzerinformationen vom Server abruft oder sendet. Die Authentifizierung der Admins erfolgt über ein Login-Panel mit abgesicherter Sitzungsverwaltung. Die Datenbank-Schnittstelle verwaltet digitale Räume und Zugriffsrechte. Die Anwendung muss DSGVO-konform sein, insbesondere im Umgang mit Benutzer- und Standortdaten.

### 3. Welche Anwendungen und Daten werden benötigt?
Benötigt werden eine Webanwendung für die Nutzer (z. B. Studierende) und eine Verwaltungsoberfläche für Admins. Daten, die verwaltet werden, umfassen Raumobjekte, Buchungsinformationen (Dozent, Zeit, Kurs), Benutzerrollen, Zugriffsrechte sowie Standortdaten. Optional können Kurspläne und Quest-Daten gespeichert werden.

### 4. Wie wird die Infrastruktur aussehen?
Das Backend wird über einen Node.js-Webserver gehostet. Das System kann lokal oder cloudbasiert (z. B. AWS) betrieben werden. Die Datenbank läuft parallel (MongoDB).

### 5. Welche Standards werden gesetzt?
Es gelten Codekonventionen nach ESLint/Prettier im JavaScript-Code. Für die API gelten REST-Prinzipien mit konsistenter Namensgebung und Fehlerbehandlung. Sicherheitsstandards umfassen HTTPS, gesicherte Login-Sessions und Schutz gegen gängige Angriffe (z. B. XSS, CSRF). Für die 3D-Visualisierung wird einheitliches Objekt-Handling mit Three.js durchgesetzt.

### 6. Wie werden die Qualitätsanforderungen erreicht?
Die Qualität wird durch Unit- und Integrationstests im Backend sowie manuelles Testing der 3D-Oberfläche sichergestellt. Code-Reviews und strukturierte Entwicklungsprozesse gewährleisten sauberen und wartbaren Code. Die Anwendung wird auf Performance und Usability getestet, besonders im Hinblick auf die 3D-Darstellung und mobile Optimierung. Bei Bedarf kann Monitoring über einfache Logging-Lösungen implementiert werden.

### Softwareversionen
| Software | Version |
|--|--|
|MongoDB|8.0.9|
|NodeJS|20.17.0|
|ThreeJS|0.165.0|

## Implementierung

### 1. Welche Produkte und Komponenten (von welchen Herstellern) werden für das System benötigt?
*Version hinzufügen!*     
Für die Umsetzung wird Node.js (OpenJS Foundation) als Webserver verwendet. Das Backend basiert auf Express.js. MongoDB dient als Datenbanklösung. Für die 3D-Darstellung kommt Three.js zum Einsatz. Die Benutzeroberfläche wird mit HTML, CSS und JavaScript umgesetzt. Optional werden Tools wie Docker (Docker Inc.), GitHub (Microsoft) für Versionskontrolle und Render oder Heroku für das Hosting genutzt.

### 2. Wie wird das System entwickelt und ausgerollt?
Die Entwicklung erfolgt iterativ in kleinen Sprints. GitHub wird zur Quellcodeverwaltung und Kollaboration genutzt. Lokale Entwicklung erfolgt mit Node.js-Umgebung, während Tests und Deployment über eine CI/CD-Pipeline automatisiert werden. Das finale System wird auf einer Cloud-Plattform ausgerollt durch eine andere Abteilung (wer?) und dort öffentlich zugänglich gemacht.

### 3. Welche Verifikationsmethoden werden verwendet?
Die Funktionalität wird durch Unit- und Integrationstests im Backend überprüft. Zusätzlich erfolgen manuelle Tests im Frontend zur Prüfung der 3D-Visualisierung und Benutzerinteraktionen. Einfache Testnutzer-Szenarien und End-to-End-Tests validieren das System aus Sicht der Zielgruppe. Bei kritischen Komponenten wird eine Peer Review des Codes durchgeführt.

### 4. Wie wird die Lösung betrieben?
Nach dem Deployment läuft das System dauerhaft auf einem Cloud-Server (z. B. Render). Der Betrieb umfasst die Überwachung der Serververfügbarkeit, regelmäßige Backups der Datenbank und gelegentliche Wartung. Fehler und Nutzungsverhalten werden über einfache Logging-Lösungen analysiert. Updates werden automatisiert über die CI/CD-Pipeline eingespielt.

### 5. Wer zahlt was?
Im Rahmen eines studentischen Projekts werden vorrangig kostenlose Tools und Dienste genutzt (z. B. GitHub Free, MongoDB Atlas Free Tier). Sollten kostenpflichtige Dienste notwendig sein (z. B. Custom Domain, höherer Serverbedarf), werden diese entweder vom Projektteam privat getragen oder über Fördermittel/Institution finanziert.

## Testkonzept

### Welche Tests sollten geplant werden?  
Für die Webanwendung werden folgende Testarten vorgesehen:

- **Funktionale Tests**: Überprüfung der Kernfunktionen wie Raum-Suche, Raumplanung, Login und Navigation.
- **Usability-Tests**: Testen der Benutzerfreundlichkeit, insbesondere der 3D-Navigation für Erstsemester.
- **Kompatibilitätstests**: Sicherstellen der Funktion auf verschiedenen Geräten (Desktop, Tablet, Smartphone) und Browsern.
- **Sicherheitstests**: Überprüfung der Authentifizierung (Admin-Login), Rechteverwaltung und Schutz gegen gängige Angriffe (XSS, CSRF).
- **Leistungstests**: Prüfung der Ladezeiten der 3D-Ansicht und der Reaktionszeit bei Suchanfragen.
- **Regressionstests**: Nach Änderungen wird getestet, ob bestehende Funktionen weiterhin korrekt arbeiten.

### Wann werden die Tests durchgeführt?  
Die Tests werden iterativ in jeder Entwicklungsphase durchgeführt:

- **Unit-Tests** während der Entwicklung einzelner Module (z. B. API-Endpunkte).
- **Integrationstests** nach Fertigstellung von Teilsystemen (z. B. Datenbankanbindung mit 3D-Ansicht).
- **Systemtests** vor jedem Release, um das Gesamtsystem zu prüfen.
- **Abschließende Akzeptanztests** vor Projektabgabe, mit Fokus auf realistische Nutzungsszenarien.

---

## 1. Funktionaler Testfall: Raum-Suche

### Testziel  
Es soll überprüft werden, ob die Raum-Suche korrekt funktioniert und der richtige Navigationspfad angezeigt wird.

### Testschritte  
1. Aufruf der Startseite.  
2. Auswahl des aktuellen Standorts über das Dropdown-Menü (z. B. *Eingang Cafeteria*).  
3. Eingabe eines existierenden Raums in das Suchfeld (z. B. *Raum B3.12*).  
4. Klick auf „Suche starten“.  
5. Beobachtung der folgenden Navigation (3D-Kamerafahrt).  

### Eingabedaten  
- Startpunkt: *Eingang Cafeteria*  
- Zielraum: *B3.12*  

### Erwartete Ausgabe  
- Die 3D-Ansicht zoomt in das Gebäude hinein.  
- Eine animierte Kamerafahrt zeigt den direkten Weg vom Standort zum Raum B3.12.  
- Der Zielraum wird grün (frei) oder rot (belegt) eingefärbt angezeigt.  
- Raumdaten wie Kurs, Dozent und Uhrzeit werden eingeblendet.

## 2. Funktionaler Testfall: Raumplanung (Admin-Zugang)

### Testziel  
Überprüfung, ob ein Admin erfolgreich einen neuen Raum erstellen, bearbeiten und löschen kann.

### Testschritte  
1. Aufruf der Login-Seite.  
2. Eingabe gültiger Admin-Zugangsdaten (z. B. *admin@dhbw.de*, *passwort123*).  
3. Klick auf „Login“.  
4. Navigation zum Raumplanungspanel.  
5. Klick auf „Raum erstellen“.  
6. Eingabe der Raumdaten (Raumname, Etage, Kapazität).  
7. Speichern des Raums.  
8. Auswahl des neu erstellten Raums.  
9. Änderung der Kapazität.  
10. Speichern der Änderungen.  
11. Löschen des Raums.  

### Eingabedaten  
- Admin-Login: `admin@dhbw.de`, `passwort123`  
- Neuer Raum: `B4.10`, Etage: `4`, Kapazität: `30`  
- Neue Kapazität: `40`  

### Erwartete Ausgabe  
- Admin wird erfolgreich eingeloggt.  
- Raum `B4.10` wird erstellt und in der Übersicht angezeigt.  
- Nach Bearbeitung zeigt der Raum `B4.10` die Kapazität `40`.  
- Nach dem Löschen ist der Raum nicht mehr in der Liste sichtbar.

## Work Breakdown Structure

1. **Anforderungsanalyse**
    1.1. Funktionsbeschreibung Raum-Suche  
    1.2. Zieldefinition für Navigation  
    1.3. Erfassung der Nutzereingaben (Standort & Zielraum)  

2. **Backend-Entwicklung (Express.js)**
    2.1. API-Endpunkt zur Raumabfrage  
    2.2. API-Endpunkt zur Wegberechnung  
    2.3. Anbindung an MongoDB (Räume, Buchungsstatus)  

3. **Frontend-Entwicklung**
    3.1. Formular zur Eingabe von Start- & Zielraum  
    3.2. Anzeige der Navigationsergebnisse  
    3.3. Integration der 3D-Komponente (Three.js)  

4. **3D-Visualisierung (Three.js)**
    4.1. Modellierung der Gebäude-Etagen  
    4.2. Logik zur Kamerafahrt (Pfadanimation)  
    4.3. Einfärbung von Räumen nach Buchungsstatus  

5. **Testing & Validierung**
    5.1. Funktionaler Test Raum-Suche  
    5.2. Test der Pfadberechnung und -anzeige  
    5.3. Usability-Test mit Studierenden  

6. **Deployment & Betrieb**
    6.1. Hosten der Anwendung (z. B. via Render/Heroku)  
    6.2. Monitoring & Fehlertracking  
    6.3. Dokumentation für Admins & User

## Projektrollen und Phasen

### Rollen im Projektteam

- **Matze – Frontend Developer**  
  Verantwortlich für die Gestaltung und Entwicklung der Benutzeroberfläche, inklusive 3D-Navigation mit Three.js, responsives Design und Usability.

- **Michael – Backend Developer & Dokumentation**  
  Zuständig für die API-Entwicklung mit Express.js, Datenbankanbindung (MongoDB), Rechteverwaltung und technische Dokumentation des Projekts.

### Projektphasen

1. **Planung & Anforderungsanalyse**  
   Gemeinsame Erfassung der funktionalen und nicht-funktionalen Anforderungen. Definition des Funktionsumfangs und der Zielgruppe.

2. **Architekturdesign**  
   Aufteilung der Systemstruktur in Frontend, Backend und Datenbank. Festlegung der Technologien und Schnittstellen.

3. **Implementierung**  
   - Matze: Entwicklung der Benutzeroberfläche und 3D-Visualisierung.  
   - Michael: Aufbau der API, Datenbankmodelle und Sicherheitslogik.  
   Parallel erfolgt die Erstellung der Architekturdokumentation.

4. **Testphase**  
   Gemeinsames Testen der Anwendung (funktional, technisch und usability-basiert). Identifikation und Behebung von Fehlern.

5. **Deployment**  
   Veröffentlichung der Webanwendung auf einem geeigneten Webserver. Finaler Test im Live-System.

6. **Abschluss & Abgabe**  
   Fertigstellung der Dokumentation, Projektpräsentation und Übergabe des Projekts.

## Stakeholder

| Stakeholder       | Einfluss | Interesse | Kategorie            | Einbindung                          |
|-------------------|----------|-----------|-----------------------|-------------------------------------|
| Dozenten          | Hoch     | Hoch      | Schlüsselakteur       | Eng einbinden, regelmäßig Feedback  |
| Erstsemester      | Niedrig  | Hoch      | Benutzer              | Beobachten, Usability-Tests         |
| IT-Verwaltung     | Hoch     | Mittel    | Sponsor/Technikgeber  | Konsultieren, technische Anforderungen klären |
| DHBW-Leitung      | Hoch     | Mittel    | Entscheidungsträger   | Informieren, Fortschritt berichten  |
| Projektteam (Matze, Michael) | Hoch | Hoch | Entwicklungsteam      | Voll eingebunden                    |

### Einbindungsstrategie

- **Schlüsselakteure (Dozenten)**: In Review-Meetings einbinden, direkte Anforderungen einholen.
- **Benutzer (Studierende)**: In Testszenarien einbinden, intuitive Bedienbarkeit sicherstellen.
- **IT-Verwaltung**: Abstimmung bei Hosting, Datenzugriff und Infrastruktur.
- **DHBW-Leitung**: Projektziele und Nutzen kommunizieren, z. B. durch Pitch oder Bericht.
