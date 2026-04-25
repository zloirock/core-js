// this file mixes setup (option validation, target resolution, debug factory) with
// hot-path callbacks (`createUsageGlobalCallback`, `dispatch`). split is deferred:
// they share enough state (parsedTargets, debug, options) that splitting would force
// a larger context object across the boundary
import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import {
  isForXWriteTarget, isTSTypeOnlyIdentifierPath, patternToRegExp, safeStringify, symbolKeyToEntry, validatePatternList,
} from './helpers.js';

const { hasOwn, keys, entries, fromEntries } = Object;

// canonical polyfill ordering based on compat data registry
const polyfillOrder = new Map(keys(compatData).map((k, i) => [k, i]));

// sort module names by canonical compat data order. unknown entries (Infinity order) fall
// through to lexicographic secondary sort so the output order stays deterministic even when
// the registry hasn't been updated with every future proposal - `Infinity - Infinity = NaN`
// otherwise poisoned the comparator and left relative order undefined
export function sortByPolyfillOrder(modules) {
  return [...modules].sort((a, b) => {
    const oa = polyfillOrder.get(a) ?? Infinity;
    const ob = polyfillOrder.get(b) ?? Infinity;
    if (oa !== ob && Number.isFinite(oa - ob)) return oa - ob;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

// JSON.stringify renders NaN/Infinity as `null` and Symbol/undefined/function as `undefined` -
// useless for type-mismatch diagnostics; use their native toString for the outliers.
// class instances serialize as plain `{…}` - prefix with constructor name so users distinguish
// `new Targets()` from `{ ie: 11 }` object-literal in the error.
// `safeStringify` (shared helper) wraps `JSON.stringify` in try/catch so circular structures
// and adversarial Proxy traps don't mask the primary option error with a stringify crash
function formatReceived(value) {
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') {
    // adversarial function with throwing `.name` getter - same defensive rationale as the
    // `.constructor?.name` try/catch below: don't let formatReceived throw a secondary error
    // while the primary option-type error is being built. also coerce through String() inside
    // try/catch to cover Symbol.toPrimitive on the `.name` result (adversarial Proxy)
    let fnName = null;
    try {
      const raw = value.name;
      fnName = typeof raw === 'string' ? raw : null;
    } catch { /* swallow */ }
    return `[Function${ fnName ? ` ${ fnName }` : '' }]`;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  // JSON.stringify throws on BigInt; formatting as `42n` keeps the option-type error
  // readable instead of degrading to `[Object]`
  if (typeof value === 'bigint') return `${ value }n`;
  if (value === undefined) return 'undefined';
  if (typeof value === 'object' && value !== null && !isPlainObject(value) && !Array.isArray(value)) {
    // adversarial Proxy may throw on `.constructor` access - defensive, so formatReceived
    // never throws a secondary error while we're already reporting the primary one
    let ctorName = null;
    try {
      ctorName = value.constructor?.name;
    } catch { /* swallow */ }
    return ctorName && ctorName !== 'Object' ? `[${ ctorName }] ${ safeStringify(value) }` : safeStringify(value);
  }
  return safeStringify(value);
}

function optionTypeError(name, expected, received) {
  return new TypeError(`\`${ name }\` must be ${ expected } (received ${ formatReceived(received) })`);
}

// `null`/`undefined` pass through so users can use conditional spreads to clear an option
const isEmpty = v => v === null || v === undefined;

// accepts `Object.create(null)` alongside `Object.prototype`-backed objects
function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

const VALID_METHODS = new Set(['entry-global', 'usage-global', 'usage-pure']);
const VALID_MODES = new Set(['es', 'stable', 'actual', 'full']);
const formatOptions = set => `one of ${ [...set].map(s => `'${ s }'`).join(', ') }`;

function expectOptional(name, type, value) {
  if (!isEmpty(value) && typeof value !== type) throw optionTypeError(name, `a ${ type }, or undefined`, value);
}

function expectEnum(name, set, value, { required = true } = {}) {
  if (required ? !set.has(value) : !isEmpty(value) && !set.has(value)) {
    throw optionTypeError(name, formatOptions(set), value);
  }
}

function validateOptions({
  absoluteImports,
  additionalPackages,
  browserslistEnv,
  configPath,
  debug,
  exclude,
  ignoreBrowserslistConfig,
  importStyle,
  include,
  method,
  mode,
  package: pkg,
  shippedProposals,
  shouldInjectPolyfill,
  targets,
  version,
}) {
  expectEnum('method', VALID_METHODS, method);
  expectEnum('mode', VALID_MODES, mode, { required: false });
  if (!isEmpty(importStyle) && importStyle !== 'import' && importStyle !== 'require') {
    throw optionTypeError('importStyle', "'import' or 'require'", importStyle);
  }
  expectOptional('absoluteImports', 'boolean', absoluteImports);
  expectOptional('debug', 'boolean', debug);
  expectOptional('ignoreBrowserslistConfig', 'boolean', ignoreBrowserslistConfig);
  expectOptional('shippedProposals', 'boolean', shippedProposals);
  expectOptional('configPath', 'string', configPath);
  expectOptional('browserslistEnv', 'string', browserslistEnv);
  // semver-shape validated downstream in `normalizeCoreJSVersion`; here only verify the
  // shape is string-or-undefined to surface `[core-js]`-prefixed error on non-string input
  // (number / boolean / null) BEFORE `createPolyfillContext` sees it
  expectOptional('version', 'string', version);
  if (!isEmpty(shouldInjectPolyfill) && typeof shouldInjectPolyfill !== 'function') {
    throw optionTypeError('shouldInjectPolyfill', 'a function, or undefined', shouldInjectPolyfill);
  }
  // shape-validate include/exclude before the conflict check below. otherwise a config
  // like `{ include: [42n], shouldInjectPolyfill: fn }` surfaces "conflict with shouldInjectPolyfill"
  // and hides the real error (bad element type) until the caller resolves the conflict first
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
  // empty arrays don't conflict with shouldInjectPolyfill - only non-empty include/exclude do
  if (typeof shouldInjectPolyfill === 'function' && (include?.length || exclude?.length)) {
    throw new TypeError('`include` and `exclude` are not supported when using `shouldInjectPolyfill`');
  }
  // `undefined` takes the default downstream; `null` (e.g. `{ package: cond ? 'x' : null }`)
  // is a real mis-configuration and should surface as a type error, not a late TypeError
  if (pkg !== undefined) {
    if (typeof pkg !== 'string') throw optionTypeError('package', 'a string', pkg);
    if (pkg === '') throw optionTypeError('package', 'a non-empty string', pkg);
  }
  if (additionalPackages !== undefined && additionalPackages !== null) {
    if (!Array.isArray(additionalPackages)) {
      throw optionTypeError('additionalPackages', 'an array, or undefined', additionalPackages);
    }
    // `.find(...)` collides with the sentinel: `additionalPackages: ['ok', undefined]`
    // matches on the `undefined` item but returns `undefined`, so `!== undefined` skips
    // the throw and crashes later at `p.toLowerCase()` inside `createPolyfillContext`.
    // `findIndex` disambiguates: `-1` is not-found, `>= 0` is a real hit
    const badIndex = additionalPackages.findIndex($pkg => typeof $pkg !== 'string');
    if (badIndex !== -1) throw optionTypeError('additionalPackages[*]', 'a string', additionalPackages[badIndex]);
    if (additionalPackages.includes('')) throw optionTypeError('additionalPackages[*]', 'a non-empty string', '');
    // note: duplicates (including case-variants) silently dedup in `createPolyfillContext`
    // - documented design, see `audit-additional-packages-dedup`
  }
  // positive whitelist for `targetsParser`: `function` / `boolean` / `number` / etc. trigger
  // opaque "Unknown browser query" from browserslist downstream - reject them here.
  // empty string silently triggers the browserslist-config fallback (`''` is falsy), which
  // looks like an accidental mis-configuration rather than an intentional opt-out
  if (!isEmpty(targets)) {
    if (typeof targets !== 'string' && !Array.isArray(targets) && !isPlainObject(targets)) {
      throw optionTypeError('targets', 'a string, array, or plain object', targets);
    }
    // empty string and empty array both silently fall back to browserslist defaults downstream,
    // which looks like accidental mis-configuration - reject symmetrically
    const isEmptyArray = Array.isArray(targets) && targets.length === 0;
    if (targets === '' || isEmptyArray) {
      throw optionTypeError('targets', 'a non-empty string, array, or plain object', targets);
    }
  }
}

function resolveTargets({ targets, configPath, ignoreBrowserslistConfig, browserslistEnv, getBabelTargets }) {
  // wrap all upstream calls so errors surface with `[core-js]` prefix. without this,
  // `targetsParser` thrown TypeError / `getBabelTargets()` throw (adversarial input
  // via Proxy or custom getter) reaches the user without plugin identification
  try {
    if (targets) return targetsParser(targets);
    if (typeof getBabelTargets === 'function') {
      const babelTargets = getBabelTargets();
      if (babelTargets && keys(babelTargets).length) return targetsParser(babelTargets);
    }
    // use project browserslist config by default (like @babel/preset-env, autoprefixer, etc.)
    const parsed = targetsParser({ configPath, ignoreBrowserslistConfig, browserslistEnv });
    return parsed.size ? parsed : null;
  } catch (error) {
    throw new Error(`[core-js] failed to resolve targets: ${ error.message }`, { cause: error });
  }
}

function buildShouldInjectPolyfill({ include, exclude, parsedTargets, userCallback }) {
  const matchers = patterns => {
    if (!patterns) return null;
    return (Array.isArray(patterns) ? patterns : [patterns]).map(p => {
      const re = patternToRegExp(p);
      return re ? mod => re.test(mod) : () => false;
    });
  };
  const includeMatchers = matchers(include);
  const excludeMatchers = matchers(exclude);
  const defaultShouldInject = mod => {
    if (excludeMatchers?.some(m => m(mod))) return false;
    if (includeMatchers?.some(m => m(mod))) return true;
    if (parsedTargets) {
      const requirements = compatData[mod];
      if (!requirements) return true;
      for (const [engine, ver] of parsedTargets) {
        if (!hasOwn(requirements, engine) || compare(ver, '<', requirements[engine])) return true;
      }
      return false;
    }
    return true;
  };
  // no cache at THIS layer - each call forwards to userCallback. note: createPolyfillContext
  // still caches per entry path in `modulesForEntryCache` / `isEntryNeededCache`, so a user
  // callback that returns different answers for the same module across transform invocations
  // only takes effect on the first call per entry. build-level (stateless) callbacks work as
  // expected; per-file thread-local callbacks must remember that contract
  const hasUserCallback = typeof userCallback === 'function';
  return mod => {
    const base = defaultShouldInject(mod);
    if (!hasUserCallback) return base;
    try {
      return userCallback(mod, base);
    } catch (error) {
      // wrap in a fresh Error so readonly `.message`, frozen Error, or primitive throw
      // (`throw 'str'`/`throw 42`/`throw null`) can't swallow the diagnostic via a TypeError
      // on reassignment. both `.message` access and `String(error)` may re-throw on adversarial
      // Proxy objects - guard each step so the wrapper never masks the user bug with a secondary
      // diagnostic. `cause` preserves the original for debuggers
      let originalMessage;
      try {
        originalMessage = error?.message ?? String(error);
      } catch {
        originalMessage = '<unreadable>';
      }
      const wrapped = new Error(`[core-js] shouldInjectPolyfill(${ JSON.stringify(mod) }) threw: ${ originalMessage }`);
      wrapped.cause = error;
      throw wrapped;
    }
  };
}

function getUnsupportedTargets(moduleName, parsedTargets) {
  if (!parsedTargets) return {};
  const requirements = compatData[moduleName];
  if (!requirements) return fromEntries([...parsedTargets].map(([e, v]) => [e, String(v)]));
  const unsupported = {};
  for (const [engine, version] of parsedTargets) {
    if (!hasOwn(requirements, engine) || compare(version, '<', requirements[engine])) {
      unsupported[engine] = String(version);
    }
  }
  return unsupported;
}

function formatTargets(obj) {
  const pairs = entries(obj);
  if (!pairs.length) return '{}';
  return `{ ${ pairs.map(([k, v]) => `${ JSON.stringify(k) }:${ JSON.stringify(v) }`).join(', ') } }`;
}

const KNOWN_REST_KEYS = new Set([
  'additionalPackages',
  'method',
  'mode',
  'package',
  'version',
]);

// validate user options, resolve targets, build shouldInjectPolyfill and debug output
// returns all resolved fields for createPolyfillContext + createPolyfillResolver
export function initPluginOptions(options, { getBabelTargets } = {}) {
  const {
    absoluteImports,
    browserslistEnv,
    configPath,
    debug,
    exclude,
    ignoreBrowserslistConfig,
    importStyle,
    include,
    shippedProposals,
    shouldInjectPolyfill: userCallback,
    targets,
    ...rest
  } = options;
  const unknown = keys(rest).filter(k => !KNOWN_REST_KEYS.has(k));
  if (unknown.length) throw new TypeError(`Unknown @core-js plugin option${ unknown.length > 1 ? 's' : '' }: ${ unknown.join(', ') }`);
  validateOptions({
    absoluteImports,
    additionalPackages: rest.additionalPackages,
    browserslistEnv,
    configPath,
    debug,
    exclude,
    ignoreBrowserslistConfig,
    importStyle,
    include,
    method: rest.method,
    mode: rest.mode,
    package: rest.package,
    shippedProposals,
    shouldInjectPolyfill: userCallback,
    targets,
    version: rest.version,
  });
  const parsedTargets = resolveTargets({
    targets,
    configPath,
    ignoreBrowserslistConfig,
    browserslistEnv,
    getBabelTargets,
  });
  const shouldInjectPolyfill = buildShouldInjectPolyfill({ include, exclude, parsedTargets, userCallback });
  const createDebugOutput = debug ? createDebugOutputFactory({ method: rest.method, parsedTargets }) : null;
  return {
    ...rest,
    absoluteImports,
    createDebugOutput,
    exclude,
    importStyle,
    include,
    shippedProposals,
    shouldInjectPolyfill,
  };
}

// create injection helper functions shared by both plugins
// getDebugOutput returns the per-file debug collector (or null if debug is off)
export function createModuleInjectors({ mode, getModulesForEntry, getDebugOutput, injectGlobal }) {
  function injectModule(moduleName) {
    injectGlobal(moduleName);
    getDebugOutput()?.add(moduleName);
  }

  function injectModulesForEntry(entry) {
    for (const mod of getModulesForEntry(entry)) injectModule(mod);
  }

  function injectModulesForModeEntry(entry) {
    injectModulesForEntry(`${ mode }/${ entry }`);
  }

  function outputDebug() {
    const debugOutput = getDebugOutput();
    if (!debugOutput) return;
    // eslint-disable-next-line no-console -- debug output
    console.log(debugOutput.format());
  }

  return { injectModulesForEntry, injectModulesForModeEntry, outputDebug };
}

// bail when the usage is syntactically present but carries no runtime read - polyfilling
// would be pure over-injection. covers: plugin's disable marker, TS type-only contexts,
// and for-x LHS where the MemberExpression targets a local write, not a prototype lookup
function shouldSkipUsageDispatch(meta, path, isDisabled) {
  if (isDisabled(path.node)) return true;
  if (path?.parentPath?.node?.type === 'TSTypeQuery') return true;
  if (isTSTypeOnlyIdentifierPath(path)) return true;
  return meta.kind === 'property' && path?.node && isForXWriteTarget(path);
}

// `super.X(...)` in a static method of `extends KnownGlobal { ... }`: regular MemberExpression
// resolution produces `{object: null, placement: 'prototype'}` which never matches
// `Array.from` etc. retry with a synthetic static meta against the parent class
function tryResolveSuperStaticMeta(meta, path, resolveStaticInheritedMember) {
  if (!resolveStaticInheritedMember) return null;
  if (meta.kind !== 'property' || meta.placement !== 'prototype' || meta.object !== null) return null;
  if (path?.node?.type !== 'MemberExpression' || path.node.object?.type !== 'Super') return null;
  return resolveStaticInheritedMember(path);
}

export function createUsageGlobalCallback({ resolveUsage, injectModulesForModeEntry, isDisabled, resolveStaticInheritedMember }) {
  function dispatch(meta, path) {
    if (shouldSkipUsageDispatch(meta, path, isDisabled)) return;
    if (meta.kind === 'in') {
      const entry = symbolKeyToEntry(meta.key);
      if (entry) injectModulesForModeEntry(entry);
      return;
    }
    const deps = resolveUsage(meta, path);
    if (deps) {
      for (const entry of deps) injectModulesForModeEntry(entry);
      return;
    }
    // unknown property on a known global constructor (`Map.foo`, `Map.foo++`) - the constructor
    // itself still needs polyfilling so the read/write target exists at runtime
    if (meta.kind === 'property' && meta.placement === 'static' && meta.object) {
      const constructorDeps = resolveUsage({ kind: 'global', name: meta.object }, path);
      if (constructorDeps) for (const entry of constructorDeps) injectModulesForModeEntry(entry);
    }
  }
  return (meta, path) => {
    const superMeta = tryResolveSuperStaticMeta(meta, path, resolveStaticInheritedMember);
    return dispatch(superMeta ?? meta, path);
  };
}

// returns a factory: each call creates an isolated per-file debug collector
// safe for concurrent transforms (e.g. Vite parallel file processing).
// `targetsStr` snapshot at factory creation time is intentional - `parsedTargets` is
// derived once from the user's options and never mutates afterwards
function createDebugOutputFactory({ method, parsedTargets }) {
  const targetsStr = parsedTargets
    ? JSON.stringify(fromEntries([...parsedTargets].map(([e, v]) => [e, String(v)])), null, 2)
    : '{}';

  return function createFileDebugOutput() {
    const modules = new Set();
    const warnings = new Set();
    let entryFound = false;

    return {
      add(mod) {
        modules.add(mod);
      },
      warn(message) {
        warnings.add(message);
      },
      markEntryFound() {
        entryFound = true;
      },
      format() {
        const items = [...modules];
        let result;
        if (method === 'entry-global' && !entryFound) {
          result = 'The entry point for the core-js@4 polyfill has not been found.';
        } else if (items.length === 0) {
          const scope = method === 'entry-global' ? 'your targets' : 'your code and targets';
          result = `Based on ${ scope }, the core-js@4 polyfill did not add any polyfill.`;
        } else {
          const verb = method === 'entry-global' ? 'entry has been replaced with' : 'added';
          const polyfillLines = items.map(mod => method === 'usage-pure'
            ? `  ${ mod }`
            : `  ${ mod } ${ formatTargets(getUnsupportedTargets(mod, parsedTargets)) }`);
          result = `The core-js@4 polyfill ${ verb } the following polyfills:\n${ polyfillLines.join('\n') }`;
        }
        const warningBlock = warnings.size
          ? `\n\nWarnings:\n${ [...warnings].map(m => `  ${ m }`).join('\n') }` : '';
        return `core-js@4: \`DEBUG\` option\n\nUsing targets: ${ targetsStr }\n\nUsing polyfills with \`${ method }\` method:\n${ result }${ warningBlock }`;
      },
    };
  };
}

