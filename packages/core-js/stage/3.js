'use strict';
var parent = require('./4');

require('../proposals/array-buffer-base64');
require('../proposals/decorator-metadata-v2');
require('../proposals/json-parse-with-source');
require('../proposals/math-sum');
// TODO: Obsolete versions, remove from `core-js@4`
require('../proposals/iterator-helpers-stage-3');

module.exports = parent;
