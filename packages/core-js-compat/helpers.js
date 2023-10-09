'use strict';
const SEMVER = /(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/;
// eslint-disable-next-line redos/no-vulnerable -- ok
const SEMVER_WITH_REQUIRED_MINOR = /(?<major>\d+)\.(?<minor>\d+)(?:\.(?<patch>\d+))?/;

class SemVer {
  constructor(input, requiredMinor) {
    const match = (requiredMinor ? SEMVER_WITH_REQUIRED_MINOR : SEMVER).exec(input);
    if (!match) {
      let message = `Invalid version: ${ input }`;
      if (requiredMinor && SEMVER.test(input)) message += ', minor component required';
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

function semver(input, requiredMinor) {
  return input instanceof SemVer ? input : new SemVer(input, requiredMinor);
}

function compare($a, operator, $b) {
  const a = semver($a);
  const b = semver($b);
  for (const component of ['major', 'minor', 'patch']) {
    if (a[component] < b[component]) return operator === '<' || operator === '<=' || operator === '!=';
    if (a[component] > b[component]) return operator === '>' || operator === '>=' || operator === '!=';
  } return operator === '==' || operator === '<=' || operator === '>=';
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
  semver,
  sortObjectByKey,
};
