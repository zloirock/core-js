import { compare, parseTargetKey } from './target-key.js';

// the nearest-below branch stands on the compat data recording the version a module is known to
// be CORRECT from, not on anything here
export default function createMatcher(plan) {
  return function match(targetKey) {
    if (targetKey === null) return plan.baseline.bundleId;

    const { engine, version } = parseTargetKey(targetKey);
    const entries = plan.byEngine.get(engine);

    // an engine the plan never names gets the baseline and nothing wider: anything wider was never
    // declared and never tested on
    if (!entries) return plan.baseline.bundleId;

    let nearest = null;
    for (const entry of entries) {
      if (compare(entry.version, '<=', version)) nearest = entry;
      else break;
    }

    return nearest === null ? plan.baseline.bundleId : nearest.bundleId;
  };
}
