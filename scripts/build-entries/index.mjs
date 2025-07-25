import { getListOfDependencies, getListOfTypes, sort } from './get-dependencies.mjs';
import { features, proposals } from './entries-definitions.mjs';
import { $proposal, $path, wrapDts, wrapEntry } from './templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';

const { mkdir, writeFile, readJson, writeJson } = fs;
const { dirname } = path;
const { cyan, green } = chalk;

function modulesToStage(x) {
  return sort([
    ...StableModules,
    ...Object.values(proposals).flatMap(({ stage, modules }) => stage >= x ? modules : []),
  ]);
}

const ESModules = AllModules.filter(it => it.startsWith('es.'));
const ESWithProposalsModules = AllModules.filter(it => it.startsWith('es'));
const StableModules = AllModules.filter(it => it.match(/^(?:es|web)\./));
const ActualModules = modulesToStage(3);

const ESSet = new Set(ESModules);
const ESWithProposalsSet = new Set(ESWithProposalsModules);
const StableSet = new Set(StableModules);
const ActualSet = new Set(ActualModules);

let built = 0;

const exportsFields = {
  '.': './index.js',
  './package.json': './package.json',
  './configurator': './configurator.js',
  './configurator.js': './configurator.js',
  './modules/*': './modules/*.js',
  './modules/*.js': './modules/*.js',
};

// use Object.create(null) because of cases like __proto__
const builtInDefinitions = {
  BuiltIns: Object.create(null),
  StaticProperties: Object.create(null),
  InstanceProperties: Object.create(null),
};

const entriesMap = AllModules.reduce((memo, it) => {
  memo[`core-js/modules/${ it }`] = [it];
  return memo;
}, {});

function expandModules(modules, filter) {
  if (!Array.isArray(modules)) modules = [modules];
  modules = modules.flatMap(it => it instanceof RegExp ? AllModules.filter(path => it.test(path)) : [it]);
  if (filter) modules = modules.filter(it => typeof it != 'string' || filter.has(it));
  return modules;
}

async function buildEntry(entry, options) {
  let {
    entryFromNamespace,
    subset = entryFromNamespace ?? 'full',
    template, templateStable, templateActual, templateFull, filter, modules, enforceEntryCreation,
    buildBuiltInDefinitions, injectOn, globalModeOnly = false, rawEntry, name, namespace,
  } = options;

  switch (subset) {
    case 'es':
      filter ??= ESSet;
      break;
    case 'stable':
      filter ??= StableSet;
      template = templateStable ?? template;
      break;
    case 'actual':
      filter ??= ActualSet;
      template = templateActual ?? templateStable ?? template;
      break;
    case 'full':
      template = templateFull ?? templateActual ?? templateStable ?? template;
      break;
    case 'es-stage':
      filter ??= ESWithProposalsSet;
  }

  if (!enforceEntryCreation && !expandModules(modules[0], filter).length) return;

  const rawModules = modules;

  modules = expandModules(modules, filter);

  const level = entry.split('/').length - 1;

  modules = await getListOfDependencies(modules);
  if (filter) modules = modules.filter(it => filter.has(it));

  const types = await getListOfTypes(modules, level);

  const tpl = template({ ...options, modules, rawModules, level, entry, types });

  const filepath = `./packages/core-js/${ entry }.js`;
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, wrapEntry(tpl.entry));

  const typePath = `./packages/core-js/${ entry }.d.ts`;
  await writeFile(typePath, wrapDts(tpl.dts, { types, level }));

  built++;

  if (entry.endsWith('/index')) exportsFields[`./${ entry.slice(0, -6) }`] = `./${ entry }.js`;
  const split = entry.split('/');
  if (!entryFromNamespace || split.length < 3) {
    exportsFields[`./${ entry }`] = `./${ entry }.js`;
    exportsFields[`./${ entry }.js`] = `./${ entry }.js`;
  } else if (entryFromNamespace) {
    const entrySlice2 = split.slice(0, 2).join('/');
    exportsFields[`./${ entrySlice2 }/*`] = `./${ entrySlice2 }/*.js`;
    exportsFields[`./${ entrySlice2 }/*.js`] = `./${ entrySlice2 }/*.js`;
  }

  entriesMap[`core-js/${ entry }`.replace(/\/index$/, '')] = modules;

  if (buildBuiltInDefinitions && injectOn) {
    let definitionTarget;

    switch (injectOn) {
      case 'global':
        definitionTarget = builtInDefinitions.BuiltIns;
        break;
      case 'static':
        definitionTarget = (builtInDefinitions.StaticProperties[namespace] ??= Object.create(null));
        break;
      case 'instance':
        definitionTarget = builtInDefinitions.InstanceProperties;
    }

    if (Object.hasOwn(definitionTarget, name)) throw new Error(`${ name } already defined`);

    definitionTarget[name] = {
      entry: rawEntry,
      modules,
      globalModeOnly,
    };
  }
}

async function writeExportsField(path) {
  const pkg = await readJson(path);
  pkg.exports = exportsFields;
  await writeJson(path, pkg, { spaces: '  ' });
  echo(green(`built ${ cyan(path) } exports field`));
}

for (const [entry, definition] of Object.entries(features)) {
  await buildEntry(`es/${ entry }`, { ...definition, entryFromNamespace: 'es' });
  await buildEntry(`stable/${ entry }`, { ...definition, entryFromNamespace: 'stable' });
  await buildEntry(`actual/${ entry }`, { ...definition, entryFromNamespace: 'actual' });
  await buildEntry(`full/${ entry }`, { ...definition, entryFromNamespace: 'full', buildBuiltInDefinitions: true, rawEntry: entry });
}

for (const [name, definition] of Object.entries(proposals)) {
  await buildEntry(`proposals/${ name }`, { ...definition, template: $proposal });
}

await buildEntry('stage/3', { template: $path, modules: ActualModules, subset: 'es-stage' });
await buildEntry('stage/2.7', { template: $path, modules: modulesToStage(2.7), subset: 'es-stage' });
await buildEntry('stage/2', { template: $path, modules: modulesToStage(2), subset: 'es-stage' });
await buildEntry('stage/1', { template: $path, modules: modulesToStage(1), subset: 'es-stage' });
await buildEntry('stage/0', { template: $path, modules: AllModules, subset: 'es-stage' });

await buildEntry('es/index', { template: $path, modules: ESModules, subset: 'es' });
await buildEntry('stable/index', { template: $path, modules: StableModules, subset: 'stable' });
await buildEntry('actual/index', { template: $path, modules: ActualModules });
await buildEntry('full/index', { template: $path, modules: AllModules });
await buildEntry('index', { template: $path, modules: ActualModules });

echo(green(`built ${ cyan(built) } entries`));

await writeExportsField('./packages/core-js/package.json');
await writeExportsField('./packages/core-js-pure/package.json');

await writeJson('packages/core-js-compat/entries.json', entriesMap, { spaces: '  ' });

echo(chalk.green('entries data rebuilt'));

await writeJson('packages/core-js-compat/built-in-definitions.json', builtInDefinitions, { spaces: '  ' });

echo(chalk.green('built-in definitions rebuilt'));
