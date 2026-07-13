await Promise.all([
  ['packages/core-js/full/index', 'tests/bundles/unit-global'],
  ['packages/core-js/full/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
  ['tests/bundles/e2e-usage-pure'],
].map(files => $`qunit ${ files.map(file => `${ file }.js`) }`).concat(
  // the stripped-realm legs COMPLEMENT the full-env qunit runs of the same bundles above
  // (both environments matter - full-env stays the primary): the same prebuilt bundle inside
  // a vm realm with the strip-manifest builtins deleted proves every ponyfill stands alone
  // and nothing silently reaches a native
  $`node tests/unit-node/stripped-realm.mjs e2e-usage-pure`,
  $`node tests/unit-node/stripped-realm.mjs unit-pure`,
));
