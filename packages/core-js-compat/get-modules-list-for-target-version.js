'use strict';
const { compare, intersection, normalizeCoreJSVersion } = require('./helpers');
const modulesByVersions = require('./modules-by-versions');
const allModules = require('./modules');

module.exports = function (raw) {
  const corejs = normalizeCoreJSVersion(raw);
  const result = Object.entries(modulesByVersions).flatMap(([version, modules]) => {
    return compare(version, '<=', corejs) ? modules : [];
  });
  return intersection(result, allModules);
};
