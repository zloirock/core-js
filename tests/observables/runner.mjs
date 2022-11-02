await $`babel --config-file ../../babel.config.js node_modules/es-observable/test/ -d ./bundles/observables-tests/`;

for (const mode of ['global', 'pure']) {
  await $`zx adapter.mjs --${ mode }`;
}
