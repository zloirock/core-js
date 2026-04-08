import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import { symbolKeyToEntry, patternToRegExp } from './helpers.js';

const { hasOwn, keys, entries, fromEntries } = Object;

// canonical polyfill ordering based on compat data registry
const polyfillOrder = new Map(keys(compatData).map((k, i) => [k, i]));

// sort module names by canonical compat data order
export function sortByPolyfillOrder(modules) {
  return [...modules].sort((a, b) => (polyfillOrder.get(a) ?? Infinity) - (polyfillOrder.get(b) ?? Infinity) || 0);
}

function validateImportStyle(importStyle) {
  if (importStyle !== undefined && importStyle !== 'import' && importStyle !== 'require') {
    throw new TypeError("`importStyle` should be 'import' or 'require'");
  }
}

function validatePatternList(name, list) {
  if (list === undefined || list === null) return;
  if (!Array.isArray(list)) throw new TypeError(`.${ name } must be an array, or undefined (received ${ JSON.stringify(list) })`);
  for (const item of list) {
    if (typeof item !== 'string' && !(item instanceof RegExp)) {
      throw new TypeError(`.${ name } elements must be strings or regular expressions (received ${ JSON.stringify(item) })`);
    }
  }
}

function validatePluginOptions({ absoluteImports, shouldInjectPolyfill, include, exclude }) {
  if (absoluteImports !== null && absoluteImports !== undefined && typeof absoluteImports !== 'boolean') {
    throw new TypeError('.absoluteImports must be a boolean, or undefined'
      + ` (received ${ JSON.stringify(absoluteImports) })`);
  }
  if (shouldInjectPolyfill !== undefined && typeof shouldInjectPolyfill !== 'function') {
    throw new TypeError('.shouldInjectPolyfill must be a function, or undefined'
      + ` (received ${ shouldInjectPolyfill })`);
  }
  // empty arrays don't conflict with shouldInjectPolyfill — only non-empty include/exclude do
  if (typeof shouldInjectPolyfill === 'function' && (include?.length || exclude?.length)) {
    throw new TypeError('.include and .exclude are not supported when using the .shouldInjectPolyfill function.');
  }
  validatePatternList('include', include);
  validatePatternList('exclude', exclude);
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

// validate user options, resolve targets, build shouldInjectPolyfill and debug output
// returns all resolved fields for createPolyfillContext + createPolyfillResolver
export function initPluginOptions({
  targets, include, exclude, debug,
  absoluteImports, shouldInjectPolyfill: userCallback,
  configPath, ignoreBrowserslistConfig, browserslistEnv, importStyle,
  ...rest
}, { getBabelTargets } = {}) {
  validateImportStyle(importStyle);
  validatePluginOptions({ absoluteImports, shouldInjectPolyfill: userCallback, include, exclude });
  const parsedTargets = resolveTargets({ targets, configPath, ignoreBrowserslistConfig, browserslistEnv, getBabelTargets });
  const shouldInjectPolyfill = buildShouldInjectPolyfill({ include, exclude, parsedTargets, userCallback });
  const createDebugOutput = debug ? createDebugOutputFactory({ method: rest.method, parsedTargets }) : null;
  return { ...rest, include, exclude, absoluteImports, importStyle, shouldInjectPolyfill, createDebugOutput };
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

export function createUsageGlobalCallback({ resolveUsage, injectModulesForModeEntry, isDisabled }) {
  return (meta, path) => {
    if (isDisabled(path.node)) return;
    if (meta.kind === 'in') {
      const entry = symbolKeyToEntry(meta.key);
      if (entry) injectModulesForModeEntry(entry);
      return;
    }
    const deps = resolveUsage(meta, path);
    if (!deps) return;
    for (const entry of deps) injectModulesForModeEntry(entry);
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
    let entryFound = false;

    return {
      add(mod) {
        modules.add(mod);
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
        return `core-js@4: \`DEBUG\` option\n\nUsing targets: ${ targetsStr }\n\nUsing polyfills with \`${ method }\` method:\n${ result }`;
      },
    };
  };
}

