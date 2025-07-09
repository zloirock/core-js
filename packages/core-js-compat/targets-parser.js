'use strict';
const browserslist = require('browserslist');
const { compare } = require('./helpers');
const external = require('./external');

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

module.exports = function (targets) {
  const { browsers, esmodules, node, ...rest } = (typeof targets != 'object' || isArray(targets))
    ? { browsers: targets } : toLowerKeys(targets);

  const list = entries(rest);

  const normalizedESModules = esmodules === 'intersect' ? 'intersect' : !!esmodules;

  if (browsers && normalizedESModules !== true) {
    if (typeof browsers == 'string' || isArray(browsers)) {
      list.push(...browserslist(browsers).map(it => it.split(' ')));
    } else {
      list.push(...entries(browsers));
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
  const operator = normalizedESModules === 'intersect' ? '>' : '<=';
  for (const [engine, version] of normalized) {
    if (!reduced.has(engine) || compare(version, operator, reduced.get(engine))) {
      reduced.set(engine, version);
    }
  }

  return reduced;
};
