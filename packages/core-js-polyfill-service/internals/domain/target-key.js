import targetsParser from '@core-js/compat/targets-parser';
import { compare } from '@core-js/compat/helpers';

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

// `<engine> <version>` in the vocabulary of the compat data - `ios 26.4`, `chrome 140`. `null` for
// anything that cannot become one, which is an answer rather than a failure: the visitor gets the
// baseline
export function toTargetKey(engine, version) {
  const name = canonicalEngine(engine);
  if (name === null || !/^\d/.test(String(version))) return null;
  return `${ name } ${ version }`;
}

export function parseTargetKey(key) {
  const separator = key.lastIndexOf(' ');
  return { engine: key.slice(0, separator), version: key.slice(separator + 1) };
}

// versions are compared, never string-matched - browserslist spells the same browser `safari 12`
// and the compat data `safari 12.0`, and `parseFloat` puts `26.10` before `26.2`
export function compareVersions(a, b) {
  if (compare(a, '<', b)) return -1;
  return compare(a, '>', b) ? 1 : 0;
}

export { compare };
