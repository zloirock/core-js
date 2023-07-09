await import('./build-indexes.mjs');
await import('./clean-and-copy.mjs');
await $`npm run build-compat`;
