'use strict';
const SEMVER = /(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/;
// eslint-disable-next-line redos/no-vulnerable, sonarjs/slow-regex -- ok
const SEMVER_WITH_REQUIRED_MINOR_COMPONENT = /(?<major>\d+)\.(?<minor>\d+)(?:\.(?<patch>\d+))?/;

class SemVer {
  constructor(input, requiredMinorComponent) {
    const match = (requiredMinorComponent ? SEMVER_WITH_REQUIRED_MINOR_COMPONENT : SEMVER).exec(input);
    if (!match) {
      let message = `Invalid version: ${ input }`;
      if (requiredMinorComponent && SEMVER.test(input)) message += ', minor component required';
      throw new TypeError(message);
    }
    const { major, minor, patch } = match.groups;
    this.major = +major;
    this.minor = +minor || 0;
    this.patch = +patch || 0;
  }
  toString() {
    return `${ this.major }.${ this.minor }.${ this.patch }`;
  }
}

function semver(input, requiredMinorComponent) {
  return input instanceof SemVer ? input : new SemVer(input, requiredMinorComponent);
}

function compare($a, operator, $b) {
  const a = semver($a);
  const b = semver($b);
  for (const component of ['major', 'minor', 'patch']) {
    if (a[component] < b[component]) return operator === '<' || operator === '<=' || operator === '!=';
    if (a[component] > b[component]) return operator === '>' || operator === '>=' || operator === '!=';
  } return operator === '==' || operator === '<=' || operator === '>=';
}

function normalizeCoreJSVersion(raw) {
  if (!['string', 'object'].includes(typeof raw)) {
    throw new TypeError('`core-js` version should be specified as a SemVer string with minor component');
  }

  let requiredMinorComponent = true;

  if (raw === 'node_modules') {
    // eslint-disable-next-line node/global-require -- ok
    raw = require('core-js/package.json').version;
  } else if (raw === 'package.json') {
    requiredMinorComponent = false;
    // eslint-disable-next-line node/global-require, import/no-dynamic-require -- ok
    const { dependencies, devDependencies, peerDependencies } = require(`${ process.cwd() }/package.json`);
    raw = dependencies?.['core-js'] ?? devDependencies?.['core-js'] ?? peerDependencies?.['core-js'];
    if (raw === undefined) {
      throw new TypeError('`core-js` is not specified in your `package.json`');
    }
  }

  const version = semver(raw, requiredMinorComponent);

  if (version.major !== 4) {
    throw new RangeError('This version of `@core-js/compat` works only with `core-js@4`');
  }

  return version;
}

function filterOutStabilizedProposals(modules) {
  const modulesSet = new Set(modules);

  for (const $module of modulesSet) {
    if ($module.startsWith('esnext.') && modulesSet.has($module.replace(/^esnext\./, 'es.'))) {
      modulesSet.delete($module);
    }
  }

  return [...modulesSet];
}

function intersection(list, order) {
  const set = list instanceof Set ? list : new Set(list);
  return order.filter(name => set.has(name));
}

function sortObjectByKey(object, fn) {
  return Object.keys(object).sort(fn).reduce((memo, key) => {
    memo[key] = object[key];
    return memo;
  }, {});
}

module.exports = {
  compare,
  filterOutStabilizedProposals,
  intersection,
  normalizeCoreJSVersion,
  semver,
  sortObjectByKey,
};
