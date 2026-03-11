'use strict';
const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getEntriesListForTargetVersion = require('./get-entries-list-for-target-version');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const knownBuiltInReturnTypes = require('./known-built-in-return-types');
const modules = require('./modules');

module.exports = Object.assign(compat, {
  compat,
  data,
  entries,
  getEntriesListForTargetVersion,
  getModulesListForTargetVersion,
  knownBuiltInReturnTypes,
  modules,
});
