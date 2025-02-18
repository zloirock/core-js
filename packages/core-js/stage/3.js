'use strict';
var parent = require('./4');

require('../proposals/array-buffer-base64');
require('../proposals/array-from-async-stage-2');
require('../proposals/decorator-metadata-v2');
require('../proposals/explicit-resource-management');
require('../proposals/is-error');
require('../proposals/json-parse-with-source');
require('../proposals/math-sum');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/array-grouping-stage-3');
require('../proposals/array-grouping-stage-3-2');
require('../proposals/change-array-by-copy');
require('../proposals/iterator-helpers-stage-3');

module.exports = parent;
