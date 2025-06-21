# Backend Unit Tests

Diese README beschreibt die Unit Tests für das DHBW Raumplaner Backend.

## Übersicht

Das Backend verfügt über 3 Test-Suites mit insgesamt 23 Tests:

### 1. API Tests (`api.test.ts`)
- **5 Tests** für die API-Endpunkte
- Testet Login und Registration-Funktionalität
- Überprüft Fehlerbehandlung und Validierung
- Mock-Tests ohne echte Datenbankverbindung

### 2. Datenbank Tests (`db.test.ts`)
- **8 Tests** für die Datenbankfunktionen  
- Testet MongoDB CRUD-Operationen
- Überprüft Verbindungsmanagement
- Mock-Tests mit gemocktem MongoDB Client

### 3. Timetable API Tests (`timetable.test.ts`)
- **10 Tests** für die Timetable-Endpunkte
- Testet Räume, Lehrbeauftragte, Vorlesungen und Kurse
- Überprüft Fehlerbehandlung bei Datenbankfehlern
- Mock-Tests für API-Endpunkte

## Ausführung der Tests

### Mit Gulp (empfohlen)

```bash
# Alle Backend-Tests ausführen
npx gulp test-backend

# Tests im Watch-Modus (automatischer Neustart bei Änderungen)
npx gulp test-backend-watch

# Tests mit Coverage-Report
npx gulp test-backend-coverage

# Alle Tests (derzeit nur Backend)
npx gulp test
```

### Direkt mit npm

```bash
cd backend

# Alle Tests einmalig ausführen
npm test

# Tests im Watch-Modus
npm run test:watch
```

## Test-Konfiguration

### Jest Konfiguration
- **Framework**: Jest mit TypeScript Support
- **Test Environment**: Node.js
- **Coverage**: Aktiviert für alle src/ Dateien
- **Mocking**: Extensive Verwendung von Jest Mocks

### Konfigurationsdateien
- `jest.config.js` - Jest Hauptkonfiguration
- `src/__tests__/setup.ts` - Test Setup und globale Mocks

## Test-Struktur

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts           # Test Setup
│   │   ├── api.test.ts        # API Endpunkt Tests
│   │   ├── db.test.ts         # Datenbank Tests
│   │   └── timetable.test.ts  # Timetable API Tests
│   ├── model/
│   │   ├── db.ts              # Getestete Datenbankfunktionen
│   │   ├── timetable.ts       # Getestete Timetable Routes
│   │   └── interfaces.ts
│   └── index.ts               # Main Server File
├── jest.config.js             # Jest Konfiguration
└── package.json               # NPM Scripts
```

## Test-Details

### Mock-Strategien
- **MongoDB**: Vollständig gemockt für isolierte Tests
- **Express**: Lokale Express-Instanzen für API-Tests  
- **Environment**: Test-spezifische Umgebungsvariablen

### Assertions
- **HTTP Status Codes**: Überprüfung aller relevanten Status Codes
- **Response Bodies**: Validierung der JSON-Antworten
- **Database Calls**: Verifizierung der korrekten Funktionsaufrufe
- **Error Handling**: Tests für alle Fehlerzustände

## Coverage

Die Tests decken folgende Bereiche ab:
- ✅ Database CRUD Operations
- ✅ API Authentication (Login/Register)
- ✅ Timetable API Endpoints
- ✅ Error Handling
- ✅ Input Validation

## Continuous Integration

Die Tests können in CI/CD-Pipelines integriert werden:

```bash
# In CI/CD Pipeline
npm install
npm test
```

## Entwicklung

### Neue Tests hinzufügen

1. Test-Datei in `src/__tests__/` erstellen
2. Jest/Supertest für HTTP-Tests verwenden
3. Mocks für externe Dependencies erstellen
4. Test in der entsprechenden describe-Block gruppieren

### Best Practices

- **Isolation**: Jeder Test ist unabhängig
- **Mocking**: Externe Services werden gemockt
- **Descriptive Names**: Aussagekräftige Testnamen verwenden
- **Setup/Teardown**: beforeEach/afterEach für saubere Tests

## Troubleshooting

### Häufige Probleme

1. **Module Resolution**: Sicherstellen, dass Import-Pfade korrekt sind
2. **TypeScript**: Jest TypeScript-Konfiguration prüfen
3. **Mocks**: Sicherstellen, dass Mocks vor den Tests geladen werden

### Debugging

```bash
# Tests mit Debug-Output
npm test -- --verbose

# Einzelnen Test ausführen
npm test -- --testNamePattern="sollte erfolgreich einloggen"

# Coverage-Report anzeigen
npm test -- --coverage
```
