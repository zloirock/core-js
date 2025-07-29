await import('./clean.mjs');
await $`npm run build --prefix web-site`;
await import('./build.mjs');
await import('./copy.mjs');
