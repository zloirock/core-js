var parent = require('./3');

require('../proposals/array-grouping-v2');
require('../proposals/array-is-template-object');
require('../proposals/async-explicit-resource-management');
require('../proposals/async-iterator-helpers');
require('../proposals/iterator-range');
require('../proposals/map-upsert-stage-2');
require('../proposals/promise-with-resolvers');
require('../proposals/string-dedent');
require('../proposals/symbol-predicates-v2');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping');
require('../proposals/decorators');
require('../proposals/decorator-metadata');
require('../proposals/iterator-helpers');
require('../proposals/set-methods');
require('../proposals/symbol-predicates');
require('../proposals/using-statement');

module.exports = parent;
