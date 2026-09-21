import entries from '@core-js/compat/entries' with { type: 'json' };
import builtInDefinitions from '@core-js/compat/built-in-definitions' with { type: 'json' };
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';
import getEntriesListForTargetVersion from '@core-js/compat/get-entries-list-for-target-version';
import getModulesListForTargetVersion from '@core-js/compat/get-modules-list-for-target-version';
import { createRequire } from 'node:module';
import { HELPER_CANON_ENTRIES } from './detect-usage/globals.js';
import { POSSIBLE_GLOBAL_OBJECTS } from './helpers/ast-patterns.js';
import { brand, wrapWithCause } from './helpers/error-tag.js';
import { isEntryPattern, isModulePattern, patternToRegExp, safeErrorMessage, validatePatternList } from './helpers/pattern-matching.js';
import { WINDOWS_UNC_PREFIX_RE, canonicalisePackage, stripQueryHash } from './helpers/path-normalize.js';
import { VALID_MODES, expectEnum, validatePackageShape } from './plugin-options/validate.js';

const { hasOwn } = Object;
const { globals, statics, instance } = builtInDefinitions;

// the built-in definitions are the one table every question in this module reads, so the meta
// resolver reads them where they are: the static own-key test is `hasOwnStaticDefinition` below,
// spelled once for the resolver and its callers alike
export function resolve(meta) {
  if (meta.kind === 'global') {
    if (!hasOwn(globals, meta.name)) return undefined;
    return { kind: 'global', desc: globals[meta.name], name: meta.name };
  }
  if (meta.kind === 'property' || meta.kind === 'in') {
    const { placement, object, key } = meta;
    if (placement === 'static' && POSSIBLE_GLOBAL_OBJECTS.has(object) && hasOwn(globals, key)) {
      return { kind: 'global', desc: globals[key], name: key };
    }
    if (placement === 'static' && hasOwnStaticDefinition(object, key)) {
      return { kind: 'static', desc: statics[object][key], name: `${ object }$${ key }` };
    }
    // a `key in <namespace>` membership test with a STATIC-placement receiver is true ONLY for
    // the receiver's own statics/globals, resolved just above. instance (prototype) methods are
    // never own properties of the constructor/global, so a static-receiver `in` must NOT fall
    // through to the placement-agnostic instance map: that resolves `'flat' in Array` to the
    // `Array.prototype.flat` desc and folds the `in` to a wrong `true` (native: false). an
    // INSTANCE presence probe (`'flat' in []` - the prototype-placement carrier) DOES consult
    // it: usage-global injects so the probe yields native parity, and usage-pure noops on the
    // null-object meta before its fold. a member ACCESS (`kind: 'property'`, e.g. `Array.name`)
    // is different - the receiver-type narrowing in `enhanceMeta` keeps genuinely-present
    // Function.prototype members and drops prototype-only ones
    if (meta.kind === 'in' && meta.placement !== 'prototype') return undefined;
    // an exhaustively-enumerated receiver alias with no instance-capable value (the union
    // choke's verdict): its static rows carry the injection - the placement-agnostic
    // instance fallback would fabricate variants the receiver provably never dispatches
    // (`let O = null; O ||= Object; 'entries' in O` pulled es.array.entries + web.dom-*)
    if (meta.receiverInstanceFree) return undefined;
    if (!hasOwn(instance, key)) return undefined;
    const desc = instance[key];
    if (desc) return { kind: 'instance', desc, name: key };
  }
  return undefined;
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

// the lists arrive validated (`validatePatternList`): arrays of patterns, or absent
function collectEntryPaths(patterns) {
  const result = new Set();
  for (const pattern of patterns ?? []) {
    if (isEntryPattern(pattern)) result.add(normalizeEntryPath(pattern));
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
export function normalizeImportPath(path) {
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

// `entriesAtMode`: the entries the configured layer ships, in the canonical include/exclude spelling
function validateIncludeExclude({ include, exclude, modules, method, mode, entriesAtMode }) {
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
      // an included entry is imported from the configured layer, so it has to exist THERE: a
      // proposal the `full` layer alone carries would be imported from a file `actual` does not
      // ship, and the bundler fails to resolve it. an excluded one absent there is a no-op, which
      // the module patterns already report as "matched nothing"
      const unavailable = $entries.filter(p => !entriesAtMode.has(normalizeEntryPath(p)));
      if (unavailable.length) errors.push(formatError(`The following "${ label }" entry paths are not available at mode: '${ mode }'`, unavailable));
    }
  }
  // duplicate detection across include/exclude covers both module and entry patterns -
  // checking only modules would let `include: ['array/from']` + `exclude: ['array/from']`
  // silently let exclude win; entry duplicates get the same "matched by both" error
  if (cleaned.include?.length && cleaned.exclude?.length) {
    const duplicates = cleaned.include.filter(p => {
      if (p instanceof RegExp) return cleaned.exclude.some(e => e instanceof RegExp && e.source === p.source && e.flags === p.flags);
      return cleaned.exclude.includes(p);
    });
    if (duplicates.length) {
      errors.push(formatError('The following polyfills were matched both by "include" and "exclude" patterns', duplicates));
    }
  }
  if (errors.length) throw new Error(brand(`error while validating provider options:\n${ errors.join('') }`));
}

const require = createRequire(import.meta.url);

// the installed version, read off whichever of the two packages the project carries: a usage-pure
// project need not install `core-js` at all, and `@core-js/pure` ships the same version. with
// neither installed the compat probe runs and raises its own diagnostic
function installedCoreJSVersion() {
  try {
    return require('core-js/package.json').version;
  } catch { /* not installed here */ }
  try {
    return require('@core-js/pure/package.json').version;
  } catch { /* not installed here */ }
  return 'node_modules';
}

// options assumed already validated by `initPluginOptions` in plugin-options.js;
// for direct callers without `initPluginOptions`, the first hard type check will surface a bug
// `targetsNeedPolyfill`: the targets' own verdict with no user filter in it (`buildTargetsNeedPolyfill`),
// which the helper entries are decided by; a direct caller without one needs everything
export function createPolyfillContext({
  method,
  mode,
  version,
  package: pkg,
  additionalPackages,
  include,
  exclude,
  shouldInjectPolyfill = () => true,
  targetsNeedPolyfill = () => true,
}) {
  // explicit `null` (common in conditional config spreads) skips destructuring defaults -
  // every nullable Options field must use `??=` to mirror the convention "null = same as
  // absent" advertised in `index.d.ts` (`version?: string | null` / `mode?: Mode | null` / ...)
  mode ??= 'actual';
  // the published surface: a caller bypassing `initPluginOptions` gets the validator's verdict on
  // a layer that ships nothing, not a context that quietly answers "no polyfill" to every question
  expectEnum('mode', VALID_MODES, mode);
  version ??= 'node_modules';

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

  // the compat normaliser raises its own diagnostics for a version it cannot use (no minor
  // component, a foreign major, no `core-js` in the project's `package.json`): user-facing, so they
  // leave branded like every other option verdict
  try {
    version = normalizeCoreJSVersion(version === 'node_modules' ? installedCoreJSVersion() : version);
  } catch (error) {
    throw wrapWithCause(`invalid \`version\` option: ${ safeErrorMessage(error) }`, error);
  }

  // canonicalised like every package name below (`canonicalisePackage`), so the emitted import
  // paths and the entry detection agree on one spelling
  pkg = canonicalisePackage(pkg);
  // dedup: users sometimes list the main `pkg` inside `additionalPackages` or repeat an alias.
  // Set preserves first-match order - hot-loop in `getCoreJSEntry` hits main pkg first
  const packages = [...new Set([pkg, ...additionalPackages ?? []]
    .map(p => canonicalisePackage(p.toLowerCase())))];
  const entriesSetForTargetVersion = new Set(getEntriesListForTargetVersion(version));
  const modulesSetForTargetVersion = new Set(getModulesListForTargetVersion(version));
  const modulesForEntryCache = new Map();

  const entriesAtMode = new Set();
  for (const key of entriesSetForTargetVersion) {
    if (key.startsWith(`${ mode }/`)) entriesAtMode.add(normalizeEntryPath(key));
  }

  // semantic check (do patterns match any known module for the target version, do entry paths
  // exist at the configured mode?) runs in createPolyfillContext rather than initPluginOptions
  // because both sets are version-derived and not available at options-parsing time.
  // `buildShouldInjectPolyfill` already ran in initPluginOptions but returns a lazy fn - no
  // observable behavior depends on this order, so the split is acceptable
  validateIncludeExclude({ include, exclude, modules: modulesSetForTargetVersion, method, mode, entriesAtMode });

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

  // Syntax-lowering helpers have no polyfill modules. They need an entry in the selected
  // package version even when every native polyfill is filtered by targets or exclusions.
  function isEntryAvailable(entry) {
    return entriesSetForTargetVersion.has(`${ mode }/${ entry || 'index' }`);
  }

  // filter precedence convention: `exclude` wins over `include` over targets-default.
  // mirrors `buildShouldInjectPolyfill` in `plugin-options/targets.js` for module-level
  // filtering. flipping one without the other would desync - change both sites in lockstep.
  // an included entry exists at the configured mode by validation (`validateIncludeExclude`),
  // so the include branch needs no existence gate of its own; the entry-path sets hold only
  // canonical spellings, so the canonical form is the one to ask.
  // `HELPER_CANON_ENTRIES` (the emit-canon `$helper` entries, single-sourced next to their
  // detect-side resolvers) cannot be DROPPED by a user filter: neither the entry-path nor the
  // module form of `exclude` may flip the canonical emit to a raw static-symbol read - the
  // helper wraps native lookups and stays correct with its polyfill modules filtered. a filter
  // may still ADD one (an include forces substitution beyond the targets, in this channel as in
  // every other), so the helper is needed when its entry is included, when a module of its is
  // injected, or when the targets alone need one - and only targets needing none of them
  // (nothing to polyfill at all) drop the emit and keep the raw source
  function isEntryNeeded(entry) {
    if (isEntryNeededCache.has(entry)) return isEntryNeededCache.get(entry);
    const normalized = normalizeEntryPath(entry);
    const modeEntry = `${ mode }/${ entry }`;
    let result;
    if (HELPER_CANON_ENTRIES.has(entry)) {
      result = entriesSetForTargetVersion.has(modeEntry) && (includeEntries.has(normalized)
        || entries[modeEntry].some(mod => {
          const resolved = resolveModule(mod);
          return resolved !== null && (targetsNeedPolyfill(resolved) || shouldInjectPolyfill(resolved));
        }));
    } else if (excludeEntries.has(normalized)) result = false;
    else if (includeEntries.has(normalized)) result = true;
    else result = entriesSetForTargetVersion.has(modeEntry) && !!getModulesForEntry(modeEntry).length;
    isEntryNeededCache.set(entry, result);
    return result;
  }

  return {
    mode,
    pkg,
    packages,
    getModulesForEntry,
    getCoreJSEntry,
    isEntryAvailable,
    isEntryNeeded,
  };
}

// whether `key` is <object>'s OWN static in the definitions. such a static's module defines /
// patches the receiver global itself (directly or through its compat dependency chain), so
// injecting it guarantees the receiver exists at runtime; a generic-hint resolution
// (`Promise.name` -> Function.prototype.name) carries no such guarantee
export function hasOwnStaticDefinition(object, key) {
  return hasOwn(statics, object) && hasOwn(statics[object], key);
}

const STATIC_DEFINITION_KEYS = new Set(Object.values(statics).flatMap(Object.keys));

// Whether any built-in owns this static key. Receiver-family analysis cannot add a static
// for an absent key; unknown or branching keys still need their ordinary conservative path.
export function hasStaticDefinitionKey(key) {
  return STATIC_DEFINITION_KEYS.has(key);
}

const CONSTRUCTOR_TAIL = '/constructor';

// A constructor entry can widen to its whole static family; a namespace alone cannot.
// Pure is the default; the global flavor can additionally supply unsupported pure constructors.
export function hasConstructorEntry(name, flavor = 'pure') {
  return globals[name]?.[flavor]?.dependencies?.some(entry => entry.endsWith(CONSTRUCTOR_TAIL)) ?? false;
}

// entry heads mapped to their globals, in one pass over the pure dependencies of the globals and
// the statics; the first owner wins
function buildEntryHintIndex() {
  const index = new Map();
  function addOwner(name, deps) {
    if (!Array.isArray(deps)) return;
    for (const dep of deps) {
      if (typeof dep !== 'string') continue;
      const [head] = dep.split('/', 1);
      if (head && !index.has(head)) index.set(head, name);
    }
  }
  for (const [name, desc] of Object.entries(globals)) addOwner(name, desc?.pure?.dependencies);
  for (const [name, methods] of Object.entries(statics)) {
    for (const desc of Object.values(methods)) addOwner(name, desc?.pure?.dependencies);
  }
  return index;
}

const entryHintIndex = buildEntryHintIndex();

// Name the global supplied by a namespace or constructor entry. Method, instance and helper
// subpaths supply another value, so reject them before looking up the entry head.
export function entryToGlobalHint(entry) {
  if (!entry) return null;
  const canonical = entry.endsWith(CONSTRUCTOR_TAIL) ? entry.slice(0, -CONSTRUCTOR_TAIL.length) : entry;
  return canonical.includes('/') ? null : entryHintIndex.get(canonical) ?? null;
}
