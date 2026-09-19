// browserslist / targets resolution + the `shouldInjectPolyfill` predicate built from
// resolved targets + user `include` / `exclude` lists. also exposes `getUnsupportedTargets`
// / `formatTargets` helpers consumed by the debug-output factory
import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import { patternToRegExp, safeErrorMessage } from '../helpers/pattern-matching.js';
import { wrapWithCause } from '../helpers/error-tag.js';

const { hasOwn, keys, entries, fromEntries } = Object;

export function resolveTargets({ targets, configPath, ignoreBrowserslistConfig, browserslistEnv, getBabelTargets }) {
  // wrap all upstream calls so errors surface with `[core-js]` prefix. without this,
  // `targetsParser` thrown TypeError / `getBabelTargets()` throw (adversarial input
  // via Proxy or custom getter) reaches the user without plugin identification
  try {
    if (targets) return targetsParser(targets);
    // babel's own resolution (`api.targets()`) is authoritative when present. on @babel/core@8
    // it may already fold in `.browserslistrc`, so `ignoreBrowserslistConfig` does NOT suppress
    // it here - that option only gates core-js's OWN browserslist read (the targetsParser call
    // below). by design: inside a babel pipeline babel decides the targets, and an explicit
    // plugin `targets` still wins via the early return above
    if (typeof getBabelTargets === 'function') {
      const babelTargets = getBabelTargets();
      if (babelTargets && keys(babelTargets).length) return targetsParser(babelTargets);
    }
    // use project browserslist config by default (like @babel/preset-env, autoprefixer, etc.)
    // this branch collapses an empty browserslist Map to null so the "no project config"
    // fallback (parsedTargets=null) routes to defaultShouldInject's polyfill-everything branch.
    // the two "no engines" inputs are ASYMMETRIC: an explicit plugin `targets: {}` returns early
    // above and its empty Map stays truthy -> polyfill nothing (`for`-loop 0-iter -> return false),
    // but an empty `getBabelTargets()` is gated OUT by the `.length` check above and falls through
    // HERE, so a babel-declared no-engines result polyfills EVERYTHING, not nothing
    const parsed = targetsParser({ configPath, ignoreBrowserslistConfig, browserslistEnv });
    return parsed.size ? parsed : null;
  } catch (error) {
    throw wrapWithCause(`[core-js] failed to resolve targets: ${ safeErrorMessage(error) }`, error);
  }
}

// the module's compat row, read as an OWN property: `compatData` is a JSON object that inherits
// from `Object.prototype`, so a bare bracket read answers with an inherited function for a module
// spelled like one of its keys. the rest of this file reads such lookups through `hasOwn` already
function moduleRequirements(moduleName) {
  return hasOwn(compatData, moduleName) ? compatData[moduleName] : undefined;
}

// does `engine@version` still need the polyfill whose compat row is `requirements`? one rule, two
// consumers: the injection decision (short-circuiting) and the debug attribution (accumulating)
function engineNeedsPolyfill(requirements, engine, version) {
  return !hasOwn(requirements, engine) || compare(version, '<', requirements[engine]);
}

// filter precedence convention: `exclude` wins over `include` over targets-default. mirrors
// `isEntryNeeded` in `polyfill-provider/index.js` for entry-level filtering. flipping one
// without the other would desync - change both sites in lockstep
export function buildShouldInjectPolyfill({ include, exclude, parsedTargets, userCallback }) {
  function matchers(patterns) {
    if (!patterns) return null;
    return (Array.isArray(patterns) ? patterns : [patterns]).map(p => {
      const re = patternToRegExp(p);
      return re ? mod => re.test(mod) : () => false;
    });
  }

  const includeMatchers = matchers(include);
  const excludeMatchers = matchers(exclude);

  function defaultShouldInject(mod) {
    if (excludeMatchers?.some(m => m(mod))) return false;
    if (includeMatchers?.some(m => m(mod))) return true;
    if (parsedTargets) {
      const requirements = moduleRequirements(mod);
      if (!requirements) return true;
      // short-circuits on the first engine that needs it; the debug side accumulates every one.
      // the per-engine rule itself is `engineNeedsPolyfill`, so the injection DECISION and its
      // debug ATTRIBUTION cannot answer differently
      for (const [engine, ver] of parsedTargets) {
        if (engineNeedsPolyfill(requirements, engine, ver)) return true;
      }
      return false;
    }
    return true;
  }

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
      // `safeErrorMessage` guards both `.message` access and `String(error)` against adversarial
      // Proxy traps; `wrapWithCause` owns the fresh-Error + non-enumerable `cause` contract
      throw wrapWithCause(`[core-js] shouldInjectPolyfill(${ JSON.stringify(mod) }) threw: ${ safeErrorMessage(error) }`, error);
    }
  };
}

// the resolved targets Map as a plain `{ engine: "version" }` object - the ONE projection the two
// debug surfaces below share (a whole-map dump and the per-module unsupported subset)
export function targetsToObject(parsedTargets) {
  return fromEntries([...parsedTargets].map(([engine, version]) => [engine, String(version)]));
}

// targets that fail the polyfill's compat requirements - used by debug output to surface
// "this engine version is what triggered injection". empty object means no engine
// triggered the polyfill (probably injected via `include` override)
export function getUnsupportedTargets(moduleName, parsedTargets) {
  if (!parsedTargets) return {};
  const requirements = moduleRequirements(moduleName);
  if (!requirements) return targetsToObject(parsedTargets);
  const unsupported = {};
  for (const [engine, version] of parsedTargets) {
    if (engineNeedsPolyfill(requirements, engine, version)) unsupported[engine] = String(version);
  }
  return unsupported;
}

// `{ "ie": "11", "chrome": "60" }` -> `{ "ie":"11", "chrome":"60" }`. `JSON.stringify` defaults
// to `\n`-separated multi-line for non-empty objects with `null, 2` formatting; this single-line
// shape keeps the debug output compact when there are only one-two engines reporting
export function formatTargets(obj) {
  const pairs = entries(obj);
  if (!pairs.length) return '{}';
  return `{ ${ pairs.map(([k, v]) => `${ JSON.stringify(k) }:${ JSON.stringify(v) }`).join(', ') } }`;
}
