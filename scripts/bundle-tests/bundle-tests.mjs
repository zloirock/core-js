import { generateTestsIndex } from './generate-tests-index.mjs';

await generateTestsIndex('unit-global', 'core-js');
await generateTestsIndex('unit-pure', '@core-js/pure');

echo(chalk.green('tests indexes generated'));

await Promise.all([
  ['unit-global/index', 'unit-global'],
  ['unit-pure/index', 'unit-pure'],
].map(([entry, output, config]) => $`webpack \
  --entry ../../tests/${ entry }.js \
  --output-filename ${ output }.js \
  ${ config ? ['--config', config] : [] } \
`));

await Promise.all([
  fs.copyFile('../../packages/core-js-bundle/index.js', '../../tests/bundles/core-js-bundle.js'),
  fs.copyFile('./node_modules/@slowcheetah/qunitjs-1/qunit/qunit.js', '../../tests/bundles/qunit.js'),
  fs.copyFile('./node_modules/@slowcheetah/qunitjs-1/qunit/qunit.css', '../../tests/bundles/qunit.css'),
]);

echo(chalk.green('\ntests bundled, qunit and core-js bundles copied into /tests/bundles/'));
