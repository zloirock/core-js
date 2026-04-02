import { compare, filterOutStabilizedProposals, intersection } from './helpers.js';
import data from './data.json' with { type: 'json' };
import externalData from './external.json' with { type: 'json' };
import entries from './entries.json' with { type: 'json' };
import getModulesListForTargetVersion from './get-modules-list-for-target-version.js';
import allModules from './modules.json' with { type: 'json' };
import targetsParser from './targets-parser.js';

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

export default function ({
  modules = null,
  exclude = [],
  targets = null,
  configPath,
  ignoreBrowserslistConfig,
  version = null,
  inverse = false,
  __external: external = false,
} = {}) {
  const parsed = targets
    ? targetsParser(targets)
    : targetsParser({ configPath, ignoreBrowserslistConfig });
  const parsedTargets = parsed.size ? parsed : null;

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
}
