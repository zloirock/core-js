import run from './harness.mjs';

await import('./tests.mjs');

// Interpolation keeps recursive patterns intact until test262-harness expands them.
process.exitCode = (await run(argv._).nothrow()).exitCode ?? 1;
