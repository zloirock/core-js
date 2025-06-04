await import('./clean.mjs');
await $`npm run build --prefix web`;
await import('./build.mjs');
await import('./copy.mjs');
