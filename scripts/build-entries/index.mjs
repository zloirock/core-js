import { getListOfDependencies } from './get-dependencies.mjs';
import { features } from './entries-definitions.mjs';

const { mkdir, writeFile } = fs;
const { dirname } = path;

async function buildEntry(entry, template, modulesWithoutDependencies, filter) {
  const level = entry.split('/').length - 1;
  let modules = await getListOfDependencies(modulesWithoutDependencies);
  if (filter) modules = modules.filter(it => filter.test(it));
  const file = template({ modules, level });
  const filepath = `./packages/core-js/$test$/${ entry }.js`;
  // console.log(filepath, file);
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, file);
}

for (const [entry, { modules, template }] of Object.entries(features)) {
  const es = modules.es ?? [];
  const stable = [...es, ...modules.stable ?? []];
  const actual = [...stable, ...modules.actual ?? []];
  const full = [...actual, ...modules.full ?? []];
  await buildEntry(`es/${ entry }`, template, es, /^es\./);
  await buildEntry(`stable/${ entry }`, template, stable, /^(?:es|web)\./);
  await buildEntry(`actual/${ entry }`, template, actual);
  await buildEntry(`full/${ entry }`, template, full);
}
