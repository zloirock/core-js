import entries from '@core-js/compat/entries' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';

const { hasOwn } = Object;

const TYPE_HINTS = new Set([
  'array',
  'asynciterator',
  'bigint',
  'boolean',
  'date',
  'domcollection',
  'function',
  'iterator',
  'number',
  'object',
  'promise',
  'regexp',
  'string',
  'symbol',
]);

// array/instance/at and array/prototype/at -> array/at
function normalizeEntryPath(entry) {
  return entry
    .replace('/instance/', '/')
    .replace('/prototype/', '/');
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

function removeEntryPaths(patterns) {
  if (!Array.isArray(patterns)) return patterns;
  const filtered = patterns.filter(p => typeof p != 'string' || !hasOwn(entries, `full/${ p }`));
  return filtered.length ? filtered : undefined;
}

// skip core-js internals and bundles - polyfilling their own code creates circular dependencies
const CORE_JS_INTERNAL_FILE = /[/\\](?:core-js|core-js-pure|@core-js[/\\]pure)[/\\](?:internals|modules)[/\\]/;
const CORE_JS_BUNDLE = /[/\\](?:core-js-bundle|@core-js[/\\]bundle)[/\\]/;

function isCoreJSFile(filename) {
  return CORE_JS_INTERNAL_FILE.test(filename) || CORE_JS_BUNDLE.test(filename);
}

function normalizeImportPath(path) {
  return typeof path != 'string' ? null : path
    .replaceAll('\\', '/')
    .replace(/(?:\/(?:index)?)?(?:\.js)?$/i, '')
    .toLowerCase();
}

function getDependencies(desc) {
  if (typeof desc === 'string') return [desc];
  if (Array.isArray(desc)) return desc;
  return desc?.dependencies;
}

function descHasTypeHints(desc) {
  for (const hint of TYPE_HINTS) if (hasOwn(desc, hint)) return true;
  return false;
}

function resolveHint(desc, meta) {
  const { placement, object, excludedHints, includedHints } = meta;
  const hint = object === null || object === undefined ? null : String(object).toLowerCase();

  if (placement === 'prototype' && TYPE_HINTS.has(hint)) {
    if (hasOwn(desc, hint)) return desc[hint];
    if (hasOwn(desc, 'rest')) return desc.rest;
    return descHasTypeHints(desc) ? null : hasOwn(desc, 'common') ? desc.common : null;
  }

  // when hints are filtered by type guards, skip common and use type-specific entries
  if (!excludedHints && !includedHints && hasOwn(desc, 'common')) return desc.common;

  // merge type hint dependencies, skipping filtered hints
  const hintDescs = [];
  for (const $hint of TYPE_HINTS) {
    if (excludedHints?.has($hint)) continue;
    if (includedHints && !includedHints.has($hint)) continue;
    if (hasOwn(desc, $hint)) hintDescs.push(desc[$hint]);
  }
  // with whitelist: include rest only if some included hint has no explicit desc entry
  // with blacklist or no filter: always include rest (conservative)
  if (hasOwn(desc, 'rest') && (!includedHints || [...includedHints].some($hint => !hasOwn(desc, $hint)))) {
    hintDescs.push(desc.rest);
  }

  if (hintDescs.length === 1) return hintDescs[0];

  if (hintDescs.length > 1) {
    const dependencies = [...new Set(hintDescs.flatMap(d => getDependencies(d) ?? []))];
    return dependencies.length ? { dependencies } : null;
  }

  return null;
}

function pureImportName(kind, name, importEntry) {
  if (kind !== 'instance') return name;
  const match = importEntry.match(/^(?<type>[^/]+)\/instance\//);
  return match
    ? `${ name }Maybe${ match.groups.type.replaceAll(/(?:^|-)(?<char>\w)/g, (_, char) => char.toUpperCase()) }`
    : name;
}

const DIRECTIVE = /^\s*core-js-disable-(?<kind>file|line|next-line)(?:\s+--|\s*$)/;

function parseDisableDirectives(comments, code) {
  if (!comments) return null;
  // When comments lack .loc (e.g., oxc-parser), compute line numbers from offsets
  const getLine = code ? offset => {
    let line = 1;
    for (let i = 0; i < offset; i++) if (code[i] === '\n') line++;
    return line;
  } : null;
  const lines = new Set();
  for (const comment of comments) {
    const match = comment.value.match(DIRECTIVE);
    if (!match) continue;
    const { kind } = match.groups;
    if (kind === 'file') return true;
    const startLine = comment.loc ? comment.loc.start.line : getLine(comment.start);
    const endLine = comment.loc ? comment.loc.end.line : startLine;
    if (kind === 'line') lines.add(startLine);
    else lines.add(endLine + 1); // next-line
  }
  return lines.size ? lines : null;
}

// Creates a stateful polyfill context for a given set of options.
// Encapsulates module resolution, entry resolution, and caching.
function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;
  try {
    return new RegExp(`^${ pattern }$`);
  } catch {
    return null;
  }
}

function patternMatches(pattern, modules) {
  const re = patternToRegExp(pattern);
  if (!re) return false;
  for (const m of modules) if (re.test(m)) return true;
  return false;
}

function isModulePattern(pattern) {
  // Module names have dots: es.array.at. Entry paths have slashes: array/at
  return typeof pattern === 'string' ? pattern.includes('.') || pattern.includes('*') : pattern instanceof RegExp;
}

function validateIncludeExclude(include, exclude, modules) {
  if (!include && !exclude) return;
  const errors = [];
  // Only validate module-name patterns, not entry-path patterns
  const moduleInclude = include?.filter(isModulePattern);
  const moduleExclude = exclude?.filter(isModulePattern);
  // Check for unused include patterns
  if (moduleInclude?.length) {
    const unused = moduleInclude.filter(p => !patternMatches(p, modules));
    if (unused.length) {
      errors.push(`  - The following "include" patterns didn't match any polyfill:\n    ${ unused.join('\n    ') }`);
    }
  }
  // Check for unused exclude patterns
  if (moduleExclude?.length) {
    const unused = moduleExclude.filter(p => !patternMatches(p, modules));
    if (unused.length) {
      errors.push(`  - The following "exclude" patterns didn't match any polyfill:\n    ${ unused.join('\n    ') }`);
    }
  }
  // Check for duplicate patterns (in both include and exclude)
  if (moduleInclude?.length && moduleExclude?.length) {
    const duplicates = moduleInclude.filter(p => {
      if (p instanceof RegExp) return moduleExclude.some(e => e instanceof RegExp && e.source === p.source && e.flags === p.flags);
      return moduleExclude.includes(p);
    });
    if (duplicates.length) {
      errors.push(`  - The following polyfills were matched both by "include" and "exclude" patterns:\n    ${ duplicates.join('\n    ') }`);
    }
  }
  if (errors.length) {
    throw new Error(`Error while validating the "core-js@4" provider options:\n${ errors.join('\n') }`);
  }
}

function createPolyfillContext({
  method, mode = 'actual', version = '4.0', package: pkg, additionalPackages,
  include, exclude, shippedProposals = false, shouldInjectPolyfill, validate,
}) {
  if (!['entry-global', 'usage-global', 'usage-pure'].includes(method)) throw new TypeError('Incorrect plugin method');
  if (!['es', 'stable', 'actual', 'full'].includes(mode)) throw new TypeError('Incorrect plugin mode');
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  // for usage-pure: extract entry-path patterns from include/exclude
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

  if (typeof shouldInjectPolyfill !== 'function') shouldInjectPolyfill = () => true;

  version = normalizeCoreJSVersion(version);

  const packages = additionalPackages ? [pkg, ...additionalPackages] : [pkg];
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  // Validate include/exclude patterns against available polyfills
  // Skip when called from Babel plugin (provider handles its own validation)
  if (validate !== false) validateIncludeExclude(include, exclude, modulesSetForTargetVersion);

  // es. -> esnext. fallback for backward compatibility with older core-js versions
  // where the module was still a proposal
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

  function isEntryNeeded(entry) {
    const normalized = normalizeEntryPath(entry);
    if (excludeEntries.has(entry) || excludeEntries.has(normalized)) return false;
    if (includeEntries.has(entry) || includeEntries.has(normalized)) return true;
    const modeEntry = `${ mode }/${ entry }`;
    return entriesSetForTargetVersion.has(modeEntry) && !!getModulesForEntry(modeEntry).length;
  }

  // Return filtered include/exclude (with entry paths removed) for passing to provider
  const filteredInclude = includeEntries.size ? removeEntryPaths(include) : include;
  const filteredExclude = excludeEntries.size ? removeEntryPaths(exclude) : exclude;

  return {
    mode,
    version,
    pkg,
    packages,
    resolveModule,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryNeeded,
    filteredInclude,
    filteredExclude,
  };
}

function validateImportStyle(importStyle) {
  if (importStyle !== undefined && importStyle !== 'import' && importStyle !== 'require') {
    throw new TypeError("`importStyle` should be 'import' or 'require'");
  }
}

function resolveImportStyle(importStyle, sourceType) {
  return importStyle ?? (sourceType === 'script' ? 'require' : 'import');
}

export {
  TYPE_HINTS,
  normalizeEntryPath,
  normalizeImportPath,
  isCoreJSFile,
  getDependencies,
  descHasTypeHints,
  collectEntryPaths,
  removeEntryPaths,
  resolveHint,
  pureImportName,
  DIRECTIVE,
  parseDisableDirectives,
  createPolyfillContext,
  validateImportStyle,
  resolveImportStyle,
};
