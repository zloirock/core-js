'use strict';
const { coerce, lt, lte } = require('semver');
const browserslist = require('browserslist');
const data = require('./data');
const has = Function.call.bind({}.hasOwnProperty);

const mapping = new Map([
  ['ios_saf', 'ios'],
  ['and_chr', 'chrome'],
  ['and_ff', 'firefox'],
]);

const validTargets = new Set([
  'ie',
  'chrome',
  'opera',
  'node',
  'android',
  'firefox',
  'safari',
  'edge',
  'samsung',
  'ios',
]);

function coercedLte(a, b) {
  return lte(coerce(a), coerce(b));
}

function coercedLt(a, b) {
  return lt(coerce(a), coerce(b));
}

function normalizeBrowsersList(list) {
  return list.map(it => {
    let [engine, version] = it.split(' ');
    if (mapping.has(engine)) engine = mapping.get(engine);
    else if (engine === 'android' && !coercedLte(version, '4.4.4')) engine = 'chrome';
    return [engine, version];
  }).filter(([engine]) => validTargets.has(engine));
}

function reduceByMinVersion(list) {
  const targets = new Map();
  for (const [engine, version] of list) {
    if (!targets.has(engine) || coercedLte(version, targets.get(engine))) {
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
    if (!has(requirements, engine) || coercedLt(version, requirements[engine])) {
      result.required = true;
      result.targets[engine] = version;
    }
  }
  return result;
}

module.exports = function ({ targets, filter }) {
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

  modules.forEach(key => {
    const check = checkModule(key, reducedTargets);
    if (check.required) {
      result.list.push(key);
      result.targets[key] = check.targets;
    }
  });

  return result;
};
