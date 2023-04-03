var parent = require('./3');

require('../proposals/array-is-template-object');
require('../proposals/async-explicit-resource-management');
require('../proposals/async-iterator-helpers');
require('../proposals/decorator-metadata-v2');
require('../proposals/iterator-range');
require('../proposals/map-upsert-stage-2');
require('../proposals/string-dedent');
require('../proposals/symbol-predicates');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping');
require('../proposals/decorators');
require('../proposals/decorator-metadata');
require('../proposals/iterator-helpers');
require('../proposals/set-methods');
require('../proposals/using-statement');

module.exports = parent;
