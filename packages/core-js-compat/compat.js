'use strict';
const { compare, filterOutStabilizedProposals, has, intersection } = require('./helpers');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const allModules = require('./modules');
const targetsParser = require('./targets-parser');

function getModules(filter) {
  if (typeof filter == 'string') {
    if (has(entries, filter)) return entries[filter];
    return allModules.filter(it => it.startsWith(filter));
  } else if (filter instanceof RegExp) return allModules.filter(it => filter.test(it));
  throw TypeError('Wrong filter!');
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

module.exports = function ({
  filter = null, // TODO: Obsolete, remove from `core-js@4`
  modules = null,
  targets = null,
  version = null,
} = {}) {
  if (modules == null) modules = filter;

  const parsedTargets = targets ? targetsParser(targets) : null;

  const result = {
    list: [],
    targets: {},
  };

  let $modules;
  if (modules) {
    const list = Array.isArray(modules) ? modules : [modules];
    $modules = [...new Set([].concat.apply([], list.map(getModules)))];
  } else $modules = allModules;

  if (version) {
    $modules = intersection($modules, getModulesListForTargetVersion(version));
  }

  $modules = filterOutStabilizedProposals($modules);

  for (const key of $modules) {
    const check = parsedTargets ? checkModule(key, parsedTargets) : {
      required: true,
      targets: {},
    };

    if (check.required) {
      result.list.push(key);
      result.targets[key] = check.targets;
    }
  }

  return result;
};
