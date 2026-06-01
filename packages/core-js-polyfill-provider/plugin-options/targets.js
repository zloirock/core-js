// browserslist / targets resolution + the `shouldInjectPolyfill` predicate built from
// resolved targets + user `include` / `exclude` lists. also exposes `getUnsupportedTargets`
// / `formatTargets` helpers consumed by the debug-output factory
import compatData from '@core-js/compat/data' with { type: 'json' };
import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';
import { patternToRegExp } from '../helpers/pattern-matching.js';

const { hasOwn, keys, entries, fromEntries } = Object;

// safe `.message ?? String(error)` extraction for diagnostic wrapping. adversarial
// Proxy on the thrown payload can make `.message` access AND `String(error)`
// re-throw - swallow secondary errors so the user's primary diagnostic still
// renders with a readable wrapper. shared by `resolveTargets` and
// `buildShouldInjectPolyfill` user-callback catch
function safeErrorMessage(error) {
  try {
    return error?.message ?? String(error);
  } catch {
    return '<unreadable>';
  }
}

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
    // browserslist-config-only branch collapses empty Map to null so the "no project config"
    // fallback (parsedTargets=null) routes to defaultShouldInject's polyfill-everything
    // branch. explicit `targets`/`getBabelTargets` empty Map intentionally stays truthy:
    // user explicitly said "no engines" -> polyfill nothing (`for`-loop 0-iter -> return false)
    const parsed = targetsParser({ configPath, ignoreBrowserslistConfig, browserslistEnv });
    return parsed.size ? parsed : null;
  } catch (error) {
    const wrapped = new Error(`[core-js] failed to resolve targets: ${ safeErrorMessage(error) }`);
    wrapped.cause = error;
    throw wrapped;
  }
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
      const requirements = compatData[mod];
      if (!requirements) return true;
      for (const [engine, ver] of parsedTargets) {
        if (!hasOwn(requirements, engine) || compare(ver, '<', requirements[engine])) return true;
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
      // wrap in a fresh Error so readonly `.message`, frozen Error, or primitive throw
      // (`throw 'str'`/`throw 42`/`throw null`) can't swallow the diagnostic via a TypeError
      // on reassignment. `safeErrorMessage` guards both `.message` access and `String(error)`
      // against adversarial Proxy traps. `cause` preserves the original for debuggers
      const wrapped = new Error(`[core-js] shouldInjectPolyfill(${ JSON.stringify(mod) }) threw: ${ safeErrorMessage(error) }`);
      wrapped.cause = error;
      throw wrapped;
    }
  };
}

// targets that fail the polyfill's compat requirements - used by debug output to surface
// "this engine version is what triggered injection". empty object means no engine
// triggered the polyfill (probably injected via `include` override)
export function getUnsupportedTargets(moduleName, parsedTargets) {
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

// `{ "ie": "11", "chrome": "60" }` -> `{ "ie":"11", "chrome":"60" }`. `JSON.stringify` defaults
// to `\n`-separated multi-line for non-empty objects with `null, 2` formatting; this single-line
// shape keeps the debug output compact when there are only one-two engines reporting
export function formatTargets(obj) {
  const pairs = entries(obj);
  if (!pairs.length) return '{}';
  return `{ ${ pairs.map(([k, v]) => `${ JSON.stringify(k) }:${ JSON.stringify(v) }`).join(', ') } }`;
}
