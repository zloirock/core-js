await import('./clean.mjs');
await $`npm run build --prefix website`;
await import('./build.mjs');
await import('./copy.mjs');
