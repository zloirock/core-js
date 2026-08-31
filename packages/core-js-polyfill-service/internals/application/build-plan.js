import buildBuckets from '../domain/buckets.js';
import collectTargets from '../domain/targets.js';

// the only place the declared range and the application scope meet. a step of its own because the
// warm-up reads the plan once and the matcher reads it on every request
export default function buildPlan(config, { data, trafficShares, listModules, warn }) {
  const targets = collectTargets({ data, declaration: config.targets, shares: trafficShares, warn });

  return buildBuckets({
    targets,
    listModules,
    versions: config.versions,
    minify: config.minify,
    scope: config.scope,
    exclude: config.exclude,
  });
}
