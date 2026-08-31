import targetsParser from '@core-js/compat/targets-parser';
import { compare, semver } from '@core-js/compat/helpers';

// keys of a targets declaration that configure the browserslist lookup instead of naming an engine
export const CONFIGURATION = new Set(['browsers', 'browserslistEnv', 'configPath', 'esmodules', 'ignoreBrowserslistConfig']);

const CONFIGURATION_LOWERCASED = new Set([...CONFIGURATION].map(key => key.toLowerCase()));

const engineNames = new Map();

// the canonical engine name of the compat vocabulary, or `null` for a name it does not track.
// asked of the parser rather than answered from a copy of its private tables - a copy does not throw
// when it drifts, it stops matching mobile traffic
export function canonicalEngine(name) {
  const lower = String(name).toLowerCase();

  if (!engineNames.has(lower)) {
    let resolved = null;

    if (!CONFIGURATION_LOWERCASED.has(lower)) try {
      const parsed = targetsParser({ [lower]: '1' });
      if (parsed.size === 1) [resolved] = parsed.keys();
    } catch { /* a name the parser cannot even read is a name it does not track */ }

    engineNames.set(lower, resolved);
  }

  return engineNames.get(lower);
}

// an engine and a version in the vocabulary of the compat data - `ios 26.4`, `chrome 140`. `null`
// for anything that cannot become one, which is an answer rather than a failure: the visitor gets
// the baseline. The pair travels as a pair: joining it into one string would only mean taking it
// apart again in the matcher, on the request path, to look the engine up by name
export function toTarget(engine, version) {
  const name = canonicalEngine(engine);

  if (name === null) return null;

  const text = String(version);

  // `tp` and `latest` the compat parser accepts, and no threshold can be found for either
  return /^\d/.test(text) ? { engine: name, version: text } : null;
}

// the last entry of a SORTED list that is not above `version`, found by bisection: a scan would ask
// the comparator about entries the order has already ruled out, and every question it asks is a
// semver comparison
export function nearestNotAbove(sorted, version, versionOf = it => it) {
  // nothing to be below: asked before the version is parsed, so an empty list answers without
  // reading the version at all - `semver` throws on what it cannot parse
  if (!sorted.length) return null;

  // parsed once for the whole search: `compare` parses whatever it is handed, and handing it the
  // same string at every step is the parse again per step - which IS the cost of the comparison
  const bound = semver(version);
  let low = 0;
  let high = sorted.length - 1;
  let found = null;

  while (low <= high) {
    const middle = (low + high) >> 1;

    if (compare(versionOf(sorted[middle]), '<=', bound)) {
      found = sorted[middle];
      low = middle + 1;
    } else high = middle - 1;
  }

  return found;
}

// the three-way comparator `sort` needs, over a compat helper that answers one question at a time.
// versions are compared, never string-matched - browserslist spells the same browser `safari 12`
// and the compat data `safari 12.0`, and `parseFloat` puts `26.10` before `26.2`. both are parsed
// here rather than inside each question, which would parse the same two versions four times
export function compareVersions(a, b) {
  const left = semver(a);
  const right = semver(b);

  if (compare(left, '<', right)) return -1;
  return compare(left, '>', right) ? 1 : 0;
}
