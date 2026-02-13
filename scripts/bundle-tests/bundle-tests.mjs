await Promise.all([
  ['unit-global/index', 'unit-global'],
  ['unit-pure/index', 'unit-pure'],
].map(([entry, output]) => $`webpack \
  --entry ../../tests/${ entry }.js \
  --output-filename ${ output }.js \
`).concat([
  fs.copyFile('../../packages/core-js-bundle/index.js', '../../tests/bundles/core-js-bundle.js'),
  fs.copyFile('./node_modules/@slowcheetah/qunitjs-1/qunit/qunit.js', '../../tests/bundles/qunit.js'),
  fs.copyFile('./node_modules/@slowcheetah/qunitjs-1/qunit/qunit.css', '../../tests/bundles/qunit.css'),
]));
