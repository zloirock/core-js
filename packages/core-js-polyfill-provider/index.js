import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import { POSSIBLE_GLOBAL_OBJECTS } from './helpers/class-walk.js';
import { isEntryPattern, isModulePattern, patternToRegExp, validatePatternList } from './helpers/pattern-matching.js';
import { WINDOWS_UNC_PREFIX_RE, lookupEntryModules, stripQueryHash } from './helpers/path-normalize.js';
import { validatePackageShape } from './plugin-options/validate.js';

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
function stripLeadingPrefix(p) {
  if (p.startsWith('file://')) return p.slice(7);
  if (p.startsWith('./')) return p.slice(2);
  return p;
}

// normalize the import source to a canonical entry path so we can look it up in the `entries`
// map: forward slashes only, no query/hash, no protocol, no trailing `/index` or `.{c,m}js`.
// pipeline split between query/backslash normalisation (pre-strip), prefix strip, and the
// remaining UNC/slash-collapse/lowercase pass: slash-collapse must run AFTER stripLeadingPrefix
// because `file://` would otherwise collapse to `file:/` and miss the prefix matcher
function normalizeImportPath(path) {
  if (typeof path != 'string') return null;
  const queryless = stripQueryHash(path).replaceAll('\\', '/');
  const stripped = stripLeadingPrefix(queryless);
  const canonical = stripped.replace(WINDOWS_UNC_PREFIX_RE, '').replaceAll(/\/{2,}/g, '/').toLowerCase();
  // accept `.js`, `.mjs`, `.cjs` - `import 'core-js/actual/array/at.mjs'` should resolve like `.js`
  return canonical.replace(/(?:\/(?:index)?)?(?:\.[cm]?js)?$/i, '');
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

function validateIncludeExclude({ include, exclude, modules, method }) {
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  if (!include && !exclude) return;
  const errors = [];
  // single pass per list: split malformed regex strings away so later checks don't
  // re-report them as "didn't match any polyfill" / "entry-path only with usage-pure"
  const cleaned = { include: null, exclude: null };
  for (const [label, patterns] of [['include', include], ['exclude', exclude]]) {
    if (!patterns?.length) continue;
    const malformed = [];
    const clean = [];
    for (const p of patterns) {
      if (typeof p === 'string' && !patternToRegExp(p)) malformed.push(p);
      else clean.push(p);
    }
    if (malformed.length) errors.push(formatError(`The following "${ label }" patterns are not valid regex source`, malformed));
    cleaned[label] = clean;
    const unusedModules = clean.filter(isModulePattern).filter(p => !patternMatches(p, modules));
    if (unusedModules.length) errors.push(formatError(`The following "${ label }" patterns didn't match any polyfill`, unusedModules));
    const $entries = clean.filter(isEntryPattern);
    // entry-path include/exclude only makes sense for the pure variant where the entry IS
    // the import unit; in global modes a single entry would force-inject hundreds of modules
    if ($entries.length && method !== 'usage-pure') {
      errors.push(formatError(`Entry-path patterns in "${ label }" are only allowed with method: 'usage-pure'`, $entries));
    } else {
      const unusedEntries = $entries.filter(p => !lookupEntryModules(p));
      if (unusedEntries.length) errors.push(formatError(`The following "${ label }" entry paths didn't match any polyfill`, unusedEntries));
    }
  }
  // duplicate detection across include/exclude covers both module and entry patterns -
  // historically only modules were checked, so `include: ['array/from']` + `exclude: ['array/from']`
  // silently let exclude win. entry duplicates get the same "matched by both" error now
  if (cleaned.include?.length && cleaned.exclude?.length) {
    const duplicates = cleaned.include.filter(p => {
      if (p instanceof RegExp) return cleaned.exclude.some(e => e instanceof RegExp && e.source === p.source && e.flags === p.flags);
      return cleaned.exclude.includes(p);
    });
    if (duplicates.length) {
      errors.push(formatError('The following polyfills were matched both by "include" and "exclude" patterns', duplicates));
    }
  }
  if (errors.length) throw new Error(`[core-js] error while validating provider options:\n${ errors.join('') }`);
}

// options assumed already validated by `initPluginOptions` in plugin-options.js;
// for direct callers without `initPluginOptions`, the first hard type check will surface a bug
export function createPolyfillContext({
  method,
  mode,
  version,
  package: pkg,
  additionalPackages,
  include,
  exclude,
  shippedProposals = false,
  shouldInjectPolyfill = () => true,
}) {
  // explicit `null` (common in conditional config spreads) skips destructuring defaults -
  // every nullable Options field must use `??=` to mirror the convention "null = same as
  // absent" advertised in `index.d.ts` (`version?: string | null` / `mode?: Mode | null` / ...)
  mode ??= 'actual';
  version ??= 'node_modules';
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  const includeEntries = method === 'usage-pure' ? collectEntryPaths(include) : new Set();
  const excludeEntries = method === 'usage-pure' ? collectEntryPaths(exclude) : new Set();

  pkg ??= method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  // defensive: third-party callers that bypass `initPluginOptions` may pass `pkg === ''` /
  // `'/'` / non-string. without this guard `''.toLowerCase()` succeeds, the canonicaliser
  // returns `''`, and downstream `getCoreJSEntry` would treat absolute paths as core-js
  // entries (`'/foo/bar'.startsWith('/' === pkg + '/')` false-positive). shares
  // `validatePackageShape` with `validateOptions` so direct callers get the identical
  // per-index label + `formatReceived` diagnostic instead of a divergent error wording
  validatePackageShape(pkg, additionalPackages);

  version = normalizeCoreJSVersion(version);

  // dedup: users sometimes list the main `pkg` inside `additionalPackages` or repeat an alias.
  // Set preserves first-match order - hot-loop in `getCoreJSEntry` hits main pkg first.
  // strip trailing slashes: `getCoreJSEntry` joins via `${pkg}/` so `'my-core-js/'` would yield
  // `'my-core-js//foo'` (double slash) and silently miss every entry detection. apply to `pkg`
  // too (not just packages-array members) so emitted import paths stay clean: injector-base
  // joins via `resolveImportPath(this.pkg, subpath)` which would otherwise produce
  // `'@core-js/pure///actual/array/from'` from `package: '@core-js/pure///'`.
  // also collapse interior `//` runs: `normalizeImportPath` canonicalises sources with
  // slash-collapse, so a package name `'my//core-js'` would silently never match its own
  // normalised imports
  function canonicalisePackage(p) {
    const collapsed = p.replaceAll(/\/{2,}/g, '/');
    let end = collapsed.length;
    while (end > 0 && collapsed[end - 1] === '/') end--;
    return end === collapsed.length ? collapsed : collapsed.slice(0, end);
  }

  pkg = canonicalisePackage(pkg);
  const packages = [...new Set([pkg, ...additionalPackages ?? []]
    .map(p => canonicalisePackage(p.toLowerCase())))];
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  // semantic check (do patterns match any known module for the target version?) runs in
  // createPolyfillContext rather than initPluginOptions because `modulesSetForTargetVersion`
  // is target-derived and not available at options-parsing time. `buildShouldInjectPolyfill`
  // already ran in initPluginOptions but returns a lazy fn - no observable behavior depends
  // on this order, so the split is acceptable
  validateIncludeExclude({ include, exclude, modules: modulesSetForTargetVersion, method });

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

  // filter precedence convention: `exclude` wins over `include` over targets-default.
  // mirrors `buildShouldInjectPolyfill` in `plugin-options/targets.js` for module-level
  // filtering. flipping one without the other would desync - change both sites in lockstep
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

// `<entry head>` -> `<global name>`. one pass over pure-bearing entries in
// `built-in-definitions`; per-class kebab heads in `*.pure.dependencies` make each
// head unique to one global, so first hit wins. multi-segment entries are method /
// instance / helper paths (`array/from`, `array/instance/at`) - user's binding is the
// function, not the class - so `entryToGlobalHint` filters them out before lookup
const CONSTRUCTOR_TAIL = '/constructor';

function * iterPureDeps({ globals, statics }) {
  for (const [name, desc] of Object.entries(globals)) yield [name, desc?.pure?.dependencies];
  for (const [name, methods] of Object.entries(statics)) {
    for (const desc of Object.values(methods)) yield [name, desc?.pure?.dependencies];
  }
}

function buildEntryHintIndex(definitions) {
  const index = new Map();
  for (const [name, deps] of iterPureDeps(definitions)) {
    if (!Array.isArray(deps)) continue;
    for (const dep of deps) {
      if (typeof dep !== 'string') continue;
      const [head] = dep.split('/');
      if (head && !index.has(head)) index.set(head, name);
    }
  }
  return index;
}

const entryHintIndex = buildEntryHintIndex(builtInDefinitions);

export function entryToGlobalHint(entry) {
  if (!entry) return null;
  const canonical = entry.endsWith(CONSTRUCTOR_TAIL) ? entry.slice(0, -CONSTRUCTOR_TAIL.length) : entry;
  return canonical.includes('/') ? null : entryHintIndex.get(canonical) ?? null;
}
