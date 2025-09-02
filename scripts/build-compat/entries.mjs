import konan from 'konan';
import { modules } from 'core-js-compat/src/data.mjs';
import helpers from 'core-js-compat/helpers.js';

async function getModulesForEntryPoint(path, parent) {
  const entry = new URL(path, parent);

  const match = entry.pathname.match(/[/\\]modules[/\\](?<module>[^/\\]+)$/);
  if (match) return [match.groups.module];

  entry.pathname += await fs.pathExists(entry) ? '/index.js' : '.js';

  if (!await fs.pathExists(entry)) return [];

  const file = await fs.readFile(entry, 'utf8');
  const result = await Promise.all(konan(String(file)).strings.map(dependency => {
    return getModulesForEntryPoint(dependency, entry);
  }));

  return helpers.intersection(result.flat(), modules);
}

const entriesList = await glob([
  'packages/core-js/index.js',
  'packages/core-js/actual/**/*.js',
  'packages/core-js/es/**/*.js',
  'packages/core-js/full/**/*.js',
  'packages/core-js/features/**/*.js',
  'packages/core-js/modules/*.js',
  'packages/core-js/proposals/**/*.js',
  'packages/core-js/stable/**/*.js',
  'packages/core-js/stage/**/*.js',
  'packages/core-js/web/**/*.js',
]);

const entriesMap = helpers.sortObjectByKey(Object.fromEntries(await Promise.all(entriesList.map(async file => {
  // TODO: store entries without the package name in `core-js@4`
  const entry = file.replace(/\.js$/, '').replace(/\/index$/, '');
  return [entry.slice(9), await getModulesForEntryPoint(`../../${ entry }`, import.meta.url)];
}))));

await fs.writeJson('packages/core-js-compat/entries.json', entriesMap, { spaces: '  ' });

echo(chalk.green('entries data rebuilt'));
