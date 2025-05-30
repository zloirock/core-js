'use strict';
var parent = require('./2.7');

require('../proposals/array-is-template-object');
require('../proposals/async-iterator-helpers');
require('../proposals/data-view-get-set-uint8-clamped');
require('../proposals/extractors');
require('../proposals/iterator-range');
require('../proposals/string-dedent');
require('../proposals/symbol-predicates-v2');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping');
require('../proposals/async-explicit-resource-management');
require('../proposals/decorators');
require('../proposals/decorator-metadata');
require('../proposals/iterator-helpers');
require('../proposals/joint-iteration');
require('../proposals/map-upsert-stage-2');
require('../proposals/math-clamp');
require('../proposals/set-methods');
require('../proposals/symbol-predicates');
require('../proposals/using-statement');

module.exports = parent;
