'use strict';
const { compare, normalizeModulesList, semver } = require('./helpers');
const modulesByVersions = require('./modules-by-versions');

module.exports = function (raw) {
  const corejs = semver(raw);
  if (corejs.major !== 3) {
    throw RangeError('This version of `core-js-compat` works only with `core-js@3`.');
  }
  const result = [];
  for (const version of Object.keys(modulesByVersions)) {
    if (compare(version, '<=', corejs)) {
      result.push(...modulesByVersions[version]);
    }
  }
  return normalizeModulesList(result);
};
