import { semver } from '@core-js/compat/helpers';
import { nearestNotAbove } from './target.js';

// the nearest-below branch stands on the compat data recording the version a module is known to
// be CORRECT from, not on anything here
export default function createMatcher(plan) {
  // the thresholds are parsed once, here, because the comparison is the parse: the compat helper
  // reads whatever it is handed, so a matcher searching the strings would read the same thresholds
  // again on every request. The plan keeps them as the data spells them - this index is the
  // matcher's own, and the only place the parsed form is needed
  const byEngine = new Map(plan.byEngine.entries().map(([engine, entries]) => [engine,
    entries.map(entry => ({ version: semver(entry.version), bundleId: entry.bundleId }))]));

  // what each bundle carries, for the one question the plan alone can answer: whether one covers
  // another. built beside the index because both are per-plan, not per-request
  const modulesOf = new Map(plan.buckets.map(bucket => [bucket.bundleId, new Set(bucket.modules)]));
  const covered = new Map();

  modulesOf.set(plan.baseline.bundleId, new Set(plan.baseline.modules));

  function bundleFor(target) {
    const entries = byEngine.get(target.engine);

    // an engine the plan never names gets the baseline and nothing wider: anything wider was never
    // declared and never tested on
    if (!entries) return plan.baseline.bundleId;

    const nearest = nearestNotAbove(entries, target.version, entry => entry.version);

    return nearest === null ? plan.baseline.bundleId : nearest.bundleId;
  }

  // the answer for a visitor two candidates describe: the bundle that covers both. the pairs repeat
  // across requests - there are only so many browsers - so the comparison is made once per pair
  function coveringOf(first, second) {
    const key = `${ first } ${ second }`;
    let answer = covered.get(key);

    if (answer === undefined) {
      const one = modulesOf.get(first);
      const other = modulesOf.get(second);

      answer = [...other].every(module => one.has(module)) ? first
        : [...one].every(module => other.has(module)) ? second
        // neither is a superset of the other, and the plan holds no bundle that is their union: the
        // baseline covers everything the scope can ask for, so it is the only answer left
        : plan.baseline.bundleId;

      covered.set(key, answer);
    }

    return answer;
  }

  return function match(target) {
    if (target === null) return plan.baseline.bundleId;

    const named = bundleFor(target);

    if (target.alternate === undefined) return named;

    const under = bundleFor(target.alternate);

    return under === named ? named : coveringOf(named, under);
  };
}
