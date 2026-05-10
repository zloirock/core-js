import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import { kebabToPascal } from './helpers/ast-patterns.js';
import { POSSIBLE_GLOBAL_OBJECTS } from './helpers/class-walk.js';
import { isEntryPattern, isModulePattern, patternToRegExp, validatePatternList } from './helpers/pattern-matching.js';
import { lookupEntryModules, normalizeImportSource } from './helpers/path-normalize.js';

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
// map: forward slashes only, no query/hash, no protocol, no trailing `/index` or `.{c,m}js`.
// `normalizeImportSource` does all the cross-cutting work (stripQueryHash + backslash-replace
// + UNC strip + slash-collapse + lowercase); only the protocol / extension / `/index` cleanup
// is plugin-specific and stays here
function normalizeImportPath(path) {
  if (typeof path != 'string') return null;
  const withoutPrefix = stripLeadingPrefix(normalizeImportSource(path));
  // accept `.js`, `.mjs`, `.cjs` - `import 'core-js/actual/array/at.mjs'` should resolve like `.js`
  return withoutPrefix.replace(/(?:\/(?:index)?)?(?:\.[cm]?js)?$/i, '');
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
  version = 'node_modules',
  package: pkg,
  additionalPackages,
  include,
  exclude,
  shippedProposals = false,
  shouldInjectPolyfill = () => true,
}) {
  // explicit `null` (common in conditional config spreads) skips the destructuring default;
  // leaving it unmodified makes `null/<entry>` miss the polyfill map and drop all polyfills
  mode ??= 'actual';
  if (shippedProposals && ['es', 'stable'].includes(mode)) mode = 'actual';

  const includeEntries = method === 'usage-pure' ? collectEntryPaths(include) : new Set();
  const excludeEntries = method === 'usage-pure' ? collectEntryPaths(exclude) : new Set();

  if (pkg === undefined) pkg = method === 'usage-pure' ? '@core-js/pure' : 'core-js';
  // defensive: third-party callers that bypass `initPluginOptions` may pass `pkg === ''` /
  // `'/'` / non-string. without this guard `''.toLowerCase()` succeeds, `stripTrailingSlashes`
  // returns `''`, and downstream `getCoreJSEntry` would treat absolute paths as core-js entries
  // (`'/foo/bar'.startsWith('/' === pkg + '/')` false-positive). validateOptions enforces this
  // shape but only when called - direct createPolyfillContext callers need their own check
  // shape guard for direct callers bypassing validateOptions. applies to `pkg` AND each
  // `additionalPackages` member - empty / slash-only entries cascade through `packages`
  // and false-positive every absolute path in `getCoreJSEntry`'s `startsWith('/')` check
  const isInvalidPkgShape = p => typeof p !== 'string' || p === '' || /^\/+$/.test(p);
  if (isInvalidPkgShape(pkg)) {
    throw new TypeError(`[core-js] \`package\` option must be a non-empty, non-slash-only string; received ${ JSON.stringify(pkg) }`);
  }
  if (additionalPackages?.some(isInvalidPkgShape)) {
    throw new TypeError(`[core-js] \`additionalPackages\` entries must be non-empty, non-slash-only strings; received ${ JSON.stringify(additionalPackages) }`);
  }

  version = normalizeCoreJSVersion(version);

  // dedup: users sometimes list the main `pkg` inside `additionalPackages` or repeat an alias.
  // Set preserves first-match order - hot-loop in `getCoreJSEntry` hits main pkg first.
  // strip trailing slashes: `getCoreJSEntry` joins via `${pkg}/` so `'my-core-js/'` would yield
  // `'my-core-js//foo'` (double slash) and silently miss every entry detection. apply to `pkg`
  // too (not just packages-array members) so emitted import paths stay clean: injector-base
  // joins via `resolveImportPath(this.pkg, subpath)` which would otherwise produce
  // `'@core-js/pure///actual/array/from'` from `package: '@core-js/pure///'`
  const stripTrailingSlashes = p => {
    let end = p.length;
    while (end > 0 && p[end - 1] === '/') end--;
    return end === p.length ? p : p.slice(0, end);
  };
  pkg = stripTrailingSlashes(pkg);
  const packages = [...new Set([pkg, ...additionalPackages ?? []]
    .map(p => stripTrailingSlashes(p.toLowerCase())))];
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  // semantic check (do patterns match any known module for the target version?) runs in
  // createPolyfillContext rather than initPluginOptions because `modulesSetForTargetVersion`
  // is target-derived and not available at options-parsing time. `buildShouldInjectPolyfill`
  // already ran in initPluginOptions but returns a lazy fn - no observable behavior depends
  // on this order, so the split is acceptable
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

// reverse map `<head>` -> `<global name>` for entry-path canonical heads. keys an
// injector-side hint lookup so acronym / mixed-case globals (`URL`, `JSON`, `RegExp`,
// `URIError`, `DOMException`, ...) and bare function-globals (`atob`, `parseInt`,
// `globalThis`, `structuredClone`, ...) survive `super.X` back-mapping that would
// otherwise fall through `kebabToPascal` (`url` -> `Url`, `json` -> `Json`, `regexp` ->
// `Regexp`, `parse-int` -> `ParseInt`).
// data-driven: one scan over `globals` + `statics`. for `statics`-only owners (Array,
// JSON, Math, Number, Object, Reflect, RegExp, String, Error) the `head === lower(name)`
// guard rejects shared heads - Error subclasses all have `error/is-error` deps, but only
// `Error` itself owns head `error`. Non-matching subclasses fall back to
// `deriveHintFromKebab` (`eval-error` -> `EvalError`). globals don't need the guard
// because each pure-bearing global has its own kebab namespace
const CONSTRUCTOR_TAIL = '/constructor';
function buildEntryHintIndex({ globals, statics }) {
  const index = new Map();
  const register = (name, deps, requireMatch) => {
    if (!Array.isArray(deps)) return;
    const lower = requireMatch ? name.toLowerCase() : null;
    for (const dep of deps) {
      if (typeof dep !== 'string') continue;
      const [head] = dep.split('/');
      if (head && !index.has(head) && (!requireMatch || head === lower)) index.set(head, name);
    }
  };
  for (const [name, desc] of Object.entries(globals)) register(name, desc?.pure?.dependencies, false);
  for (const [name, methods] of Object.entries(statics)) {
    for (const desc of Object.values(methods)) register(name, desc?.pure?.dependencies, true);
  }
  return index;
}

const entryHintIndex = buildEntryHintIndex(builtInDefinitions);

// kebab-style derivation for entries the index intentionally skips: globals that host
// pure static methods but have no pure constructor in `built-in-definitions` (Array,
// JSON, Math, Number, Object, Reflect, RegExp, String, all Error subclasses). their
// names are kebab-friendly with no acronyms, so `kebabToPascal(head)` produces the
// correct global. method / instance / helper entries (`promise/try`, `array/from`,
// `array/instance/at`, ...) return null: the user's binding is the function, not the
// class, so mapping to a global would make `super.X` on `class extends MyMethod` get
// polyfilled as if MyMethod were the class - silently "fixing" broken user code the
// plugin has no business touching. numeric-leading segments (`42`) can't be real global
// identifiers; the uppercase-first guard rejects them
function deriveHintFromKebab(entry) {
  const [head, ...rest] = entry.split('/');
  if (rest.length && rest.at(-1) !== 'constructor') return null;
  const hint = kebabToPascal(head);
  return hint && hint[0] >= 'A' && hint[0] <= 'Z' ? hint : null;
}

// data-driven primary lookup via `entryHintIndex` covers acronym globals (`URL`,
// `URLSearchParams`, `DOMException`) that kebab derivation would mangle. fallback to
// `deriveHintFromKebab` resolves bare-class user imports for globals without pure ctor
// (whose pure surface is statics-only - Array.from, Math.cbrt, Object.assign, ...).
// `resolvePure`'s `hasOwn(desc, 'pure')` gate downstream is the last line of defence
// against fallback over-injection: hints for globals without any pure surface (Date,
// Function, Uint8Array, ...) resolve to a name whose `statics[name][key]` either misses
// or carries no pure variant, so no polyfill is emitted.
// explicit `<head>/constructor` imports collapse to bare `<head>` for the index lookup -
// `matchEntrySubpath` already strips `/index` and trailing slashes; `/constructor` is the
// one suffix the canonicaliser preserves, but for hint resolution it carries no extra info
export function entryToGlobalHint(entry) {
  if (!entry) return null;
  const canonical = entry.endsWith(CONSTRUCTOR_TAIL) ? entry.slice(0, -CONSTRUCTOR_TAIL.length) : entry;
  return entryHintIndex.get(canonical) ?? deriveHintFromKebab(canonical);
}
