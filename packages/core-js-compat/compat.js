'use strict';
const { compare, filterOutStabilizedProposals, has, intersection } = require('./helpers');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const allModules = require('./modules');
const targetsParser = require('./targets-parser');

const actualModules = entries['core-js/actual'];

function throwInvalidFilter(filter) {
  throw new TypeError(`Specified invalid module name or pattern: ${ filter }`);
}

function atLeastSomeModules(modules, filter) {
  if (!modules.length) throwInvalidFilter(filter);
  return modules;
}

function getModules(filter) {
  if (typeof filter == 'string') {
    if (has(entries, filter)) return entries[filter];
    return atLeastSomeModules(allModules.filter(it => it.startsWith(filter)), filter);
  }
  if (filter instanceof RegExp) return atLeastSomeModules(allModules.filter(it => filter.test(it)), filter);
  throwInvalidFilter(filter);
}

function normalizeModules(option) {
  // TODO: use `.flatMap` in core-js@4
  return new Set(Array.isArray(option) ? [].concat(...option.map(getModules)) : getModules(option));
}

function checkModule(name, targets) {
  const result = {
    required: !targets,
    targets: {},
  };

  if (!targets) return result;

  const requirements = data[name];

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
  exclude = [],
  targets = null,
  version = null,
  inverse = false,
} = {}) {
  if (modules === null || modules === undefined) modules = filter;
  inverse = !!inverse;

  const parsedTargets = targets ? targetsParser(targets) : null;

  const result = {
    list: [],
    targets: {},
  };

  exclude = normalizeModules(exclude);

  modules = modules ? [...normalizeModules(modules)] : actualModules;

  if (exclude.size) modules = modules.filter(it => !exclude.has(it));

  modules = intersection(modules, version ? getModulesListForTargetVersion(version) : allModules);

  if (!inverse) modules = filterOutStabilizedProposals(modules);

  for (const key of modules) {
    const check = checkModule(key, parsedTargets);

    if (check.required ^ inverse) {
      result.list.push(key);
      result.targets[key] = check.targets;
    }
  }

  return result;
};
