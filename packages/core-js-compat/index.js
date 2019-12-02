'use strict';
const browserslist = require('browserslist');
const { compare, normalizeModulesList } = require('./helpers');
const data = require('./data');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const has = Function.call.bind({}.hasOwnProperty);

const mapping = new Map([
  ['and_chr', 'chrome'],
  ['and_ff', 'firefox'],
  ['ie_mob', 'ie'],
  ['ios_saf', 'ios'],
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
  'phantom',
  'safari',
  'samsung',
]);

function normalizeBrowsersList(list) {
  return list.map(it => {
    let [engine, version] = it.split(' ');
    if (mapping.has(engine)) engine = mapping.get(engine);
    else if (engine === 'android' && compare(version, '>', '4.4.4')) engine = 'chrome';
    return [engine, version];
  }).filter(([engine]) => validTargets.has(engine));
}

function reduceByMinVersion(list) {
  const targets = new Map();
  for (const [engine, version] of list) {
    if (!targets.has(engine) || compare(version, '<=', targets.get(engine))) {
      targets.set(engine, version);
    }
  }
  return targets;
}

function checkModule(name, targets) {
  if (!has(data, name)) throw new TypeError(`Incorrect module: ${ name }`);
  const requirements = data[name];
  const result = {
    required: false,
    targets: {},
  };
  for (const [engine, version] of targets) {
    if (!has(requirements, engine) || compare(version, '<', requirements[engine])) {
      result.required = true;
      result.targets[engine] = version;
    }
  }
  return result;
}

function compat({ targets, filter, version }) {
  const list = browserslist(targets);
  const engines = normalizeBrowsersList(list);
  const reducedTargets = reduceByMinVersion(engines);

  const result = {
    list: [],
    targets: {},
  };

  let modules = Array.isArray(filter) ? filter : Object.keys(data);

  if (filter instanceof RegExp) modules = modules.filter(it => filter.test(it));
  else if (typeof filter == 'string') modules = modules.filter(it => it.startsWith(filter));

  if (version) {
    modules = normalizeModulesList(modules, getModulesListForTargetVersion(version));
  }

  modules.forEach(key => {
    const check = checkModule(key, reducedTargets);
    if (check.required) {
      result.list.push(key);
      result.targets[key] = check.targets;
    }
  });

  return result;
}

module.exports = compat;
module.exports.compat = compat;
module.exports.getModulesListForTargetVersion = getModulesListForTargetVersion;
