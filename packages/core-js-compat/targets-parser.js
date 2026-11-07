'use strict';
const browserslist = require('browserslist');
const { compare, has } = require('./helpers');
const external = require('./external');

const aliases = new Map([
  ['and_chr', 'chrome-android'],
  ['and_ff', 'firefox-android'],
  ['ie_mob', 'ie'],
  ['ios_saf', 'ios'],
  ['oculus', 'quest'],
  ['op_mob', 'opera-android'],
  // TODO: Remove from `core-js@4`
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
  'phantom',
  'quest',
  'react-native',
  'rhino',
  'safari',
  'samsung',
]);

// TODO: Drop the fallback in core-js@4
const entries = Object.entries || function (object) {
  return Object.keys(object).map(key => [key, object[key]]);
}

function toLowerKeys(object) {
  return entries(object).reduce((accumulator, [key, value]) => {
    accumulator[key.toLowerCase()] = value;
    return accumulator;
  }, {});
}

module.exports = function (targets) {
  targets = (typeof targets != 'object' || Array.isArray(targets))
    ? { browsers: targets } : toLowerKeys(targets);

  const { browsers, esmodules, node } = targets;

  // TODO: Use object rest in core-js@4
  const list = entries(targets).filter(([key]) => key !== 'browsers' && key !== 'esmodules' && key !== 'node');

  const normalizedESModules = esmodules === 'intersect' ? 'intersect' : !!esmodules;

  if (browsers && normalizedESModules !== true) {
    if (typeof browsers == 'string' || Array.isArray(browsers)) {
      list.push(...browserslist(browsers, { mobileToDesktop: true }).map(it => it.split(' ')));
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
    if (has(browserslist.aliases, engine)) {
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

  for (const [engine, value] of normalized) {
    // Treat TP and latest as newer than known numeric releases.
    const version = /^(?:latest|tp)$/i.test(value) ? '999999' : value;
    if (!/^\d/.test(version)) {
      throw new RangeError(`Invalid version "${ version }" for "${ engine }"`);
    }
    if (!reduced.has(engine) || compare(version, '<=', reduced.get(engine))) {
      reduced.set(engine, version);
    }
  }

  if (normalizedESModules === 'intersect') {
    const modulesData = external.modules;
    for (const [engine, version] of reduced) {
      if (has(modulesData, engine)) {
        if (compare(modulesData[engine], '>', version)) {
          reduced.set(engine, modulesData[engine]);
        }
      } else {
        reduced.delete(engine);
      }
    }
  }

  return reduced;
};
