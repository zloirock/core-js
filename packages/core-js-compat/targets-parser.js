import browserslist from 'browserslist';
import { compare } from './helpers.js';
import external from './external.json' with { type: 'json' };

const { entries, hasOwn } = Object;
const { isArray } = Array;

const aliases = new Map([
  ['and_chr', 'chrome-android'],
  ['and_ff', 'firefox-android'],
  ['ie_mob', 'ie'],
  ['ios_saf', 'ios'],
  ['oculus', 'quest'],
  ['op_mob', 'opera-android'],
  ['opera_mobile', 'opera-android'],
  ['react', 'react-native'],
  ['reactnative', 'react-native'],
]);

const validTargets = new Set([
  'android',
  'bun',
  'chrome',
  'chrome-android',
  'deno',
  'edge',
  'electron',
  'firefox',
  'firefox-android',
  'hermes',
  'ie',
  'ios',
  'node',
  'opera',
  'opera-android',
  'quest',
  'react-native',
  'rhino',
  'safari',
  'samsung',
]);

const toLowerKeys = function (object) {
  return entries(object).reduce((accumulator, [key, value]) => {
    accumulator[key.toLowerCase()] = value;
    return accumulator;
  }, {});
};

export default function (targets) {
  if (typeof targets != 'object' || isArray(targets)) targets = { browsers: targets };
  const { configPath, ignoreBrowserslistConfig, ...targetsWithoutConfig } = targets;
  const { browsers, esmodules, node, ...rest } = toLowerKeys(targetsWithoutConfig);

  const list = entries(rest);

  const normalizedESModules = esmodules === 'intersect' ? 'intersect' : !!esmodules;

  if (browsers && normalizedESModules !== true) {
    if (typeof browsers == 'string' || isArray(browsers)) {
      list.push(...browserslist(browsers).map(it => it.split(' ')));
    } else {
      list.push(...entries(browsers));
    }
  } else if (!list.length && !node && !normalizedESModules && !ignoreBrowserslistConfig) {
    // No explicit targets — use project browserslist config if present (not defaults)
    const path = configPath || '.';
    if (browserslist.findConfig(path)) {
      list.push(...browserslist(undefined, { path }).map(it => it.split(' ')));
    }
  }

  if (normalizedESModules === true) {
    list.push(...entries(external.modules));
  }

  if (node) {
    list.push(['node', node === 'current' ? process.versions.node : node]);
  }

  const normalized = list.map(([engine, version]) => {
    if (hasOwn(browserslist.aliases, engine)) {
      engine = browserslist.aliases[engine];
    }
    if (aliases.has(engine)) {
      engine = aliases.get(engine);
    }
    return [engine, String(version)];
  }).filter(([engine]) => {
    return validTargets.has(engine);
  }).sort(([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });

  const reduced = new Map();

  for (const [engine, version] of normalized) {
    if (!reduced.has(engine) || compare(version, '<=', reduced.get(engine))) {
      reduced.set(engine, version);
    }
  }

  if (normalizedESModules === 'intersect') {
    const modulesData = external.modules;
    for (const [engine, version] of reduced) {
      if (hasOwn(modulesData, engine)) {
        if (compare(modulesData[engine], '>', version)) {
          reduced.set(engine, modulesData[engine]);
        }
      } else {
        reduced.delete(engine);
      }
    }
  }

  return reduced;
}
