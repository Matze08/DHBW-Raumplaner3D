## Model
Umsetzung mit MongoDB (dokumentenbasierte Datenbank)

### Entities
#### Raum
- ID (PK)
- Bezeichnung (womit im Frontend zum Raum geroutet werden kann)

#### Buchung
- ID (PK)
- Raum (FK)
- Lehrbeauftragter (FK)
- Vorlesung (FK)
- Kurs (FK)
- ZeitStart
- ZeitEnde

(Wiederholende Buchungen (zB regelmäßige Vorlesungen innerhalb eines Semesters) sollen durch Backend-Logik abgewickelt werden.)

#### Lehrbeauftragter
- ID (PK)
- Vorname
- Nachname
- Firma
- Mail

#### Vorlesung
- ID (PK)
- Bezeichnung

#### Kurs
- ID (PK)
- Bezeichnung
- Fakultät

#### Admin
- ID (PK)
- Nutzername
- Passwort