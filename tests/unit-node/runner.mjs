await Promise.all([
  ['packages/core-js/full/index', 'tests/bundles/unit-global'],
  ['packages/core-js/full/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
].map(files => $`qunit ${ files.map(file => `${ file }.js`) }`).concat(
  // the stripped-realm leg COMPLEMENTS the full-env qunit run of the same bundle above
  // (both environments matter - full-env stays the primary): the same prebuilt bundle inside
  // a vm realm with the strip-manifest builtins deleted proves every ponyfill stands alone
  // and nothing silently reaches a native. the e2e-usage-pure legs live in their own runner
  // (`tests/unit-node/e2e-usage-pure.mjs`, the `test-e2e-usage-pure` script)
  $`node tests/unit-node/stripped-realm.mjs unit-pure`,
));
