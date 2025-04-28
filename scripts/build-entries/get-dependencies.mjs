import konan from 'konan';
import { modules } from '@core-js/compat/src/data.mjs';

const { cyan, red } = chalk;

const allModulesSet = new Set(modules);

const MODULE_PATH = /\/(?<path>(?:internals|modules)\/[\d\-.a-z]+)$/;
const DIRECTIVE = /^ *\/\/ @dependency: (?<module>(?:es|esnext|web)\.[\d\-.a-z]+)$/gm;
const TYPES_DIRECTIVE = /^ *\/\/ type: (?<type>[\d\-./a-z]+)$/gm;

const dependenciesCache = new Map();
const typesCache = new Map();

function unique(array) {
  return [...new Set(array)];
}

export function sort(list) {
  const set = new Set(list);
  return modules.filter(it => set.has(it));
}

function normalizeModulePath(unnormalizedPath) {
  if (!unnormalizedPath.includes('/')) {
    if (!allModulesSet.has(unnormalizedPath)) throw new Error(red(`Incorrect dependency: ${ cyan(unnormalizedPath) }`));
    return `modules/${ unnormalizedPath }`;
  }
  const { path } = MODULE_PATH.exec(unnormalizedPath).groups;
  return path.endsWith('.js') ? path.slice(0, -3) : path;
}

async function getSetOfAllDependenciesForModule(path, stack = new Set()) {
  if (dependenciesCache.has(path)) return dependenciesCache.get(path);
  if (stack.has(path)) throw new Error(red(`Circular dependency: ${ cyan(path) }`));
  stack.add(path);
  const module = String(await fs.readFile(`./packages/core-js/${ path }.js`));
  const directDependencies = konan(module).strings.map(normalizeModulePath);
  const declaredDependencies = [...module.matchAll(DIRECTIVE)].map(it => normalizeModulePath(it.groups.module));
  const dependencies = unique([...directDependencies, ...declaredDependencies]);
  const result = new Set([path]);
  for (const dependency of dependencies) {
    const dependenciesOfDependency = await getSetOfAllDependenciesForModule(dependency, new Set(stack));
    dependenciesOfDependency.forEach(it => result.add(it));
  }
  dependenciesCache.set(path, result);
  return result;
}

export async function getListOfDependencies(paths) {
  const dependencies = [];
  for (const module of paths.map(normalizeModulePath)) {
    dependencies.push(...await getSetOfAllDependenciesForModule(module));
  }
  return sort(unique(dependencies).filter(it => it.startsWith('modules/')).map(it => it.slice(8)));
}

export async function getListOfTypes(modulePaths) {
  if (typesCache.has(modulePaths)) return typesCache.get(modulePaths);
  const typesSet = new Set();
  for (const modulePath of modulePaths) {
    const module = String(await fs.readFile(`./packages/core-js/modules/${ modulePath }.js`));
    [...module.matchAll(TYPES_DIRECTIVE)].map(it => typesSet.add(it.groups.type));
  }
  const types = Array.from(typesSet);
  typesCache.set(modulePaths, types);

  return types;
}
