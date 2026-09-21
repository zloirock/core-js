// browserslist / targets resolution + the `shouldInjectPolyfill` predicate built from
// resolved targets + user `include` / `exclude` lists. also exposes `getUnsupportedTargets`
// / `formatTargets` helpers consumed by the debug-output factory
import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import { patternToRegExp, safeErrorMessage, safeStringify } from '../helpers/pattern-matching.js';
import { wrapWithCause } from '../helpers/error-tag.js';

const { hasOwn, keys, entries, fromEntries } = Object;

// explicit targets - the option or babel's own - that NAME engines and yet resolve to none
// `@core-js/compat` knows (`{ op_mini: 'all' }`, `{ unknown_engine: '1' }`, a typo) are an EMPTY engine
// set, on which "some target still needs it" is false for every module: a build that polyfills
// nothing and says nothing. the empty object `{}` is the one input that names none on purpose - "no
// engine to serve" - and keeps that documented meaning; the same emptiness out of the browserslist-
// config probe below means "no config" and keeps its fallback
function parseExplicitTargets(targets, label) {
  const parsed = targetsParser(targets);
  const namesEngines = typeof targets !== 'object' || targets === null || keys(targets).length > 0;
  if (!parsed.size && namesEngines) {
    throw new TypeError(`${ label } resolved to no engine \`@core-js/compat\` knows (received ${ safeStringify(targets) }); name supported engines, or drop the option to use the browserslist config`);
  }
  return parsed;
}

// the engine set the build serves, as a Map of engine to version: the explicit `targets` option,
// else babel's own targets, else the browserslist config - and `null` when no config names any
// engine, the polyfill-everything answer
export function resolveTargets({ targets, configPath, ignoreBrowserslistConfig, browserslistEnv, getBabelTargets }) {
  // wrap all upstream calls so errors surface with `[core-js]` prefix. without this,
  // `targetsParser` thrown TypeError / `getBabelTargets()` throw (adversarial input
  // via Proxy or custom getter) reaches the user without plugin identification
  try {
    if (targets) return parseExplicitTargets(targets, '`targets`');
    // babel's own resolution (`api.targets()`) is authoritative when present. on @babel/core@8
    // it may already fold in `.browserslistrc`, so `ignoreBrowserslistConfig` does NOT suppress
    // it here - that option only gates core-js's OWN browserslist read (the targetsParser call
    // below). by design: inside a babel pipeline babel decides the targets, and an explicit
    // plugin `targets` still wins via the early return above. an empty babel object is "no
    // targets configured" and falls through; a non-empty one is explicit and must name engines
    if (typeof getBabelTargets === 'function') {
      const babelTargets = getBabelTargets();
      if (babelTargets && keys(babelTargets).length) return parseExplicitTargets(babelTargets, 'the babel targets');
    }
    // use project browserslist config by default (like @babel/preset-env, autoprefixer, etc.)
    // this branch collapses an empty browserslist Map to null so the "no project config"
    // fallback (parsedTargets=null) routes to the polyfill-everything branch of
    // `buildTargetsNeedPolyfill`
    const parsed = targetsParser({ configPath, ignoreBrowserslistConfig, browserslistEnv });
    return parsed.size ? parsed : null;
  } catch (error) {
    throw wrapWithCause(`failed to resolve targets: ${ safeErrorMessage(error) }`, error);
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

// the targets' own answer, with no include, exclude or user callback in it: does SOME target still
// need `mod`? `null` targets (no browserslist config, or an ignored one) need everything. the helper
// entries ask this one (`isEntryNeeded`): a user filter may drop a helper's modules, never its emit
export function buildTargetsNeedPolyfill(parsedTargets) {
  return function targetsNeedPolyfill(mod) {
    if (!parsedTargets) return true;
    const requirements = moduleRequirements(mod);
    if (!requirements) return true;
    // short-circuits on the first engine that needs it; the debug side accumulates every one.
    // the per-engine rule itself is `engineNeedsPolyfill`, so the injection DECISION and its
    // debug ATTRIBUTION cannot answer differently
    for (const [engine, ver] of parsedTargets) {
      if (engineNeedsPolyfill(requirements, engine, ver)) return true;
    }
    return false;
  };
}

// filter precedence convention: `exclude` wins over `include` over targets-default. mirrors
// `isEntryNeeded` in `polyfill-provider/index.js` for entry-level filtering. flipping one
// without the other would desync - change both sites in lockstep
export function buildShouldInjectPolyfill({ include, exclude, parsedTargets, userCallback }) {
  // the lists arrive validated (`validatePatternList`): arrays of patterns, or absent. no second
  // policy on their form here - a scalar that reaches this layer is a caller bug, not a list
  function matchers(patterns) {
    if (!patterns) return null;
    return patterns.map(p => {
      const re = patternToRegExp(p);
      return re ? mod => re.test(mod) : () => false;
    });
  }

  const includeMatchers = matchers(include);
  const excludeMatchers = matchers(exclude);
  const targetsNeedPolyfill = buildTargetsNeedPolyfill(parsedTargets);

  function defaultShouldInject(mod) {
    if (excludeMatchers?.some(m => m(mod))) return false;
    if (includeMatchers?.some(m => m(mod))) return true;
    return targetsNeedPolyfill(mod);
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
      throw wrapWithCause(`shouldInjectPolyfill(${ JSON.stringify(mod) }) threw: ${ safeErrorMessage(error) }`, error);
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
