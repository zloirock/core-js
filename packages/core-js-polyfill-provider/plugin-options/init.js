// `initPluginOptions` orchestrator: validates the user options, resolves browserslist
// targets, builds `shouldInjectPolyfill` predicate, and creates the debug-output factory
// when `debug: true`. returns the resolved fields downstream consumers
// (`createPolyfillContext` + `createPolyfillResolver`) read. sibling submodules in
// `plugin-options/` cover the individual stages (validate / targets / debug-output);
// `inject.js` and `usage-callback.js` are independently consumed by the host plugins
import { isEmpty, validateOptions } from './validate.js';
import { buildShouldInjectPolyfill, resolveTargets } from './targets.js';
import { createDebugOutputFactory } from './debug-output.js';

export function initPluginOptions(options, { getBabelTargets } = {}) {
  // a `null` options object skips the parameter default (`= {}` fires on undefined only) and
  // would die on a raw un-branded destructure TypeError - degrade it to the branded
  // method-required validation error instead
  options ??= {};
  // single validation pass: `validateOptions` owns both shape-check and unknown-key
  // detection (via `...unknown` rest in its signature - that destructure is the source
  // of truth for known option names, so they don't have to be listed twice)
  validateOptions(options);
  const {
    absoluteImports,
    browserslistEnv,
    configPath,
    debug,
    exclude,
    ignoreBrowserslistConfig,
    importStyle,
    include,
    shouldInjectPolyfill: userCallback,
    targets,
    ...rest
  } = options;
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
    createDebugOutput,
    exclude,
    // ONE spelling downstream: `null` is "not set" for the `??` heuristic that derives the style,
    // so it has to be "not set" for the strict `=== undefined` reads too - written both ways, the
    // option silently declared itself set to one consumer and unset to the next
    importStyle: isEmpty(importStyle) ? undefined : importStyle,
    include,
    shouldInjectPolyfill,
  };
}
