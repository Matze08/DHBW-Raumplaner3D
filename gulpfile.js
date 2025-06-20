const gulp = require('gulp');
const shell = require('gulp-shell');
const { deleteAsync } = require('del');
const path = require('path');

// Paths
const paths = {
  backend: {
    src: 'backend/src/**/*',
    dist: 'backend/dist',
    root: 'backend'
  },
  frontend: {
    src: 'frontend/**/*',
    dist: 'frontend/dist',
    root: 'frontend'
  },
  dist: 'dist'
};

// Clean task - removes all build artifacts
gulp.task('clean', function() {
  return deleteAsync([
    paths.backend.dist,
    paths.frontend.dist,
    paths.dist
  ]);
});

// Install dependencies for both backend and frontend
gulp.task('install-backend', shell.task([
  'cd backend && npm install'
]));

gulp.task('install-frontend', shell.task([
  'cd frontend && npm install'
]));

gulp.task('install-all', gulp.parallel('install-backend', 'install-frontend'));

// Build backend (TypeScript compilation)
gulp.task('build-backend', shell.task([
  'cd backend && npm run build'
], {
  verbose: true
}));

// Build frontend (Vite build)
gulp.task('build-frontend', shell.task([
  'cd frontend && npm run build'
], {
  verbose: true
}));

// Copy backend build to unified dist folder
gulp.task('copy-backend', function() {
  return gulp.src([
    'backend/dist/**/*',
    'backend/package.json'
  ], { base: 'backend' })
    .pipe(gulp.dest('dist/backend'));
});

// Copy frontend build to unified dist folder
gulp.task('copy-frontend', function() {
  return gulp.src('frontend/dist/**/*', { base: 'frontend/dist' })
    .pipe(gulp.dest('dist/frontend'));
});

// Copy static assets
gulp.task('copy-assets', function() {
  return gulp.src([
    'frontend/media/**/*',
    'backend/package.json'
  ], { base: '.' })
    .pipe(gulp.dest('dist'));
});

// Build both backend and frontend
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build-backend', 'build-frontend'),
  gulp.parallel('copy-backend', 'copy-frontend', 'copy-assets')
));

// Development task - runs both backend and frontend in development mode
gulp.task('dev-backend', shell.task([
  'cd backend && npm run dev'
], {
  verbose: true
}));

gulp.task('dev-frontend', shell.task([
  'cd frontend && npm run dev'
], {
  verbose: true
}));

// Run both in development mode (parallel)
gulp.task('dev', gulp.parallel('dev-backend', 'dev-frontend'));

// Watch for changes and rebuild
gulp.task('watch-backend', function() {
  return gulp.watch(paths.backend.src, gulp.series('build-backend', 'copy-backend'));
});

gulp.task('watch-frontend', function() {
  return gulp.watch(paths.frontend.src, gulp.series('build-frontend', 'copy-frontend'));
});

gulp.task('watch', gulp.parallel('watch-backend', 'watch-frontend'));

// Production build task
gulp.task('build-prod', gulp.series('build'));

// Start production servers
gulp.task('start-backend', shell.task([
  'cd dist/backend && node index.js'
]));

gulp.task('start-frontend', shell.task([
  'cd frontend && npm run preview'
]));

gulp.task('start', gulp.parallel('start-backend', 'start-frontend'));

// Default task
gulp.task('default', gulp.series('build'));

// Help task to show available commands
gulp.task('help', function(done) {
  console.log('');
  console.log('Available Gulp tasks:');
  console.log('');
  console.log('  build        - Build both frontend and backend for production');
  console.log('  dev          - Start both frontend and backend in development mode');
  console.log('  clean        - Remove all build artifacts');
  console.log('  install-all  - Install dependencies for both frontend and backend');
  console.log('  watch        - Watch for changes and rebuild automatically');
  console.log('  start        - Start production servers');
  console.log('  help         - Show this help message');
  console.log('');
  done();
});
