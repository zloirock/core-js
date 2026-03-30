import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import { TYPE_HINTS } from './resolve-node-type.js';

const { hasOwn } = Object;

const POSSIBLE_GLOBAL_OBJECTS = new Set([
  'global',
  'globalThis',
  'self',
  'window',
]);

function createMetaResolver({ global: globals, static: statics, instance }) {
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

// High-level polyfill resolver — encapsulates the "what to polyfill" logic.
// Plugins handle "how to inject" (Babel AST manipulation vs magic-string).
function createPolyfillResolver({
  // polyfill context options
  method, mode, version, package: pkg, additionalPackages,
  include, exclude, shippedProposals, shouldInjectPolyfill, validate,
  // AST type inference callbacks (from createResolveNodeType)
  resolvePropertyObjectType, resolveGuardHints, toHint, isString, isObject,
  // AST predicates — minimal set needed by resolution logic
  isMemberLike, // (path) => bool — is MemberExpression or OptionalMemberExpression
  isCallee, // (node, parent) => bool — is node the callee of a call/new
  isSpreadElement, // (node) => bool
}) {
  const ctx = createPolyfillContext({
    method, mode, version, package: pkg, additionalPackages,
    include, exclude, shippedProposals, shouldInjectPolyfill, validate,
  });

  const resolve = createMetaResolver({
    global: builtInDefinitions.Globals,
    static: builtInDefinitions.StaticProperties,
    instance: builtInDefinitions.InstanceProperties,
  });

  function enhanceMeta(meta, path, desc) {
    if (!meta) return meta;
    if (meta.object !== null && meta.object !== undefined
      && meta.placement === 'prototype' && TYPE_HINTS.has(String(meta.object).toLowerCase())) return meta;
    const hint = toHint(resolvePropertyObjectType(path));
    if (hint) {
      if (TYPE_HINTS.has(hint)) return { ...meta, object: hint, placement: 'prototype' };
      return descHasTypeHints(desc) ? null : meta;
    }
    if (isMemberLike(path) && descHasTypeHints(desc)) {
      const hints = resolveGuardHints(path.get('object'));
      if (hints) return { ...meta, ...hints };
    }
    return meta;
  }

  function filter(name, args, path) {
    const { node } = path;
    const parent = path.parentPath?.node ?? path.parent;
    if (!isCallee(node, parent)) return false;
    switch (name) {
      case 'min-args': {
        const [length] = args;
        if (parent.arguments.length >= length) return false;
        return parent.arguments.every(arg => !isSpreadElement(arg));
      }
      case 'arg-is-string':
      case 'arg-is-object': {
        const [index] = args;
        if (parent.arguments.length < index + 1) return false;
        if (parent.arguments.slice(0, index).some(arg => isSpreadElement(arg))) return false;
        const arg = path.parentPath.get('arguments')[index];
        return name === 'arg-is-string' ? isString(arg) : isObject(arg);
      }
    }
    return false;
  }

  function applyFilters(filters, path) {
    return !!filters?.some(([name, ...args]) => filter(name, args, path));
  }

  function resolvePureEntry(kind, desc, meta, path) {
    let target = desc;
    if (kind === 'instance') {
      target = resolveHint(desc, meta);
      if (target === null) return null;
    }
    if (applyFilters(target.filters, path)) return null;
    const dependencies = getDependencies(target);
    if (!dependencies?.length) return null;
    const [entry] = dependencies;
    if (!ctx.isEntryNeeded(entry) && !(target.guard && ctx.isEntryNeeded(target.guard))) return null;
    return entry;
  }

  return {
    ...ctx,

    // Resolve entry import to module list
    resolveEntry(source) {
      const entry = ctx.getCoreJSEntry(source);
      if (entry === null) return null;
      return { entry, modules: ctx.getModulesForEntry(entry) };
    },

    // Resolve usage-global meta to dependency entries
    resolveUsage(meta, path) {
      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'global')) return null;
      let { kind, desc: { global: desc } } = resolved;
      if (kind === 'instance') {
        const enhanced = enhanceMeta(meta, path, desc);
        if (!enhanced) return null;
        desc = resolveHint(desc, enhanced);
        if (!desc) return null;
      }
      const dependencies = getDependencies(desc);
      if (!dependencies?.length) return null;
      if (applyFilters(desc.filters, path)) return null;
      return dependencies;
    },

    // Resolve usage-pure meta to import entry
    resolvePure(meta, path) {
      const resolved = resolve(meta);
      if (!resolved || !hasOwn(resolved.desc, 'pure')) return null;
      const { kind, desc: { pure: desc } } = resolved;
      let effectiveMeta = meta;
      if (kind === 'instance') {
        effectiveMeta = enhanceMeta(meta, path, desc);
        if (!effectiveMeta) return null;
      }
      const entry = resolvePureEntry(kind, desc, effectiveMeta, path);
      if (!entry) return null;
      return {
        entry,
        kind,
        name: resolved.name,
        hintName: pureImportName(kind, resolved.name, entry),
        rawName: resolved.name,
      };
    },

    // Expose for direct access
    resolve,
    enhanceMeta,
    applyFilters,
    resolvePureEntry,
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
  POSSIBLE_GLOBAL_OBJECTS,
  isCoreJSFile,
  pureImportName,
  parseDisableDirectives,
  createPolyfillResolver,
  validateImportStyle,
  resolveImportStyle,
};
