# Frontend Testing Setup

This document describes the frontend unit testing setup that has been added to the DHBW-Raumplaner3D project.

## Testing Framework

The frontend uses **Vitest** for unit testing, which is the recommended testing framework for Vite-based projects.

## Test Dependencies

The following testing dependencies have been added to `frontend/package.json`:

- `vitest`: Main testing framework
- `@vitest/coverage-v8`: Code coverage reporting
- `jsdom`: DOM environment for testing browser-like functionality

## Test Structure

Tests are located in the `frontend/test/` directory:

```
frontend/test/
├── setup.js              # Test setup and global mocks
├── login.test.js          # Tests for login functionality
└── passwordUtils.test.js  # Tests for password utility functions
```

## Test Scripts

The following npm scripts are available for frontend testing:

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Gulp Integration

Frontend tests have been integrated into the existing Gulp build process:

### New Gulp Tasks

- `gulp test-frontend` - Run frontend tests once
- `gulp test-frontend-watch` - Run frontend tests in watch mode  
- `gulp test-frontend-coverage` - Run frontend tests with coverage
- `gulp test` - Run both backend and frontend tests

### Updated Build Tasks

- `gulp build-with-tests` - Build with tests first (recommended for production)
- `gulp build-safe` - Build then test (safe deployment)
- `gulp ci-build` - Comprehensive CI/CD build with coverage

## Test Coverage

The tests cover two main modules:

### 1. Password Utilities (`passwordUtils.js`)
- SHA-256 password hashing functionality
- Salt combination with email
- Edge cases (empty passwords, different salts)
- Error handling

### 2. Login Functionality (`login.js`)  
- Automatic logout on page load
- Login form submission with validation
- API error handling
- Network error handling
- Email trimming
- LocalStorage interactions

## Running Tests

To run just the frontend tests:

```bash
cd frontend
npm test
```

To run all tests (backend + frontend) via Gulp:

```bash
npx gulp test
```

To build with tests included:

```bash
npx gulp build-with-tests
```

## Test Configuration

The Vitest configuration is in `frontend/vitest.config.js` and includes:

- JSdom environment for browser APIs
- Global test utilities
- Coverage reporting configuration
- Test setup file for mocking

## Mocking Strategy

The test setup includes mocks for:

- `crypto.subtle` API for password hashing
- `localStorage` for session management
- `fetch` API for network requests
- `window.location` for navigation
- `alert` and console functions

This ensures tests run reliably without external dependencies.
