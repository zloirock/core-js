import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import {
  POSSIBLE_GLOBAL_OBJECTS,
  isEntryPattern,
  isModulePattern,
  lookupEntryModules,
  patternToRegExp,
  stripQueryHash,
  validatePatternList,
} from './helpers.js';
import { optionTypeError } from './plugin-options.js';

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

// canonical key for include/exclude lookup: strip mode prefix and instance/prototype segment
// `actual/array/instance/at`, `array/instance/at`, `array/prototype/at` -> `array/at`
const MODE_PREFIX = /^(?:actual|es|full|stable)\//;
function normalizeEntryPath(entry) {
  return entry
    .replace(MODE_PREFIX, '')
    .replaceAll('/instance/', '/')
    .replaceAll('/prototype/', '/');
}

function collectEntryPaths(patterns) {
  if (!Array.isArray(patterns)) return new Set();
  const result = new Set();
  for (const pattern of patterns) {
    if (lookupEntryModules(pattern)) result.add(normalizeEntryPath(pattern));
  }
  return result;
}

// strip `file://` / `./` prefixes that bundler id resolution commonly introduces
const stripLeadingPrefix = p => {
  if (p.startsWith('file://')) return p.slice(7);
  if (p.startsWith('./')) return p.slice(2);
  return p;
};

// normalize the import source to a canonical entry path so we can look it up in the `entries`
// map: forward slashes only, no query/hash, no protocol, no trailing `/index` or `.{c,m}js`
function normalizeImportPath(path) {
  if (typeof path != 'string') return null;
  const withForwardSlashes = path.replaceAll('\\', '/');
  const withoutQuery = stripQueryHash(withForwardSlashes);
  const withoutPrefix = stripLeadingPrefix(withoutQuery);
  // accept `.js`, `.mjs`, `.cjs` - `import 'core-js/actual/array/at.mjs'` should resolve like `.js`
  return withoutPrefix.replace(/(?:\/(?:index)?)?(?:\.[cm]?js)?$/i, '').toLowerCase();
}

function patternMatches(pattern, modules) {
  const re = patternToRegExp(pattern);
  if (!re) return false;
  for (const m of modules) if (re.test(m)) return true;
  return false;
}

function formatError(message, patterns) {
  return `  - ${ message }:\n${ patterns.map(p => `    ${ p }\n`).join('') }`;
}

function validateIncludeExclude(include, exclude, modules, method) {
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  if (!include && !exclude) return;
  const errors = [];
  for (const [label, patterns] of [['include', include], ['exclude', exclude]]) {
    if (!patterns?.length) continue;
    const unusedModules = patterns.filter(isModulePattern).filter(p => !patternMatches(p, modules));
    if (unusedModules.length) errors.push(formatError(`The following "${ label }" patterns didn't match any polyfill`, unusedModules));
    const $entries = patterns.filter(isEntryPattern);
    // entry-path include/exclude only makes sense for the pure variant where the entry IS
    // the import unit; in global modes a single entry would force-inject hundreds of modules
    if ($entries.length && method !== 'usage-pure') {
      errors.push(formatError(`Entry-path patterns in "${ label }" are only allowed with method: 'usage-pure'`, $entries));
    } else {
      const unusedEntries = $entries.filter(p => !lookupEntryModules(p));
      if (unusedEntries.length) errors.push(formatError(`The following "${ label }" entry paths didn't match any polyfill`, unusedEntries));
    }
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
  if (typeof shouldInjectPolyfill !== 'function') {
    throw optionTypeError('shouldInjectPolyfill', 'a function', shouldInjectPolyfill);
  }
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  const includeEntries = method === 'usage-pure' ? collectEntryPaths(include) : new Set();
  const excludeEntries = method === 'usage-pure' ? collectEntryPaths(exclude) : new Set();

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  if (typeof pkg != 'string') throw optionTypeError('package', 'a string', pkg);
  if (additionalPackages !== null && additionalPackages !== undefined && !Array.isArray(additionalPackages)) {
    throw optionTypeError('additionalPackages', 'an array, or undefined', additionalPackages);
  }
  if (additionalPackages) {
    const bad = additionalPackages.find($pkg => typeof $pkg != 'string');
    if (bad !== undefined) throw optionTypeError('additionalPackages[*]', 'a string', bad);
  }

  version = normalizeCoreJSVersion(version);

  const packages = (additionalPackages ? [pkg, ...additionalPackages] : [pkg]).map(p => p.toLowerCase());
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  validateIncludeExclude(include, exclude, modulesSetForTargetVersion, method);

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
    packages,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryNeeded,
  };
}

export const resolve = createMetaResolver(builtInDefinitions);
