# DHBW Raumplaner 3D - Build Instructions

This project uses Gulp to manage the build process for both frontend and backend components.

## Quick Start

### 1. Install Dependencies
```bash
npm install
npm run install-all
```

### 2. Build Everything (Production)
```bash
npm run build
# or
gulp build
```

### 3. Development Mode
```bash
npm run dev
# or
gulp dev
```

## Available Commands

| Command | Description |
|---------|-------------|
| `gulp build` | Build both frontend and backend for production |
| `gulp dev` | Start both frontend and backend in development mode |
| `gulp clean` | Remove all build artifacts |
| `gulp install-all` | Install dependencies for both projects |
| `gulp watch` | Watch for changes and rebuild automatically |
| `gulp start` | Start production servers |
| `gulp help` | Show available commands |

## Project Structure After Build

```
dist/
├── backend/          # Built backend files
│   ├── index.js      # Main server file
│   ├── model/        # Database models
│   └── package.json  # Backend dependencies
└── frontend/         # Built frontend files
    ├── assets/       # Static assets
    └── index.html    # Main HTML file
```

## Development Workflow

1. **First time setup:**
   ```bash
   npm install
   npm run install-all
   ```

2. **Development:**
   ```bash
   gulp dev
   ```
   This starts both:
   - Backend server on http://localhost:3001
   - Frontend dev server on http://localhost:3000

3. **Production build:**
   ```bash
   gulp build
   ```

4. **Start production servers:**
   ```bash
   gulp start
   ```

## Build Process Details

### Backend Build
- Compiles TypeScript files from `backend/src/` to `backend/dist/`
- Copies the built files to `dist/backend/`

### Frontend Build
- Uses Vite to build the frontend from `frontend/`
- Bundles and optimizes JavaScript, CSS, and assets
- Copies the built files to `dist/frontend/`

## Environment Variables

Make sure to set up your environment variables:

### Backend (.env in backend/)
```
MONGODB_URI=mongodb://localhost:27017/dhbw-raumplaner
PORT=3001
```

### Frontend
The frontend is configured to connect to the backend at `http://localhost:3001`

## Troubleshooting

### Port Conflicts
- Backend runs on port 3001
- Frontend dev server runs on port 3000
- Make sure these ports are available

### Build Errors
Run `gulp clean` and then `gulp build` to clean and rebuild everything.

### Dependencies Issues
Run `npm run install-all` to reinstall all dependencies.
