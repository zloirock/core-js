'use strict';
var parent = require('./3');

require('../proposals/array-buffer-base64');
require('../proposals/array-is-template-object');
require('../proposals/async-iterator-helpers');
require('../proposals/iterator-range');
require('../proposals/map-upsert-stage-2');
require('../proposals/regexp-escaping');
require('../proposals/string-dedent');
require('../proposals/symbol-predicates-v2');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/async-explicit-resource-management');
require('../proposals/decorators');
require('../proposals/using-statement');

module.exports = parent;
