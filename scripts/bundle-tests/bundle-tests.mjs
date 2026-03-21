async function generateTestsIndex(name, pkg, filter = /^(?:es|esnext|helpers|web)\./) {
  const dir = `../../tests/${ name }`;
  const files = await fs.readdir(dir);
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => it.endsWith('.js') && it !== 'index.js' && filter.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}

await generateTestsIndex('unit-global', 'core-js');
await generateTestsIndex('unit-pure', '@core-js/pure');
await generateTestsIndex('e2e-usage-pure', '@core-js/pure', /^[a-z]/);

echo(chalk.green('tests indexes generated'));

await Promise.all([
  ['unit-global/index', 'unit-global'],
  ['unit-pure/index', 'unit-pure'],
  ['e2e-usage-pure/index', 'e2e-usage-pure', 'webpack.usage-pure.config.js'],
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
