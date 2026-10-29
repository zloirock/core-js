import run from './harness.mjs';

await import('./tests.mjs');

// Interpolation keeps recursive patterns intact until test262-harness expands them.
await run(argv._.length ? argv._ : ['node_modules/test262/test/built-ins/**/*.js']);
