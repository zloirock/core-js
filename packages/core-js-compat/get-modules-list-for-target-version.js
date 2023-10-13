'use strict';
const { compare, intersection, semver } = require('./helpers');
const modulesByVersions = require('./modules-by-versions');
const modules = require('./modules');

module.exports = function (raw) {
  if (!['string', 'object'].includes(typeof raw)) {
    throw new TypeError('`core-js` version should be specified as a SemVer string with minor component');
  }
  const corejs = semver(raw, true);
  if (corejs.major !== 4) {
    throw new RangeError('This version of `@core-js/compat` works only with `core-js@4`');
  }
  const result = [];
  for (const version of Object.keys(modulesByVersions)) {
    if (compare(version, '<=', corejs)) {
      result.push(...modulesByVersions[version]);
    }
  }
  return intersection(result, modules);
};
