'use strict';
function semver(input) {
  if (input instanceof semver) return input;
  // eslint-disable-next-line new-cap -- ok
  if (!(this instanceof semver)) return new semver(input);
  const match = /(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?/.exec(input);
  if (!match) throw new TypeError(`Invalid version: ${ input }`);
  const { major, minor, patch } = match.groups;
  this.major = parseInt(major, 10);
  this.minor = minor ? parseInt(minor, 10) : 0;
  this.patch = patch ? parseInt(patch, 10) : 0;
}

semver.prototype.toString = function () {
  return `${ this.major }.${ this.minor }.${ this.patch }`;
};

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
