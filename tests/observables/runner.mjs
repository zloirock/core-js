cd('tests/observables');

await $`npm i --no-audit --no-fund --loglevel=error`;

await $`babel --config-file ../../babel.config.js node_modules/es-observable/test/ -d ./bundles/observables-tests/`;

await $`zx adapter.mjs`;
await $`zx adapter.mjs --pure`;
