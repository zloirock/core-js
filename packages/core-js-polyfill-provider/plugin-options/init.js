// `initPluginOptions` orchestrator: validates the user options, resolves browserslist
// targets, builds `shouldInjectPolyfill` predicate, and creates the debug-output factory
// when `debug: true`. returns the resolved fields downstream consumers
// (`createPolyfillContext` + `createPolyfillResolver`) read. sibling submodules in
// `plugin-options/` cover the individual stages (validate / targets / debug-output);
// `inject.js` and `usage-callback.js` are independently consumed by the host plugins
import { KNOWN_REST_KEYS, validateOptions } from './validate.js';
import { buildShouldInjectPolyfill, resolveTargets } from './targets.js';
import { createDebugOutputFactory } from './debug-output.js';

const { keys } = Object;

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
  if (unknown.length) throw new TypeError(`[core-js] Unknown plugin option${ unknown.length > 1 ? 's' : '' }: ${ unknown.join(', ') }`);
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
