import data from '@core-js/compat/data' with { type: 'json' };
import buildPlan from './internals/application/build-plan.js';
import createChooseBundle from './internals/application/choose-bundle.js';
import configure from './internals/application/configure.js';
import createGetBundle from './internals/application/get-bundle.js';
import createWarm from './internals/application/warm.js';
import createResolver from './internals/domain/resolver.js';
import createBuilder from './internals/infrastructure/builder.js';
import createBundles from './internals/infrastructure/bundles.js';
import createListModules from './internals/infrastructure/compat-modules.js';
import resolveVersions from './internals/infrastructure/resolve-versions.js';
import trafficShares from './internals/infrastructure/traffic-shares.js';
import parseUserAgent from './internals/infrastructure/ua-bowser.js';
import createWarn from './internals/infrastructure/warn.js';
import createScriptTag from './internals/ui/script-tag.js';
import createServe from './internals/ui/serve.js';

async function rest(ready, warm, bundles) {
  await ready;

  const warmed = await warm.buckets();

  // ⚠ after the new generation is on disk, never before it: pruning first would take the
  // only bundles anything can be served from if this build turns out to fail
  await bundles.prune();

  return warmed;
}

// ⚠ the caller is free to await neither promise, and an unobserved rejection takes the process down
// on its own. the failure itself still reaches whoever does await `ready` or `warmed`
async function markHandled(promise) {
  try {
    await promise;
  } catch { /* the awaiter sees it */ }
}

// the composition root: the graph is assembled here and only here, so that every module below
// takes what it needs as an argument instead of reaching for it. the layers are wired in as
// they land - see AGENTS.md
export default function createService({ warn: warnSink, ...options } = {}) {
  const warn = createWarn(warnSink);
  const config = configure(options, { warn, resolveVersions });
  const plan = buildPlan(config, {
    data,
    trafficShares,
    listModules: createListModules(config),
    warn,
  });
  const bundles = createBundles({
    directory: config.directory,
    generation: plan.generation,
    brotli: config.brotli,
    retain: config.retain,
    warn,
  });
  const warm = createWarm(plan, { bundles, build: createBuilder(config), warn });
  const getBundle = createGetBundle(plan, { bundles });
  function urlOf(bundleId) {
    return `${ config.route }/${ bundleId }.js`;
  }

  let started = null;

  return {
    config,
    plan,
    bundles,
    warn,
    urlOf,
    chooseBundle: createChooseBundle(plan, { resolve: createResolver({ parseUserAgent }) }),
    scriptTag: createScriptTag({ warn }),
    serve: createServe({
      getBundle,
      encodings: bundles.encodings,
      baselineId: plan.baseline.bundleId,
      urlOf,
      warn,
    }),

    // started by whoever installs the service, and idempotently: `ready` is the baseline, which
    // requests wait for, and `warmed` is the rest of the plan, which nothing waits for
    start() {
      if (started === null) {
        const ready = warm.baseline();
        const warmed = rest(ready, warm, bundles);

        markHandled(ready);
        markHandled(warmed);
        started = { ready, warmed };
      }

      return started;
    },
  };
}
