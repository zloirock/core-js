'use strict';
const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getEntriesListForTargetVersion = require('./get-entries-list-for-target-version');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

module.exports = Object.assign(compat, {
  compat,
  data,
  entries,
  getEntriesListForTargetVersion,
  getModulesListForTargetVersion,
  modules,
});
