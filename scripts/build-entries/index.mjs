import { getListOfDependencies, sort, unique } from './get-dependencies.mjs';
import { features, proposals } from './entries-definitions.mjs';
import { $justImport } from './templates.mjs';
import { modules as AllModules } from '@core-js/compat/src/data.mjs';

const { mkdir, writeFile } = fs;
const { dirname } = path;

const ESModules = AllModules.filter(it => it.startsWith('es.'));
const StableModules = AllModules.filter(it => it.match(/^(?:es|web)\./));
const Stage3Modules = unique(Object.values(proposals).flatMap(({ stage, modules }) => stage === 3 ? modules : []));
const ActualModules = sort([...StableModules, ...Stage3Modules]);

const ESSet = new Set(ESModules);
const StableSet = new Set(StableModules);
const ActualSet = new Set([...StableModules, ...ActualModules]);

async function buildEntry(entry, template, modules, filter) {
  if (filter) modules = modules.filter(it => filter.has(it));
  if (!modules.length) return;
  const level = entry.split('/').length - 1;
  modules = await getListOfDependencies(modules);
  if (filter) modules = modules.filter(it => filter.has(it));
  const file = template({ modules, level });
  const filepath = `./packages/core-js/$test$/${ entry }.js`;
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, file);
}

for (const [entry, { modules, template }] of Object.entries(features)) {
  await buildEntry(`es/${ entry }`, template, modules, ESSet);
  await buildEntry(`stable/${ entry }`, template, modules, StableSet);
  await buildEntry(`actual/${ entry }`, template, modules, ActualSet);
  await buildEntry(`full/${ entry }`, template, modules);
}

for (const [name, { modules }] of Object.entries(proposals)) {
  await buildEntry(`proposals/${ name }`, $justImport, modules);
}
