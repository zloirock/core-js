import { getListOfDependencies, sort } from './get-dependencies.mjs';
import { features, instance, proposals } from './entries-definitions.mjs';
import { $justImport, $path } from './templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';

const { mkdir, writeFile } = fs;
const { dirname } = path;

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

function expandModules(modules, filter) {
  if (!Array.isArray(modules)) modules = [modules];
  modules = modules.flatMap(it => it instanceof RegExp ? AllModules.filter(path => it.test(path)) : [it]);
  if (filter) modules = modules.filter(it => typeof it != 'string' || filter.has(it));
  return modules;
}

async function buildEntry(entry, template, modules, filter, enforce, ifModules) {
  modules = expandModules(modules, filter);
  if (!enforce) {
    ifModules = ifModules ? expandModules(ifModules, filter) : modules;
    if (!ifModules.length) return;
  }
  const level = entry.split('/').length - 1;
  modules = await getListOfDependencies(modules);
  if (filter) modules = modules.filter(it => filter.has(it));
  const file = template({ modules, level });
  const filepath = `./packages/core-js/${ entry }.js`;
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, file);
  built++;
}

for (const [entry, { modules, ifModules, template, enforce }] of Object.entries(features)) {
  await buildEntry(`es/${ entry }`, template, modules, ESSet, enforce, ifModules);
  await buildEntry(`stable/${ entry }`, template, modules, StableSet, enforce, ifModules);
  await buildEntry(`actual/${ entry }`, template, modules, ActualSet, enforce, ifModules);
  await buildEntry(`full/${ entry }`, template, modules, null, enforce, ifModules);
}

for (const [entry, { name, modules, template, stable, actual, full }] of Object.entries(instance)) {
  const params = { entry, name };
  let $template = template(params);
  await buildEntry(`es/instance/${ entry }`, $template, modules, ESSet);
  if (stable) $template = stable(params);
  await buildEntry(`stable/instance/${ entry }`, $template, modules, StableSet);
  if (actual) $template = actual(params);
  await buildEntry(`actual/instance/${ entry }`, $template, modules, ActualSet);
  if (full) $template = full(params);
  await buildEntry(`full/instance/${ entry }`, $template, modules);
}

for (const [name, { modules }] of Object.entries(proposals)) {
  await buildEntry(`proposals/${ name }`, $justImport, modules);
}

await buildEntry('es/index', $path, ESModules, ESSet);
await buildEntry('stable/index', $path, StableModules, StableSet);
await buildEntry('actual/index', $path, ActualModules);
await buildEntry('full/index', $path, AllModules);
await buildEntry('index', $path, ActualModules);

await buildEntry('stage/3', $path, ActualModules, ESWithProposalsSet);
await buildEntry('stage/2.7', $path, modulesToStage(2.7), ESWithProposalsSet);
await buildEntry('stage/2', $path, modulesToStage(2), ESWithProposalsSet);
await buildEntry('stage/1', $path, modulesToStage(1), ESWithProposalsSet);
await buildEntry('stage/0', $path, AllModules, ESWithProposalsSet);

echo(chalk.green(`built ${ chalk.cyan(built) } entries`));
