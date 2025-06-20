const gulp = require('gulp');
const shell = require("gulp-shell");
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
gulp.task("clean", async function () {
  const { deleteAsync } = await import("del");
  return deleteAsync([paths.backend.dist, paths.frontend.dist, paths.dist]);
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

// Test tasks (defined early so build tasks can reference them)
gulp.task('test-backend', shell.task([
  'cd backend && npm test'
], {
  verbose: true
}));

gulp.task('test-backend-watch', shell.task([
  'cd backend && npm run test:watch'
], {
  verbose: true
}));

gulp.task('test-backend-coverage', shell.task([
  'cd backend && npm test -- --coverage'
], {
  verbose: true
}));

gulp.task(
  "test-frontend",
  shell.task(["cd frontend && npm test"], {
    verbose: true,
  })
);

gulp.task(
  "test-frontend-watch",
  shell.task(["cd frontend && npm run test:watch"], {
    verbose: true,
  })
);

gulp.task(
  "test-frontend-coverage",
  shell.task(["cd frontend && npm run test:coverage"], {
    verbose: true,
  })
);

// Test all
gulp.task("test", gulp.series("test-backend", "test-frontend"));

// Build both backend and frontend (without tests - fast for development)
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build-backend', 'build-frontend'),
  gulp.parallel('copy-backend', 'copy-frontend', 'copy-assets')
));

// Build with tests (recommended for production/CI)
gulp.task(
  "build-with-tests",
  gulp.series(
    "clean",
    gulp.parallel("test-backend", "test-frontend"), // Run tests first
    gulp.parallel("build-backend", "build-frontend"),
    gulp.parallel("copy-backend", "copy-frontend", "copy-assets")
  )
);

// Safe build - tests after build but before deployment
gulp.task(
  "build-safe",
  gulp.series(
    "clean",
    gulp.parallel("build-backend", "build-frontend"),
    gulp.parallel("test-backend", "test-frontend"), // Test the built code
    gulp.parallel("copy-backend", "copy-frontend", "copy-assets")
  )
);

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

// Production build task (with tests)
gulp.task('build-prod', gulp.series('build-with-tests'));

// Start production servers
gulp.task('start-backend', shell.task([
  'cd dist/backend && node index.js'
]));

gulp.task('start-frontend', shell.task([
  'cd frontend && npm run preview'
]));

gulp.task('start', gulp.parallel('start-backend', 'start-frontend'));

// Default task (fast build for development)
gulp.task('default', gulp.series('build'));

// Help task to show available commands
gulp.task('help', function(done) {
  console.log('');
  console.log('Available Gulp tasks:');
  console.log('');
  console.log(
    "  build                - Build both frontend and backend (fast, no tests)"
  );
  console.log(
    "  build-with-tests     - Build with tests first (recommended for production)"
  );
  console.log("  build-safe           - Build then test (safe deployment)");
  console.log(
    "  build-prod           - Production build (same as build-with-tests)"
  );
  console.log(
    "  ci-build             - Comprehensive CI/CD build with coverage"
  );
  console.log(
    "  dev                  - Start both frontend and backend in development mode"
  );
  console.log("  clean                - Remove all build artifacts");
  console.log(
    "  install-all          - Install dependencies for both frontend and backend"
  );
  console.log(
    "  watch                - Watch for changes and rebuild automatically"
  );
  console.log("  start                - Start production servers");
  console.log(
    "  test                 - Run all unit tests (backend + frontend)"
  );
  console.log("  test-backend         - Run backend unit tests once");
  console.log("  test-backend-watch   - Run backend unit tests in watch mode");
  console.log(
    "  test-backend-coverage- Run backend unit tests with coverage report"
  );
  console.log("  test-frontend        - Run frontend unit tests once");
  console.log("  test-frontend-watch  - Run frontend unit tests in watch mode");
  console.log(
    "  test-frontend-coverage- Run frontend unit tests with coverage report"
  );
  console.log("  help                 - Show this help message");
  console.log('');
  done();
});

// CI/CD build (comprehensive testing and building)
gulp.task(
  "ci-build",
  gulp.series(
    "clean",
    "install-all", // Ensure dependencies are installed
    gulp.parallel("test-backend-coverage", "test-frontend-coverage"), // Run tests with coverage
    gulp.parallel("build-backend", "build-frontend"),
    gulp.parallel("copy-backend", "copy-frontend", "copy-assets")
  )
);
