import data from '@core-js/compat/data' with { type: 'json' };
import buildPlan from './internals/application/build-plan.js';
import configure from './internals/application/configure.js';
import createListModules from './internals/infrastructure/compat-modules.js';
import resolveVersions from './internals/infrastructure/resolve-versions.js';
import trafficShares from './internals/infrastructure/traffic-shares.js';
import createWarn from './internals/infrastructure/warn.js';

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

  return { config, plan, warn };
}
