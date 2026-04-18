import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import { isForXWriteTarget, patternToRegExp, symbolKeyToEntry } from './helpers.js';

const { hasOwn, keys, entries, fromEntries } = Object;

// canonical polyfill ordering based on compat data registry
const polyfillOrder = new Map(keys(compatData).map((k, i) => [k, i]));

// sort module names by canonical compat data order
export function sortByPolyfillOrder(modules) {
  return [...modules].sort((a, b) => (polyfillOrder.get(a) ?? Infinity) - (polyfillOrder.get(b) ?? Infinity) || 0);
}

// consistent error format: `name` must be <expected> (received <JSON(value)>)
export function optionTypeError(name, expected, received) {
  return new TypeError(`\`${ name }\` must be ${ expected } (received ${ JSON.stringify(received) })`);
}

const VALID_METHODS = new Set(['entry-global', 'usage-global', 'usage-pure']);
const VALID_MODES = new Set(['es', 'stable', 'actual', 'full']);
const formatOptions = set => `one of ${ [...set].map(s => `'${ s }'`).join(', ') }`;

// `null`/`undefined` pass through so users can use conditional spreads to clear an option
const isEmpty = v => v === null || v === undefined;

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
  if (!isEmpty(shouldInjectPolyfill) && typeof shouldInjectPolyfill !== 'function') {
    throw optionTypeError('shouldInjectPolyfill', 'a function, or undefined', shouldInjectPolyfill);
  }
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
    const badType = additionalPackages.find($pkg => typeof $pkg !== 'string');
    if (badType !== undefined) throw optionTypeError('additionalPackages[*]', 'a string', badType);
    if (additionalPackages.includes('')) throw optionTypeError('additionalPackages[*]', 'a non-empty string', '');
  }
}

function resolveTargets({ targets, configPath, ignoreBrowserslistConfig, browserslistEnv, getBabelTargets }) {
  if (targets) return targetsParser(targets);
  if (typeof getBabelTargets === 'function') {
    const babelTargets = getBabelTargets();
    if (babelTargets && keys(babelTargets).length) return targetsParser(babelTargets);
  }
  // use project browserslist config by default (like @babel/preset-env, autoprefixer, etc.)
  const parsed = targetsParser({ configPath, ignoreBrowserslistConfig, browserslistEnv });
  return parsed.size ? parsed : null;
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
  // no cache: a user callback may depend on per-file context and a shared cache would
  // pin the first answer across every subsequent transform call
  const hasUserCallback = typeof userCallback === 'function';
  return mod => {
    const base = defaultShouldInject(mod);
    if (!hasUserCallback) return base;
    try {
      return userCallback(mod, base);
    } catch (error) {
      error.message = `core-js-polyfill-provider: shouldInjectPolyfill(${ JSON.stringify(mod) }) threw: ${ error.message }`;
      throw error;
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

export function createUsageGlobalCallback({ resolveUsage, injectModulesForModeEntry, isDisabled, resolveSuperMember }) {
  function dispatch(meta, path) {
    if (isDisabled(path.node)) return;
    // `typeof Map` is a type-level operator: the identifier never appears at runtime, so
    // polyfilling it is pure over-injection. narrow to TSTypeQuery only; `as Map<...>` and
    // `let x: Map` keep current behavior (runtime-cast heuristic assumes later Map usage)
    if (path?.parentPath?.node?.type === 'TSTypeQuery') return;
    // for-x LHS and shadowed body reads target a local write, not the prototype
    if (meta.kind === 'property' && path?.node && isForXWriteTarget(path)) return;
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
    // `super.X(...)` in a static method of `extends KnownGlobal { ... }`: regular MemberExpression
    // resolution produces `{object: null, placement: 'prototype'}` which never matches
    // `Array.from` etc. retry with a synthetic static meta against the parent class
    if (resolveSuperMember && meta.kind === 'property' && meta.placement === 'prototype'
      && meta.object === null && path?.node?.type === 'MemberExpression'
      && path.node.object?.type === 'Super') {
      const superMeta = resolveSuperMember(path);
      if (superMeta) return dispatch(superMeta, path);
    }
    return dispatch(meta, path);
  };
}

// returns a factory: each call creates an isolated per-file debug collector
// safe for concurrent transforms (e.g. Vite parallel file processing)
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

