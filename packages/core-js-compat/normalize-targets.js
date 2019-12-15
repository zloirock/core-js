'use strict';
const browserslist = require('browserslist');
const { compare } = require('./helpers');
const external = require('./external');

const mapping = new Map([
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

module.exports = function(targets) {
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
    if (mapping.has(engine)) {
      engine = mapping.get(engine);
    } else if (engine === 'android' && compare(version, '>', '4.4.4')) {
      engine = 'chrome';
    }
    return [engine, String(version)];
  }).filter(([engine]) => validTargets.has(engine));

  const reducedByMinVersion = new Map();
  for (const [engine, version] of normalized) {
    if (!reducedByMinVersion.has(engine) || compare(version, '<=', reducedByMinVersion.get(engine))) {
      reducedByMinVersion.set(engine, version);
    }
  }

  return reducedByMinVersion;
};
