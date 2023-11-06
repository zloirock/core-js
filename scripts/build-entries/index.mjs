import { getListOfDependencies, sort } from './get-dependencies.mjs';
import { features, proposals } from './entries-definitions.mjs';
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

async function buildEntry(entry, template, modules, filter, enforce) {
  if (filter) modules = modules.filter(it => typeof it != 'string' || filter.has(it));
  if (!enforce && !modules.length) return;
  const level = entry.split('/').length - 1;
  modules = await getListOfDependencies(modules);
  if (filter) modules = modules.filter(it => filter.has(it));
  const file = template({ modules, level });
  const filepath = `./packages/core-js/$test$/${ entry }.js`;
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, file);
  built++;
}

for (const [entry, { modules, template, enforce }] of Object.entries(features)) {
  await buildEntry(`es/${ entry }`, template, modules, ESSet, enforce);
  await buildEntry(`stable/${ entry }`, template, modules, StableSet, enforce);
  await buildEntry(`actual/${ entry }`, template, modules, ActualSet, enforce);
  await buildEntry(`full/${ entry }`, template, modules, null, enforce);
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
await buildEntry('stage/2', $path, modulesToStage(2), ESWithProposalsSet);
await buildEntry('stage/1', $path, modulesToStage(1), ESWithProposalsSet);
await buildEntry('stage/0', $path, AllModules, ESWithProposalsSet);

echo(chalk.green(`built ${ chalk.cyan(built) } entries`));
