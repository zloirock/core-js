import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import { POSSIBLE_GLOBAL_OBJECTS, patternToRegExp, validatePatternList } from './helpers.js';

const { hasOwn } = Object;

function createMetaResolver({ globals, statics, instance }) {
  return function resolve(meta) {
    if (meta.kind === 'global') {
      if (!hasOwn(globals, meta.name)) return undefined;
      return { kind: 'global', desc: globals[meta.name], name: meta.name };
    }
    if (meta.kind === 'property' || meta.kind === 'in') {
      const { placement, object, key } = meta;
      if (placement === 'static' && POSSIBLE_GLOBAL_OBJECTS.has(object) && hasOwn(globals, key)) {
        return { kind: 'global', desc: globals[key], name: key };
      }
      if (placement === 'static' && hasOwn(statics, object) && hasOwn(statics[object], key)) {
        return { kind: 'static', desc: statics[object][key], name: `${ object }$${ key }` };
      }
      if (!hasOwn(instance, key)) return undefined;
      const desc = instance[key];
      if (desc) return { kind: 'instance', desc, name: key };
    }
    return undefined;
  };
}

// array/instance/at and array/prototype/at -> array/at
function normalizeEntryPath(entry) {
  return entry
    .replaceAll('/instance/', '/')
    .replaceAll('/prototype/', '/');
}

function collectEntryPaths(patterns) {
  if (!Array.isArray(patterns)) return new Set();
  const result = new Set();
  for (const pattern of patterns) {
    if (typeof pattern == 'string' && hasOwn(entries, `full/${ pattern }`)) {
      result.add(normalizeEntryPath(pattern));
    }
  }
  return result;
}

function normalizeImportPath(path) {
  return typeof path != 'string' ? null : path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

function patternMatches(pattern, modules) {
  const re = patternToRegExp(pattern);
  if (!re) return false;
  for (const m of modules) if (re.test(m)) return true;
  return false;
}

function isModulePattern(pattern) {
  if (pattern instanceof RegExp) return true;
  if (typeof pattern !== 'string') return false;
  // module names start with a known namespace (`es.`, `esnext.`, `web.`); wildcards always
  // imply a module pattern; entry paths use slashes (`array/at`) so they fall through
  return pattern.startsWith('es.')
    || pattern.startsWith('esnext.')
    || pattern.startsWith('web.')
    || pattern.includes('*');
}

function formatError(message, patterns) {
  return `  - ${ message }:\n${ patterns.map(p => `    ${ p }\n`).join('') }`;
}

function isEntryPattern(pattern) {
  return typeof pattern === 'string' && !isModulePattern(pattern);
}

function validateIncludeExclude(include, exclude, modules) {
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  if (!include && !exclude) return;
  const errors = [];
  for (const [label, patterns] of [['include', include], ['exclude', exclude]]) {
    if (!patterns?.length) continue;
    const unusedModules = patterns.filter(isModulePattern).filter(p => !patternMatches(p, modules));
    if (unusedModules.length) errors.push(formatError(`The following "${ label }" patterns didn't match any polyfill`, unusedModules));
    const unusedEntries = patterns.filter(isEntryPattern).filter(p => !hasOwn(entries, `full/${ p }`));
    if (unusedEntries.length) errors.push(formatError(`The following "${ label }" entry paths didn't match any polyfill`, unusedEntries));
  }
  const moduleInclude = include?.filter(isModulePattern);
  const moduleExclude = exclude?.filter(isModulePattern);
  if (moduleInclude?.length && moduleExclude?.length) {
    const duplicates = moduleInclude.filter(p => {
      if (p instanceof RegExp) return moduleExclude.some(e => e instanceof RegExp && e.source === p.source && e.flags === p.flags);
      return moduleExclude.includes(p);
    });
    if (duplicates.length) {
      errors.push(formatError('The following polyfills were matched both by "include" and "exclude" patterns', duplicates));
    }
  }
  if (errors.length) throw new Error(`Error while validating the "core-js@4" provider options:\n${ errors.join('') }`);
}

export function createPolyfillContext({
  method,
  mode = 'actual',
  version = 'node_modules',
  package: pkg,
  additionalPackages,
  include,
  exclude,
  shippedProposals = false,
  shouldInjectPolyfill = () => true,
}) {
  if (!['entry-global', 'usage-global', 'usage-pure'].includes(method)) throw new TypeError('Incorrect plugin method');
  if (!['es', 'stable', 'actual', 'full'].includes(mode)) throw new TypeError('Incorrect plugin mode');
  if (typeof shouldInjectPolyfill !== 'function') throw new TypeError('`shouldInjectPolyfill` should be a function');
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  const includeEntries = method === 'usage-pure' ? collectEntryPaths(include) : new Set();
  const excludeEntries = method === 'usage-pure' ? collectEntryPaths(exclude) : new Set();

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw new TypeError('Incorrect package name');
  if (additionalPackages !== null && additionalPackages !== undefined && !Array.isArray(additionalPackages)) {
    throw new TypeError('`additionalPackages` should be an array');
  }
  if (additionalPackages && additionalPackages.some($pkg => typeof $pkg != 'string')) {
    throw new TypeError('Incorrect additional package name');
  }

  version = normalizeCoreJSVersion(version);

  const packages = (additionalPackages ? [pkg, ...additionalPackages] : [pkg]).map(p => p.toLowerCase());
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  validateIncludeExclude(include, exclude, modulesSetForTargetVersion);

  function resolveModule(mod) {
    if (modulesSetForTargetVersion.has(mod)) return mod;
    if (mod.startsWith('es.')) {
      const esnext = `esnext.${ mod.slice(3) }`;
      if (modulesSetForTargetVersion.has(esnext)) return esnext;
    }
    return null;
  }

  function getModulesForEntry(entry) {
    if (entry === '') entry = 'index';
    if (modulesForEntryCache.has(entry)) return modulesForEntryCache.get(entry);
    const allEntryModules = hasOwn(entries, entry) ? entries[entry] : [];
    const result = [];
    for (const mod of allEntryModules) {
      const resolved = resolveModule(mod);
      if (resolved !== null && shouldInjectPolyfill(resolved)) result.push(resolved);
    }
    modulesForEntryCache.set(entry, result);
    return result;
  }

  function getCoreJSEntry(source) {
    source = normalizeImportPath(source);
    if (source === null) return null;
    for (const $pkg of packages) {
      if (source === $pkg) return '';
      if (source.startsWith(`${ $pkg }/`)) {
        const entry = source.slice($pkg.length + 1);
        if (hasOwn(entries, entry)) return entry;
      }
    }
    return null;
  }

  const isEntryNeededCache = new Map();

  function isEntryNeeded(entry) {
    if (entry === '') entry = 'index';
    if (isEntryNeededCache.has(entry)) return isEntryNeededCache.get(entry);
    const normalized = normalizeEntryPath(entry);
    let result;
    if (excludeEntries.has(entry) || excludeEntries.has(normalized)) result = false;
    else if (includeEntries.has(entry) || includeEntries.has(normalized)) result = true;
    else {
      const modeEntry = `${ mode }/${ entry }`;
      result = entriesSetForTargetVersion.has(modeEntry) && !!getModulesForEntry(modeEntry).length;
    }
    isEntryNeededCache.set(entry, result);
    return result;
  }

  return {
    mode,
    pkg,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryNeeded,
  };
}

export const resolve = createMetaResolver(builtInDefinitions);
