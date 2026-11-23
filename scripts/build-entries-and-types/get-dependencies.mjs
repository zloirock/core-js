import konan from 'konan';
import { modules } from '../../packages/core-js-compat/src/data.mjs';

const { cyan, red } = chalk;

const allModulesSet = new Set(modules);

const MODULE_PATH = /\/(?<path>(?:internals|modules)\/[\d\-.a-z]+)$/;
const DEPENDENCY_DIRECTIVE = /^ *\/\/ @dependency: (?<module>(?:es|esnext|web)\.[\d\-.a-z]+)$/gm;
const TYPES_DIRECTIVE = /^ *\/\/ @types: (?<types>[\d\-./a-z]+)$/gm;

const cache = new Map();

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

async function getModuleMetadata(path, stack = new Set()) {
  if (cache.has(path)) return cache.get(path);
  if (stack.has(path)) throw new Error(red(`Circular dependency: ${ cyan(path) }`));
  stack.add(path);
  const module = await fs.readFile(`./packages/core-js/${ path }.js`, 'utf8');
  const directDependencies = konan(module).strings.map(normalizeModulePath);
  const declaredDependencies = module.matchAll(DEPENDENCY_DIRECTIVE).map(it => normalizeModulePath(it.groups.module)).toArray();
  const dependencies = unique([...directDependencies, ...declaredDependencies]);
  const paths = new Set([path]);
  const types = new Set(module.matchAll(TYPES_DIRECTIVE).map(match => match.groups.types));
  for (const dependency of dependencies) {
    const moduleMetadata = await getModuleMetadata(dependency, new Set(stack));
    moduleMetadata.dependencies.forEach(it => paths.add(it));
    moduleMetadata.types.forEach(it => types.add(it));
  }
  const result = {
    dependencies: paths,
    types,
  };
  cache.set(path, result);
  return result;
}

export async function getModulesMetadata(paths) {
  const dependencies = [];
  const types = [];
  for (const module of paths) {
    const result = await getModuleMetadata(normalizeModulePath(module));
    dependencies.push(...result.dependencies);
    types.push(...result.types);
  }
  return {
    dependencies: sort(unique(dependencies).filter(it => it.startsWith('modules/')).map(it => it.slice(8))),
    types: unique(types),
  };
}

// Explicit dependencies survive the layer filter in both the JS entry and its declarations.
export async function getEntryMetadata(entryModules, entryDependencies, filter) {
  const metadata = await getModulesMetadata([...entryModules, ...entryDependencies]);
  if (!filter) return metadata;
  const required = new Set((await getModulesMetadata(entryDependencies)).dependencies);
  return {
    types: metadata.types,
    dependencies: metadata.dependencies.filter(it => filter.has(it) || required.has(it)),
  };
}
