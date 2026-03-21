await Promise.all([
  ['packages/core-js/full/index', 'tests/bundles/unit-global'],
  ['packages/core-js/full/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
  ['tests/bundles/e2e-usage-pure'],
].map(files => $`qunit ${ files.map(file => `${ file }.js`) }`));
