import { sort } from './get-dependencies.mjs';
import { proposals } from './entries-definitions.mjs';

export function modulesToStage(stableModules, x) {
  return sort([
    ...stableModules,
    ...Object.values(proposals).flatMap(({ stage, modules }) => stage >= x ? modules : []),
  ]);
}

export function expandModules(modules, filter, allModules) {
  if (!Array.isArray(modules)) modules = [modules];
  modules = modules.flatMap(it => it instanceof RegExp ? allModules.filter(path => it.test(path)) : [it]);
  if (filter) modules = modules.filter(it => typeof it != 'string' || filter.has(it));
  return modules;
}
