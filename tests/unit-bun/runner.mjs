await Promise.all([
  ['packages/core-js/index', 'tests/bundles/unit-global'],
  ['packages/core-js/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
].map(files => $`bun ./tests/unit-bun/node_modules/.bin/qunit ${ files.map(file => `${ file }.js`) }`));
