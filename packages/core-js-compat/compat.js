'use strict';
const { compare, filterOutStabilizedProposals, intersection } = require('./helpers');
const data = require('./data');
const externalData = require('./external');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const allModules = require('./modules');
const targetsParser = require('./targets-parser');

const { actual } = entries;

const allModulesSet = new Set(allModules);

const { hasOwn } = Object;

function throwInvalidFilter(filter) {
  throw new TypeError(`Specified invalid module name or pattern: ${ filter }`);
}

function getModules(filter) {
  if (typeof filter == 'string') {
    if (allModulesSet.has(filter)) return [filter];
    if (hasOwn(entries, filter)) return entries[filter];
  } else if (filter instanceof RegExp) {
    const modules = allModules.filter(it => filter.test(it));
    if (!modules.length) throwInvalidFilter(filter);
    return modules;
  }
  throwInvalidFilter(filter);
}

function normalizeModules(option) {
  return new Set(Array.isArray(option) ? option.flatMap(getModules) : getModules(option));
}

function checkModule(name, targets, external) {
  const result = {
    required: !targets,
    targets: {},
  };

  if (!targets) return result;

  const requirements = (external ? externalData : data)[name];

  for (const [engine, version] of targets) {
    if (!hasOwn(requirements, engine) || compare(version, '<', requirements[engine])) {
      result.required = true;
      result.targets[engine] = version;
    }
  }

  return result;
}

module.exports = function ({
  modules = null,
  exclude = [],
  targets = null,
  version = null,
  inverse = false,
  __external: external = false,
} = {}) {
  const parsedTargets = targets ? targetsParser(targets) : null;

  const result = {
    list: [],
    targets: {},
  };

  if (!external) {
    inverse = !!inverse;

    exclude = normalizeModules(exclude);

    modules = modules ? [...normalizeModules(modules)] : actual;

    if (exclude.size) modules = modules.filter(it => !exclude.has(it));

    modules = intersection(modules, version ? getModulesListForTargetVersion(version) : allModules);

    if (!inverse) modules = filterOutStabilizedProposals(modules);
  }

  for (const key of modules) {
    const check = checkModule(key, parsedTargets, external);

    if (check.required ^ inverse) {
      result.list.push(key);
      result.targets[key] = check.targets;
    }
  }

  return result;
};
