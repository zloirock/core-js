var parent = require('./3');

require('../proposals/array-is-template-object');
require('../proposals/decorator-metadata');
require('../proposals/explicit-resource-management');
require('../proposals/map-upsert-stage-2');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping');
require('../proposals/decorators');
require('../proposals/iterator-helpers');
require('../proposals/set-methods');
require('../proposals/using-statement');

module.exports = parent;
