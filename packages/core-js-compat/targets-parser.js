'use strict';
const browserslist = require('browserslist');
const { compare, has } = require('./helpers');
const external = require('./external');

const aliases = new Map([
  ['and_chr', 'chrome'],
  ['and_ff', 'firefox'],
  ['ie_mob', 'ie'],
  ['ios_saf', 'ios'],
  ['op_mob', 'opera_mobile'],
]);

const validTargets = new Set([
  'android',
  'chrome',
  'edge',
  'electron',
  'firefox',
  'ie',
  'ios',
  'node',
  'opera',
  'opera_mobile',
  'phantom',
  'safari',
  'samsung',
]);

function browserslistEntries(targets) {
  return browserslist(targets).map(it => it.split(' '));
}

module.exports = function (targets) {
  let list;
  if (typeof targets == 'object' && !Array.isArray(targets)) {
    const { esmodules, browsers, node, ...rest } = targets;
    list = Object.entries(rest);
    if (esmodules) {
      list = list.concat(Object.entries(external.modules));
    }
    if (browsers) {
      list = list.concat(browserslistEntries(browsers));
    }
    if (node) {
      list.push(['node', node === 'current' ? process.versions.node : node]);
    }
  } else list = browserslistEntries(targets);

  const normalized = list.map(([engine, version]) => {
    if (has(browserslist.aliases, engine)) {
      engine = browserslist.aliases[engine];
    }
    if (aliases.has(engine)) {
      engine = aliases.get(engine);
    } else if (engine === 'android' && compare(version, '>', '4.4.4')) {
      engine = 'chrome';
    }
    return [engine, String(version)];
  }).filter(([engine]) => {
    return validTargets.has(engine);
  }).sort(([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });

  const reducedByMinVersion = new Map();
  for (const [engine, version] of normalized) {
    if (!reducedByMinVersion.has(engine) || compare(version, '<=', reducedByMinVersion.get(engine))) {
      reducedByMinVersion.set(engine, version);
    }
  }

  return reducedByMinVersion;
};
