await Promise.all([
  ['packages/core-js/full/index', 'tests/bundles/unit-global'],
  ['packages/core-js/full/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
].map(files => $`qunit --reporter ./tests/unit-node/quiet-reporter.js ${ files.map(file => `${ file }.js`) }`));
