await import('./clean.mjs');
await $`npm run build-entries`;
await import('./copy.mjs');
await $`npm run build-compat`;
