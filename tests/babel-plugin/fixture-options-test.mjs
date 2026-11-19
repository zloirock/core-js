import { deepEqual, equal, rejects } from 'node:assert/strict';
import { loadBabelOptions } from './fixture-options.mjs';
import { collectFixtures } from './fixture-shards.mjs';

// A malformed fixture must fail collection, before an expected error or a skip can
// hide the missing plugin. Neither a malformed JSON nor missing options may become a product error baseline.
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-fixture-options-'));
const fixture = path.join(directory, 'claim');
const json = path.join(fixture, 'options.json');
const moduleFile = path.join(fixture, 'options.mjs');
try {
  await fs.outputFile(path.join(fixture, 'input.mjs'), 'Array.from([]);\n');
  await fs.writeFile(path.join(fixture, 'error.txt'), 'Unknown option: .method');
  equal(await loadBabelOptions(fixture), null);
  await rejects(collectFixtures(directory), /fixture options: .*must declare plugins/u);
  for (const options of [null, {}, { method: 'usage-pure' }, { plugins: ['@core-js'] }, { plugins: [['other', {}]] }]) {
    await fs.writeJson(json, options);
    await rejects(collectFixtures(directory), /fixture options: .*must declare plugins/u);
  }
  // Invalid *plugin* options remain tests of the product's diagnostic, not of the collector.
  const options = { plugins: [['@core-js', { method: 'invalid' }]] };
  await fs.writeFile(json, `\uFEFF${ JSON.stringify(options) }`);
  deepEqual(await loadBabelOptions(fixture), options);
  deepEqual(await collectFixtures(directory), [fixture]);
  await fs.writeFile(json, '{');
  await rejects(collectFixtures(directory), SyntaxError);
  // All consumers give the function-bearing module the same precedence as Babel.
  await fs.writeFile(moduleFile, "export default { plugins: [['@core-js', { shouldInjectPolyfill: () => false }]] };\n");
  const moduleOptions = await loadBabelOptions(fixture);
  equal(moduleOptions.plugins[0][1].shouldInjectPolyfill(), false);
  deepEqual(await collectFixtures(directory), [fixture]);
  equal(await loadBabelOptions(fixture), moduleOptions);
  await fs.remove(json);
  deepEqual(await collectFixtures(directory), [fixture]);
} finally {
  await fs.remove(directory);
}
echo(chalk.green('fixture-options: configuration and collection passed'));
