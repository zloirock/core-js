import detective from 'detective';
import globby from 'globby';
import { modules } from './data.mjs';
import helpers from '../helpers.js';

async function getModulesForEntryPoint(path, parent) {
  const entry = new URL(path, parent);

  const match = entry.pathname.match(/[/\\]modules[/\\]([^/\\]+)$/);
  if (match) return [match[1]];

  entry.pathname += await fs.pathExists(entry) ? '/index.js' : '.js';

  if (!await fs.pathExists(entry)) return [];

  const file = await fs.readFile(entry);
  const result = await Promise.all(detective(file).map(dependency => {
    return getModulesForEntryPoint(dependency, entry);
  }));

  return helpers.intersection(result.flat(1), modules);
}

const entriesList = await globby([
  'packages/core-js/index.js',
  'packages/core-js/es/**/*.js',
  'packages/core-js/features/**/*.js',
  'packages/core-js/modules/*.js',
  'packages/core-js/proposals/**/*.js',
  'packages/core-js/stable/**/*.js',
  'packages/core-js/stage/**/*.js',
  'packages/core-js/web/**/*.js',
]);

const entriesMap = helpers.sortObjectByKey(Object.fromEntries(await Promise.all(entriesList.map(async file => {
  // TODO: store entries without the package name in `core-js@4`
  const entry = file.slice(9).replace(/\.js$/, '').replace(/\/index$/, '');
  return [entry, await getModulesForEntryPoint(`../../${ entry }`, import.meta.url)];
}))));

await fs.writeJson('./packages/core-js-compat/entries.json', entriesMap, { spaces: '  ' });

// eslint-disable-next-line no-console -- output
console.log(chalk.green('entries data rebuilt'));
