'use strict';
const { compare, intersection, normalizeCoreJSVersion } = require('./helpers');
const entriesByVersions = require('./entries-by-versions');
const allEntries = require('./entries');

const allEntriesList = Object.keys(allEntries);

module.exports = function (raw) {
  const corejs = normalizeCoreJSVersion(raw);
  const result = Object.entries(entriesByVersions).flatMap(([version, entries]) => {
    return compare(version, '<=', corejs) ? entries : [];
  });
  return intersection(result, allEntriesList);
};
